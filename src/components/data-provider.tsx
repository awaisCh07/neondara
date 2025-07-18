
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from './auth-provider';
import type { NeondaraEntry, NeondaraEntryDTO, Person, RelationType, SharedBill, SharedBillDTO } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, orderBy, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './language-provider';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';


type EntryInput = Omit<NeondaraEntry, 'id' | 'userId' | 'person'>;
type EntryUpdate = Omit<NeondaraEntry, 'userId' | 'person'>;
type PersonInput = { name: string; relation: string; };
type PersonUpdate = Person;
type SharedBillInput = Omit<SharedBill, 'id' | 'userId'>;

interface DataContextType {
  entries: NeondaraEntry[];
  people: Person[];
  sharedBills: SharedBill[];
  loading: boolean;
  addEntry: (entry: EntryInput) => Promise<void>;
  updateEntry: (entry: EntryUpdate) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addPerson: (person: PersonInput) => Promise<void>;
  updatePerson: (person: PersonUpdate) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  addSharedBill: (bill: SharedBillInput) => Promise<void>;
  updateSharedBill: (bill: SharedBillInput, id: string) => Promise<void>;
  deleteSharedBill: (id: string) => Promise<void>;
  updateParticipantStatus: (billId: string, personId: string, isPaid: boolean) => Promise<void>;
  getPersonById: (id: string) => Person | undefined;
  exportData: (options?: { personId?: string }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<NeondaraEntry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sharedBills, setSharedBills] = useState<SharedBill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      // Fetch People
      const peopleQuery = query(collection(db, "people"), where("userId", "==", currentUser.uid));
      const peopleSnapshot = await getDocs(peopleQuery);
      const peopleData = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));
      const peopleMap = new Map(peopleData.map(p => [p.id, p.name]));
      setPeople(peopleData);

      // Fetch Neondara Entries
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

      // Fetch Shared Bills
      const billsQuery = query(collection(db, "shared_bills"), where("userId", "==", currentUser.uid), orderBy("date", "desc"));
      const billsSnapshot = await getDocs(billsQuery);
      const billsData = billsSnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data() as SharedBillDTO;
          return {
              id: docSnapshot.id,
              ...data,
              date: data.date.toDate(),
          } as SharedBill;
      });
      setSharedBills(billsData);

    } catch (error) {
      console.error("Error fetching data: ", error);
      toast({ title: t('error'), description: t('fetchDataError'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (user && user.emailVerified) {
      fetchData(user);
    } else {
      setLoading(false);
      setEntries([]);
      setPeople([]);
      setSharedBills([]);
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
        toast({ title: t('error'), description: t('addEntryError'), variant: "destructive" });
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
      toast({ title: t('error'), description: t('updateEntryError'), variant: "destructive" });
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
        toast({ title: t('error'), description: t('deleteEntryError'), variant: "destructive" });
    }
  };

  const addPerson = async (personData: PersonInput) => {
    if (!user) return;
    
    const existingPerson = people.find(p => p.name.trim().toLowerCase() === personData.name.trim().toLowerCase());
    if (existingPerson) {
        toast({ title: t('error'), description: t('personExistsError', {name: personData.name}), variant: "destructive" });
        return;
    }

    try {
      const docRef = await addDoc(collection(db, "people"), {
        ...personData,
        userId: user.uid,
      });
      const newPerson: Person = { id: docRef.id, userId: user.uid, ...personData, relation: personData.relation as RelationType };
      setPeople(prev => [...prev, newPerson].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: t('success'), description: t('personAddedSuccess', {name: personData.name}) });
    } catch (error) {
      console.error("Error adding person: ", error);
      toast({ title: t('error'), description: t('addPersonError'), variant: "destructive" });
    }
  };
  
  const updatePerson = async (personData: PersonUpdate) => {
    if (!user) return;
    
    const existingPerson = people.find(p => p.id !== personData.id && p.name.trim().toLowerCase() === personData.name.trim().toLowerCase());
    if (existingPerson) {
        toast({ title: t('error'), description: t('personExistsError', { name: personData.name }), variant: "destructive" });
        return;
    }

    const { id, userId, ...dataToUpdate } = personData;
    try {
      const personRef = doc(db, 'people', id);
      await updateDoc(personRef, dataToUpdate);
      setPeople(prev => prev.map(p => p.id === id ? personData : p).sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: t('success'), description: t('personUpdatedSuccess', { name: personData.name }) });
    } catch (error) {
      console.error("Error updating person: ", error);
      toast({ title: t('error'), description: t('updatePersonError'), variant: "destructive" });
    }
  };

  const deletePerson = async (personId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);

      // Delete Neondara entries
      const entriesQuery = query(collection(db, "neondara_entries"), where("userId", "==", user.uid), where("personId", "==", personId));
      const entriesSnapshot = await getDocs(entriesQuery);
      entriesSnapshot.forEach(doc => batch.delete(doc.ref));

      // Delete person from shared bills
      const billsQuery = query(collection(db, "shared_bills"), where("userId", "==", user.uid), where("participants", "array-contains", personId));
      const billsSnapshot = await getDocs(billsQuery);
      billsSnapshot.forEach(doc => {
          const bill = doc.data() as SharedBill;
          const updatedParticipants = bill.participants.filter(p => p.personId !== personId);
          if (updatedParticipants.length > 0) {
            batch.update(doc.ref, { participants: updatedParticipants });
          } else {
            batch.delete(doc.ref);
          }
      });
      
      // Delete person doc
      const personRef = doc(db, 'people', personId);
      batch.delete(personRef);
      
      await batch.commit();

      setPeople(prev => prev.filter(p => p.id !== personId));
      setEntries(prev => prev.filter(e => e.personId !== personId));
      setSharedBills(prev => {
        return prev.map(bill => ({
            ...bill,
            participants: bill.participants.filter(p => p.personId !== personId)
        })).filter(bill => bill.participants.length > 0);
      });
      
      toast({ title: t('success'), description: t('personDeletedSuccess') });
    } catch (error) {
      console.error("Error deleting person and their history: ", error);
      toast({ title: t('error'), description: t('deletePersonError'), variant: "destructive" });
    }
  };
  
  const addSharedBill = async (billData: SharedBillInput) => {
      if (!user) return;
      try {
          const docRef = await addDoc(collection(db, 'shared_bills'), {
              ...billData,
              userId: user.uid,
              date: Timestamp.fromDate(billData.date)
          });
          const newBill = { ...billData, id: docRef.id, userId: user.uid };
          setSharedBills(prev => [newBill, ...prev]);
          toast({ title: t('success'), description: t('billAddedSuccess') });
      } catch (error) {
          console.error("Error adding shared bill:", error);
          toast({ title: t('error'), description: t('addBillError'), variant: "destructive" });
      }
  };

  const updateSharedBill = async (billData: SharedBillInput, id: string) => {
      if (!user) return;
      try {
          const billRef = doc(db, 'shared_bills', id);
          await updateDoc(billRef, {
              ...billData,
              date: Timestamp.fromDate(billData.date)
          });
          setSharedBills(prev => prev.map(b => b.id === id ? { ...b, ...billData, id, userId: user.uid } : b));
          toast({ title: t('success'), description: t('billUpdatedSuccess') });
      } catch (error) {
          console.error("Error updating shared bill:", error);
          toast({ title: t('error'), description: t('updateBillError'), variant: "destructive" });
      }
  };

  const deleteSharedBill = async (id: string) => {
      if (!user) return;
      try {
          await deleteDoc(doc(db, 'shared_bills', id));
          setSharedBills(prev => prev.filter(b => b.id !== id));
          toast({ title: t('success'), description: t('billDeletedSuccess') });
      } catch (error) {
          console.error("Error deleting shared bill:", error);
          toast({ title: t('error'), description: t('deleteBillError'), variant: "destructive" });
      }
  };

  const updateParticipantStatus = async (billId: string, personId: string, isPaid: boolean) => {
    if (!user) return;
    const bill = sharedBills.find(b => b.id === billId);
    if (!bill) return;

    const updatedParticipants = bill.participants.map(p => 
        p.personId === personId ? { ...p, isPaid } : p
    );

    try {
        const billRef = doc(db, 'shared_bills', billId);
        await updateDoc(billRef, { participants: updatedParticipants });
        setSharedBills(prev => prev.map(b => b.id === billId ? { ...b, participants: updatedParticipants } : b));
    } catch (error) {
        console.error("Error updating participant status:", error);
        toast({ title: t('error'), description: t('updateParticipantError'), variant: "destructive" });
    }
  };

  const getPersonById = useCallback((id: string) => {
    return people.find(p => p.id === id);
  }, [people]);

  const exportData = useCallback((options?: { personId?: string }) => {
    const toTitleCase = (str: string) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    const dataToExport = options?.personId 
      ? entries.filter(e => e.personId === options.personId)
      : entries;
    
    const person = options?.personId ? getPersonById(options.personId) : null;

    if (dataToExport.length === 0) {
        toast({
            title: t('noDataToExport'),
            description: t('noHistoryToExport'),
            variant: "destructive"
        })
        return;
    }

    const headers = ['S.No.', 'Date', 'Person', 'Status', 'Event', 'Gift Type', 'Amount', 'Description/Gift', 'Notes'];
    
    const dataForSheet = dataToExport.map((entry, index) => {
      let amountDisplay: number | string = '';
      if (entry.giftType === 'Money' && entry.amount) {
        amountDisplay = entry.amount;
      } else if (entry.giftType === 'Sweets' && entry.amount) {
        amountDisplay = entry.amount;
      }

      return {
        'S.No.': index + 1,
        'Date': format(entry.date, 'yyyy-MM-dd'),
        'Person': entry.person,
        'Status': toTitleCase(entry.direction),
        'Event': toTitleCase(entry.event || (entry as any).occasion || 'Other'),
        'Gift Type': toTitleCase(entry.giftType),
        'Amount': amountDisplay,
        'Description/Gift': entry.giftType === 'Gift' && entry.description.startsWith('data:image') ? 'Image Embedded' : entry.description,
        'Notes': entry.notes || '',
    }});

    let moneyGiven = 0;
    let moneyReceived = 0;
    dataToExport.forEach(entry => {
        if (entry.giftType === 'Money' && entry.amount) {
            if (entry.direction === 'given') moneyGiven += entry.amount;
            else moneyReceived += entry.amount;
        }
    });
    const netMoney = moneyGiven - moneyReceived;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([], { header: headers });
    
    const headerStyle = { font: { bold: true, color: { rgb: "FFFFFFFF" } }, fill: { fgColor: { rgb: "FF4F4F4F" } } };
    const summaryHeaderStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFD3D3D3" } } };
    const summaryValueStyle = { font: { bold: false }, fill: { fgColor: { rgb: "FFD3D3D3" } } };

    headers.forEach((h, i) => {
        const cellRef = XLSX.utils.encode_cell({c: i, r: 0});
        ws[cellRef].s = headerStyle;
    });

    XLSX.utils.sheet_add_json(ws, dataForSheet, { origin: 'A2', skipHeader: true });

    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = 1; R <= range.e.r; ++R) {
        const isEven = R % 2 === 0;
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;

            ws[cell_ref].s = { 
                alignment: { wrapText: true, vertical: 'top' },
                fill: isEven ? { fgColor: { rgb: "FFF0F0F0" } } : undefined,
            };
            if (C === 6) { 
                 ws[cell_ref].s.alignment = { ...ws[cell_ref].s.alignment, horizontal: "center" };
            }
        }
    }
    
    ws['!cols'] = [
        { wch: 5 }, // S.No.
        { wch: 12 }, // Date
        { wch: 20 }, // Person
        { wch: 10 }, // Status
        { wch: 12 }, // Event
        { wch: 12 }, // Gift Type
        { wch: 12 }, // Amount
        { wch: 20 }, // Description
        { wch: 30 }, // Notes
    ];
    
    const summaryStartRow = range.e.r + 3;
    XLSX.utils.sheet_add_aoa(ws, [["Balance Summary"]], { origin: `B${summaryStartRow}` });
    ws[`B${summaryStartRow}`].s = { font: { bold: true, sz: 14 } };

    XLSX.utils.sheet_add_aoa(ws, [["Total Given", `${moneyGiven.toLocaleString()}`]], { origin: `B${summaryStartRow + 1}` });
    ws[`B${summaryStartRow + 1}`].s = summaryHeaderStyle;
    ws[`C${summaryStartRow + 1}`].s = summaryValueStyle;

    XLSX.utils.sheet_add_aoa(ws, [["Total Received", `${moneyReceived.toLocaleString()}`]], { origin: `B${summaryStartRow + 2}` });
    ws[`B${summaryStartRow + 2}`].s = summaryHeaderStyle;
    ws[`C${summaryStartRow + 2}`].s = summaryValueStyle;

    XLSX.utils.sheet_add_aoa(ws, [["Net Balance", `${netMoney.toLocaleString()}`]], { origin: `B${summaryStartRow + 3}` });
    ws[`B${summaryStartRow + 3}`].s = summaryHeaderStyle;
    ws[`C${summaryStartRow + 3}`].s = summaryValueStyle;

    if (!ws['!cols']) ws['!cols'] = [];
    ws['!cols'][1] = { wch: 15 };
    ws['!cols'][2] = { wch: 15 }; 

    XLSX.utils.book_append_sheet(wb, ws, "Neondara History");
    
    const filename = person 
      ? `Neondara_History_${person.name}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `Neondara_History_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, filename);

    toast({ title: t('exportSuccessTitle'), description: t('exportSuccessDescription') });
}, [entries, getPersonById, t, toast]);


  const value = {
    entries,
    people,
    sharedBills,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    addPerson,
    updatePerson,
    deletePerson,
    addSharedBill,
    updateSharedBill,
    deleteSharedBill,
    updateParticipantStatus,
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
