
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NiondraEntry, NiondraEntryDTO, Person } from '@/lib/types';
import { NiondraEntrySheet } from '@/components/niondra-entry-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NiondraTimeline } from './niondra-timeline';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';
import { useLanguage } from './language-provider';
import { AppLayout } from './layout';
import { useRouter } from 'next/navigation';

export function LedgerView() {
  const [entries, setEntries] = useState<NiondraEntry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NiondraEntry | undefined>(undefined);
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
      const entriesQuery = query(collection(db, "niondra_entries"), where("userId", "==", user.uid), orderBy("date", "desc"));
      const entriesSnapshot = await getDocs(entriesQuery);
      
      const entriesData = await Promise.all(entriesSnapshot.docs.map(async docSnapshot => {
        const data = docSnapshot.data() as NiondraEntryDTO;
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
          person: personName, // Legacy field for display
          date: data.date.toDate(),
        } as NiondraEntry;
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


  const handleAddEntry = async (newEntry: Omit<NiondraEntry, 'id' | 'userId' | 'person'>) => {
    if (!user) {
        toast({ title: t('error'), description: "You must be logged in to add an entry.", variant: "destructive" });
        return;
    }
    try {
      await addDoc(collection(db, "niondra_entries"), {
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

  const handleUpdateEntry = async (updatedEntry: Omit<NiondraEntry, 'userId' | 'person'>) => {
    try {
      const entryRef = doc(db, "niondra_entries", updatedEntry.id);
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
      await deleteDoc(doc(db, "niondra_entries", entryId));
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
  
  const handleOpenSheet = (entry?: Omit<NiondraEntry, 'userId'>) => {
    setEditingEntry(entry as NiondraEntry | undefined);
    setIsSheetOpen(true);
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-headline">{t('ledgerHistory')}</h1>
                <Button size="sm" onClick={() => handleOpenSheet()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                    {t('addEntry')}
                </Button>
            </div>
            
            <NiondraTimeline 
                entries={entries} 
                people={people} 
                onEdit={handleOpenSheet} 
                onDelete={handleDeleteEntry}
            />
        
            <NiondraEntrySheet
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
