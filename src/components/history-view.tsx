
'use client';

import { useState } from 'react';
import type { NeondaraEntry, Person } from '@/lib/types';
import { NeondaraEntrySheet } from '@/components/neondara-entry-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { NeondaraTimeline } from './neondara-timeline';
import { useLanguage } from './language-provider';
import { AppLayout } from './layout';
import { useData } from './data-provider';

export function HistoryView() {
  const { entries, people, loading, addEntry, updateEntry, deleteEntry, exportData } = useData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NeondaraEntry | undefined>(undefined);
  const { t } = useLanguage();
  
  const handleOpenSheet = (entry?: Omit<NeondaraEntry, 'userId'>) => {
    setEditingEntry(entry as NeondaraEntry | undefined);
    setIsSheetOpen(true);
  }
  
  const handleExport = () => {
    exportData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>{t('loadingHistory')}</p>
      </div>
    );
  }
  
  return (
    <AppLayout onExport={handleExport}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-headline">{t('transactionHistory')}</h1>
                <Button size="sm" onClick={() => handleOpenSheet()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                    {t('addEntry')}
                </Button>
            </div>
            
            <NeondaraTimeline 
                entries={entries} 
                people={people} 
                onEdit={handleOpenSheet} 
                onDelete={deleteEntry}
            />
        
            <NeondaraEntrySheet
              isOpen={isSheetOpen}
              onOpenChange={setIsSheetOpen}
              onAddEntry={addEntry}
              onUpdateEntry={updateEntry}
              entry={editingEntry}
              people={people}
            />
        </div>
    </AppLayout>
  );
}
