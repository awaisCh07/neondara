
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from './auth-provider';
import type { NeondaraEntry, NeondaraEntryDTO, Person, RelationType } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, orderBy, getDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-provider';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';


type EntryInput = Omit<NeondaraEntry, 'id' | 'userId' | 'person'>;
type EntryUpdate = Omit<NeondaraEntry, 'userId' | 'person'>;
type PersonInput = { name: string; relation: string; };
type PersonUpdate = Person;


interface DataContextType {
  entries: NeondaraEntry[];
  people: Person[];
  loading: boolean;
  addEntry: (entry: EntryInput) => Promise<void>;
  updateEntry: (entry: EntryUpdate) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addPerson: (person: PersonInput) => Promise<void>;
  updatePerson: (person: PersonUpdate) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  getPersonById: (id: string) => Person | undefined;
  exportData: (options?: { personId?: string }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<NeondaraEntry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      const peopleQuery = query(collection(db, "people"), where("userId", "==", currentUser.uid));
      const peopleSnapshot = await getDocs(peopleQuery);
      const peopleData = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      
      const peopleMap = new Map(peopleData.map(p => [p.id, p.name]));
      setPeople(peopleData);

      const entriesQuery = query(collection(db, "neondara_entries"), where("userId", "==", currentUser.uid), orderBy("date", "desc"));
      const entriesSnapshot = await getDocs(entriesQuery);
      
      const entriesData = entriesSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data() as NeondaraEntryDTO;
        return {
          id: docSnapshot.id,
          ...data,
          person: peopleMap.get(data.personId) || 'Unknown',
          date: data.date.toDate(),
        } as NeondaraEntry;
      });

      setEntries(entriesData);

    } catch (error) {
      console.error("Error fetching data: ", error);
      toast({ title: t('error'), description: "Failed to fetch history data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (user) {
      fetchData(user);
    } else {
      setLoading(false);
      setEntries([]);
      setPeople([]);
    }
  }, [user, fetchData]);

  const addEntry = async (newEntryData: EntryInput) => {
    if (!user) return;
    try {
        const docRef = await addDoc(collection(db, "neondara_entries"), {
            ...newEntryData,
            userId: user.uid,
            date: Timestamp.fromDate(newEntryData.date),
        });
        
        const personName = people.find(p => p.id === newEntryData.personId)?.name || 'Unknown';
        const newEntry: NeondaraEntry = {
            id: docRef.id,
            userId: user.uid,
            person: personName,
            ...newEntryData,
        };
        setEntries(prev => [newEntry, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));

        toast({ title: t('success'), description: t('entryAddedSuccess') });
    } catch (error) {
        console.error("Error adding entry: ", error);
        toast({ title: t('error'), description: "Failed to add new entry.", variant: "destructive" });
    }
  };
  
  const updateEntry = async (updatedEntryData: EntryUpdate) => {
    if (!user) return;
    const { id, ...dataToUpdate } = updatedEntryData;
    try {
      const entryRef = doc(db, "neondara_entries", id);
      await updateDoc(entryRef, {
        ...dataToUpdate,
        date: Timestamp.fromDate(dataToUpdate.date),
      });

      setEntries(prev => prev.map(e => e.id === id ? {
          ...e,
          ...updatedEntryData,
          person: people.find(p => p.id === updatedEntryData.personId)?.name || 'Unknown',
      } : e));
      
      toast({ title: t('success'), description: t('entryUpdatedSuccess') });
    } catch (error) {
      console.error("Error updating entry: ", error);
      toast({ title: t('error'), description: "Failed to update entry.", variant: "destructive" });
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, "neondara_entries", entryId));
        setEntries(prev => prev.filter(e => e.id !== entryId));
        toast({ title: t('success'), description: t('entryDeletedSuccess') });
    } catch (error) {
        console.error("Error deleting entry: ", error);
        toast({ title: t('error'), description: "Failed to delete entry.", variant: "destructive" });
    }
  };

  const addPerson = async (personData: PersonInput) => {
    if (!user) return;
    
    const existingPerson = people.find(p => p.name.trim().toLowerCase() === personData.name.trim().toLowerCase());
    if (existingPerson) {
        toast({ title: t('error'), description: `A person named "${personData.name}" already exists.`, variant: "destructive" });
        return;
    }

    try {
      const docRef = await addDoc(collection(db, "people"), {
        ...personData,
        userId: user.uid,
      });
      const newPerson: Person = { id: docRef.id, userId: user.uid, ...personData, relation: personData.relation as RelationType };
      setPeople(prev => [...prev, newPerson].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: t('success'), description: `${personData.name} has been added.` });
    } catch (error) {
      console.error("Error adding person: ", error);
      toast({ title: t('error'), description: "Failed to add person.", variant: "destructive" });
    }
  };
  
  const updatePerson = async (personData: PersonUpdate) => {
    if (!user) return;
    
    const existingPerson = people.find(p => p.id !== personData.id && p.name.trim().toLowerCase() === personData.name.trim().toLowerCase());
    if (existingPerson) {
        toast({ title: t('error'), description: `Another person named "${personData.name}" already exists.`, variant: "destructive" });
        return;
    }

    const { id, userId, ...dataToUpdate } = personData;
    try {
      const personRef = doc(db, 'people', id);
      await updateDoc(personRef, dataToUpdate);
      setPeople(prev => prev.map(p => p.id === id ? personData : p).sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: t('success'), description: `${personData.name} has been updated.` });
    } catch (error) {
      console.error("Error updating person: ", error);
      toast({ title: t('error'), description: "Failed to update person.", variant: "destructive" });
    }
  };

  const deletePerson = async (personId: string) => {
    if (!user) return;
    try {
      // Find all entries for this person
      const entriesQuery = query(collection(db, "neondara_entries"), where("userId", "==", user.uid), where("personId", "==", personId));
      const entriesSnapshot = await getDocs(entriesQuery);
      
      const batch = writeBatch(db);

      // Delete all found entries
      entriesSnapshot.forEach(doc => {
          batch.delete(doc.ref);
      });

      // Delete the person document
      const personRef = doc(db, 'people', personId);
      batch.delete(personRef);
      
      // Commit the batch
      await batch.commit();

      // Update local state
      setPeople(prev => prev.filter(p => p.id !== personId));
      setEntries(prev => prev.filter(e => e.personId !== personId));
      
      toast({ title: t('success'), description: "Person and their history have been deleted." });
    } catch (error) {
      console.error("Error deleting person and their history: ", error);
      toast({ title: t('error'), description: "Failed to delete person.", variant: "destructive" });
    }
  };

  const getPersonById = useCallback((id: string) => {
    return people.find(p => p.id === id);
  }, [people]);

  const exportData = useCallback((options?: { personId?: string }) => {
    const dataToExport = options?.personId 
      ? entries.filter(e => e.personId === options.personId)
      : entries;
    
    const person = options?.personId ? getPersonById(options.personId) : null;

    if (dataToExport.length === 0) {
        toast({
            title: "No Data to Export",
            description: "There are no history entries to export.",
            variant: "destructive"
        })
        return;
    }

    const headers = ['DATE', 'PERSON', 'STATUS', 'EVENT', 'GIFT TYPE', 'AMOUNT', 'DESCRIPTION/GIFT', 'NOTES'];
    
    const dataForSheet = dataToExport.map(entry => ({
        DATE: format(entry.date, 'yyyy-MM-dd'),
        PERSON: entry.person,
        STATUS: entry.direction.toUpperCase(),
        EVENT: (entry.event || 'OTHER').toUpperCase(),
        'GIFT TYPE': entry.giftType.toUpperCase(),
        AMOUNT: entry.giftType === 'Money' ? `Rs ${entry.amount}` : entry.amount, // Add Rs prefix and handle non-money amounts
        'DESCRIPTION/GIFT': entry.giftType === 'Gift' && entry.description.startsWith('data:image') ? 'Image Embedded' : entry.description,
        NOTES: entry.notes || '',
    }));

    // Calculate summary
    let moneyGiven = 0;
    let moneyReceived = 0;
    dataToExport.forEach(entry => {
        if (entry.giftType === 'Money' && entry.amount) {
            if (entry.direction === 'given') moneyGiven += entry.amount;
            else moneyReceived += entry.amount;
        }
    });
    const netMoney = moneyGiven - moneyReceived;

    // Create worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataForSheet, { header: headers });

    // Set column widths
    ws['!cols'] = [
        { wch: 12 }, // Date
        { wch: 20 }, // Person
        { wch: 10 }, // Status
        { wch: 15 }, // Event
        { wch: 15 }, // Gift Type
        { wch: 12 }, // Amount
        { wch: 40 }, // Description
        { wch: 40 }, // Notes
    ];

    // Center align amount column
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const cell_address = { c: 5, r: R }; // 5 is the index for Amount column
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (ws[cell_ref]) {
            ws[cell_ref].s = { alignment: { horizontal: "center" } };
        }
    }
     // Add balance summary at the bottom
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 }); // Add a blank row
    XLSX.utils.sheet_add_aoa(ws, [["BALANCE SUMMARY"]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [["Total Given", `Rs ${moneyGiven.toLocaleString()}`]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [["Total Received", `Rs ${moneyReceived.toLocaleString()}`]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [["Net Balance", `Rs ${netMoney.toLocaleString()}`]], { origin: -1 });


    // Create and download workbook
    XLSX.utils.book_append_sheet(wb, ws, "Neondara History");
    
    const filename = person 
      ? `NEONDARA_HISTORY_${person.name}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `NEONDARA_HISTORY_EXPORT_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, filename);

    toast({ title: "Export Successful", description: "Your data has been downloaded as an Excel file." });
}, [entries, getPersonById, t, toast]);


  const value = {
    entries,
    people,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    addPerson,
    updatePerson,
    deletePerson,
    getPersonById,
    exportData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
