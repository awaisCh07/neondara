
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NeondaraEntry, NeondaraEntryDTO, Person } from '@/lib/types';
import { NeondaraEntrySheet } from '@/components/neondara-entry-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NeondaraTimeline } from './neondara-timeline';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';
import { useLanguage } from './language-provider';
import { AppLayout } from './layout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export function LedgerView() {
  const [entries, setEntries] = useState<NeondaraEntry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NeondaraEntry | undefined>(undefined);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch people
      const peopleQuery = query(collection(db, "people"), where("userId", "==", user.uid));
      const peopleSnapshot = await getDocs(peopleQuery);
      const peopleData = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      setPeople(peopleData);

      // Fetch entries
      const entriesQuery = query(collection(db, "neondara_entries"), where("userId", "==", user.uid), orderBy("date", "desc"));
      const entriesSnapshot = await getDocs(entriesQuery);
      
      const entriesData = await Promise.all(entriesSnapshot.docs.map(async docSnapshot => {
        const data = docSnapshot.data() as NeondaraEntryDTO;
        let personName = 'Unknown';
        // Find personName from the already fetched people data
        const person = peopleData.find(p => p.id === data.personId);
        if (person) {
           personName = person.name;
        } else if(data.personId) {
            // Fallback to fetch the person if not in the list (should be rare)
            const personRef = doc(db, 'people', data.personId);
            const personSnap = await getDoc(personRef);
            if(personSnap.exists()) {
                personName = personSnap.data().name;
            }
        }

        return {
          id: docSnapshot.id,
          ...data,
          person: personName, // This is now correctly resolved
          date: data.date.toDate(),
        } as NeondaraEntry;
      }));

      setEntries(entriesData);

    } catch (error) {
      console.error("Error fetching data: ", error);
      toast({
        title: t('error'),
        description: "Failed to fetch ledger data.",
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
    fetchData();
  }, [user, authLoading, router]);


  const handleAddEntry = async (newEntry: Omit<NeondaraEntry, 'id' | 'userId' | 'person'>) => {
    if (!user) {
        toast({ title: t('error'), description: "You must be logged in to add an entry.", variant: "destructive" });
        return;
    }
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
      fetchData(); // Refetch all data
    } catch (error) {
      console.error("Error adding entry: ", error);
      toast({
        title: t('error'),
        description: "Failed to add new entry.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEntry = async (updatedEntry: Omit<NeondaraEntry, 'userId' | 'person'>) => {
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
      fetchData(); // Refetch all data
    } catch (error) {
      console.error("Error updating entry: ", error);
      toast({
        title: t('error'),
        description: "Failed to update entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, "neondara_entries", entryId));
      toast({
        title: t('success'),
        description: t('entryDeletedSuccess'),
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting entry: ", error);
      toast({
        title: t('error'),
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenSheet = (entry?: Omit<NeondaraEntry, 'userId'>) => {
    setEditingEntry(entry as NeondaraEntry | undefined);
    setIsSheetOpen(true);
  }

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
            escapeCsvCell(entry.person),
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
        link.setAttribute("download", `neondara_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
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
  
  return (
    <AppLayout onExport={handleExportData}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-headline">{t('ledgerHistory')}</h1>
                <Button size="sm" onClick={() => handleOpenSheet()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                    {t('addEntry')}
                </Button>
            </div>
            
            <NeondaraTimeline 
                entries={entries} 
                people={people} 
                onEdit={handleOpenSheet} 
                onDelete={handleDeleteEntry}
            />
        
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
