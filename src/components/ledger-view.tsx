'use client';

import { useState } from 'react';
import type { NiondraEntry } from '@/lib/types';
import { initialEntries } from '@/lib/data';
import { NiondraEntrySheet } from '@/components/niondra-entry-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { NiondraTimeline } from './niondra-timeline';

export function LedgerView() {
  const [entries, setEntries] = useState<NiondraEntry[]>(initialEntries);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NiondraEntry | undefined>(undefined);

  const handleAddEntry = (newEntry: Omit<NiondraEntry, 'id'>) => {
    setEntries(prev => [...prev, { ...newEntry, id: new Date().toISOString() }]);
  };

  const handleUpdateEntry = (updatedEntry: NiondraEntry) => {
    setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
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
        <NiondraTimeline entries={entries} />
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
