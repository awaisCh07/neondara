
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import { NeondaraCard } from '@/components/neondara-card';
import type { NeondaraEntry, NeondaraEntryDTO, Person } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NeondaraEntrySheet } from '@/components/neondara-entry-sheet';
import { useToast } from '@/hooks/use-toast';
import { deleteDoc, addDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useLanguage } from '@/components/language-provider';
import { AppLayout } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';


type PersonDetailPageProps = {
  params: {
    personId: string;
  };
};

export default function PersonDetailPage({ params: { personId } }: PersonDetailPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [entries, setEntries] = useState<NeondaraEntry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [balance, setBalance] = useState({ given: 0, received: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NeondaraEntry | undefined>(undefined);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchPersonAndEntries = async (currentPersonId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch people list for the entry sheet
      const peopleQuery = query(collection(db, "people"), where("userId", "==", user.uid));
      const peopleSnapshot = await getDocs(peopleQuery);
      const peopleData = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      setPeople(peopleData);


      // Fetch person details
      const personRef = doc(db, 'people', currentPersonId);
      const personSnap = await getDoc(personRef);

      if (personSnap.exists() && personSnap.data().userId === user.uid) {
        setPerson({ id: personSnap.id, ...personSnap.data() } as Person);
      } else {
        throw new Error("Person not found or insufficient permissions.");
      }

      // Fetch entries for this person
      const entriesQuery = query(
        collection(db, 'neondara_entries'),
        where('userId', '==', user.uid),
        where('personId', '==', currentPersonId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(entriesQuery);
      const entriesData = querySnapshot.docs.map(doc => {
        const data = doc.data() as NeondaraEntryDTO;
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
        } as NeondaraEntry;
      });
      setEntries(entriesData);

      // Calculate balance
      let given = 0;
      let received = 0;
      entriesData.forEach(entry => {
        if (entry.giftType === 'Money') {
          if (entry.direction === 'given') {
            given += entry.amount || 0;
          } else {
            received += entry.amount || 0;
          }
        }
      });
      setBalance({ given, received, net: given - received });

    } catch (error) {
      console.error("Error fetching person details: ", error);
      toast({
        title: t('error'),
        description: "Failed to fetch person details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (personId) {
        fetchPersonAndEntries(personId as string);
    }
  }, [user, authLoading, personId, router]);


  const handleOpenSheet = (entry?: Omit<NeondaraEntry, 'userId'>) => {
    setEditingEntry(entry as NeondaraEntry | undefined);
    setIsSheetOpen(true);
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, "neondara_entries", entryId));
      toast({
        title: t('success'),
        description: t('entryDeletedSuccess'),
      });
      fetchPersonAndEntries(personId as string); // Refetch to update list and balance
    } catch (error) {
      console.error("Error deleting entry: ", error);
      toast({
        title: t('error'),
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };

  const handleAddEntry = async (newEntry: Omit<NeondaraEntry, 'id' | 'userId'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "neondara_entries"), {
        ...newEntry,
        userId: user.uid,
        date: Timestamp.fromDate(newEntry.date),
      });
      toast({
        title: t('success'),
        description: t('entryAddedSuccess'),
      });
      fetchPersonAndEntries(personId as string);
    } catch (error) {
      console.error("Error adding entry: ", error);
      toast({
        title: t('error'),
        description: "Failed to add new entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateEntry = async (updatedEntry: Omit<NeondaraEntry, 'userId'>) => {
    try {
      const entryRef = doc(db, "neondara_entries", updatedEntry.id);
      const { id, ...dataToUpdate } = updatedEntry;
      await updateDoc(entryRef, {
        ...dataToUpdate,
        date: Timestamp.fromDate(dataToUpdate.date),
      });
      toast({
        title: t('success'),
        description: t('entryUpdatedSuccess'),
      });
      fetchPersonAndEntries(personId as string);
    } catch (error) {
      console.error("Error updating entry: ", error);
      toast({
        title: t('error'),
        description: "Failed to update entry.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    if (entries.length === 0) {
        toast({
            title: "No Data to Export",
            description: "There are no ledger entries to export.",
            variant: "destructive"
        })
        return;
    }

    const headers = [
        'ID', 'Direction', 'Person', 'Date', 'Occasion', 'Gift Type', 'Amount', 'Description/Gift', 'Notes'
    ];
    
    // Using a function to safely handle quotes and commas in data
    const escapeCsvCell = (cellData: any) => {
        if (cellData === null || cellData === undefined) {
            return '';
        }
        const stringData = String(cellData);
        if (stringData.includes('"') || stringData.includes(',') || stringData.includes('\n')) {
            return `"${stringData.replace(/"/g, '""')}"`;
        }
        return stringData;
    };

    const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
            escapeCsvCell(entry.id),
            escapeCsvCell(entry.direction),
            escapeCsvCell(person?.name),
            escapeCsvCell(format(entry.date, 'yyyy-MM-dd')),
            escapeCsvCell(entry.occasion),
            escapeCsvCell(entry.giftType),
            escapeCsvCell(entry.amount),
            escapeCsvCell(entry.description),
            escapeCsvCell(entry.notes),
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `neondara_ledger_export_${person?.name}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    toast({
        title: "Export Successful",
        description: "Your data has been downloaded as a CSV file.",
    })
  };


  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold">{t('personNotFound')}</h2>
          <Link href="/people">
              <Button variant="outline" className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4"/>
                  {t('backToPeople')}
              </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const balanceColor = balance.net === 0 ? 'text-foreground' : balance.net > 0 ? 'text-green-600' : 'text-red-600';
  const balanceText = balance.net === 0 ? t('allSquare') : balance.net > 0 ? `${t('youWillReceive')} ${new Intl.NumberFormat().format(Math.abs(balance.net))}` : `${t('youWillGive')} ${new Intl.NumberFormat().format(Math.abs(balance.net))}`;

  return (
    <AppLayout onExport={handleExportData}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
              <Link href="/people" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
                   <ArrowLeft className="mr-2 h-4 w-4"/>
                  {t('backToPeople')}
              </Link>
               <h1 className="text-4xl font-headline">{person.name}</h1>
               {person.relation && <p className="text-lg text-muted-foreground">{person.relation}</p>}
          </div>

          <Card className="mb-8">
              <CardHeader>
                  <CardTitle>{t('balanceSummary')}</CardTitle>
                  <CardDescription>{t('balanceSummaryDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                          <p className="text-sm text-muted-foreground">{t('totalGiven')}</p>
                          <p className="text-2xl font-bold">{new Intl.NumberFormat().format(balance.given)}</p>
                      </div>
                       <div>
                          <p className="text-sm text-muted-foreground">{t('totalReceived')}</p>
                          <p className="text-2xl font-bold">{new Intl.NumberFormat().format(balance.received)}</p>
                      </div>
                       <div>
                          <p className="text-sm text-muted-foreground">{t('netBalance')}</p>
                          <p className={`text-2xl font-bold ${balanceColor}`}>{balanceText}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-4">{t('transactionHistory')}</h2>
           {entries.length > 0 ? (
              <div className="grid gap-6">
                  {entries.map(entry => {
                      const { userId, ...cardEntry } = entry;
                      return <NeondaraCard key={entry.id} entry={cardEntry} onEdit={handleOpenSheet} onDelete={handleDeleteEntry} personName={person.name}/>
                  })}
              </div>
          ) : (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                  <h3 className="text-xl font-semibold text-foreground">{t('noHistoryYet')}</h3>
                  <p className="mt-2">{t('startTracking')} {person.name}.</p>
              </div>
          )}
          <NeondaraEntrySheet
              isOpen={isSheetOpen}
              onOpenChange={setIsSheetOpen}
              onAddEntry={handleAddEntry}
              onUpdateEntry={handleUpdateEntry}
              entry={editingEntry}
              people={people}
          />
      </div>
    </AppLayout>
  );
}
