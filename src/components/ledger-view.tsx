'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NiondraEntry, NiondraEntryDTO } from '@/lib/types';
import { NiondraEntrySheet } from '@/components/niondra-entry-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { NiondraTimeline } from './niondra-timeline';
import { useToast } from '@/hooks/use-toast';

export function LedgerView() {
  const [entries, setEntries] = useState<NiondraEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NiondraEntry | undefined>(undefined);
  const { toast } = useToast();

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "niondra_entries"));
      const entriesData = querySnapshot.docs.map(doc => {
        const data = doc.data() as NiondraEntryDTO;
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate(),
        }
      });
      setEntries(entriesData);
    } catch (error) {
      console.error("Error fetching entries: ", error);
      toast({
        title: "Error",
        description: "Failed to fetch ledger entries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAddEntry = async (newEntry: Omit<NiondraEntry, 'id'>) => {
    try {
      await addDoc(collection(db, "niondra_entries"), {
        ...newEntry,
        date: Timestamp.fromDate(newEntry.date),
      });
      toast({
        title: "Success",
        description: "New entry added to the ledger.",
      });
      fetchEntries(); // Refetch to get the new entry with its ID
    } catch (error) {
      console.error("Error adding entry: ", error);
      toast({
        title: "Error",
        description: "Failed to add new entry.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEntry = async (updatedEntry: NiondraEntry) => {
    try {
      const entryRef = doc(db, "niondra_entries", updatedEntry.id);
      const { id, ...dataToUpdate } = updatedEntry;
      await updateDoc(entryRef, {
        ...dataToUpdate,
        date: Timestamp.fromDate(dataToUpdate.date),
      });
      toast({
        title: "Success",
        description: "Entry has been updated.",
      });
      fetchEntries(); // Refetch to update the UI
    } catch (error) {
      console.error("Error updating entry: ", error);
      toast({
        title: "Error",
        description: "Failed to update entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, "niondra_entries", entryId));
      toast({
        title: "Success",
        description: "Entry has been deleted.",
      });
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry: ", error);
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenSheet = (entry?: NiondraEntry) => {
    setEditingEntry(entry);
    setIsSheetOpen(true);
  }

  const handleExport = () => {
    const headers = "id,direction,person,date,occasion,giftType,amount,description,notes\n";
    const csvContent = entries.map(e => 
      [
        e.id,
        e.direction,
        e.person,
        e.date.toISOString().split('T')[0],
        e.occasion,
        e.giftType,
        e.amount ?? '',
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.notes?.replace(/"/g, '""') || ''}"`
      ].join(',')
    ).join('\n');

    const csv = headers + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "niondra-ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-3xl font-headline text-foreground">Niondra Ledger</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={() => handleOpenSheet()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Loading ledger...</p>
          </div>
        ) : (
          <NiondraTimeline 
            entries={entries} 
            onEdit={handleOpenSheet} 
            onDelete={handleDeleteEntry} 
          />
        )}
      </main>

      <NiondraEntrySheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddEntry={handleAddEntry}
        onUpdateEntry={handleUpdateEntry}
        entry={editingEntry}
      />
    </div>
  );
}
