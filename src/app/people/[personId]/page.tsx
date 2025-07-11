
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { NeondaraEntry, Person } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NeondaraEntrySheet } from '@/components/neondara-entry-sheet';
import { useLanguage } from '@/components/language-provider';
import { AppLayout } from '@/components/layout';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useData } from '@/components/data-provider';
import { NeondaraCard } from '@/components/neondara-card';


export default function PersonDetailPage() {
  const params = useParams();
  const personId = params.personId as string;
  
  const { 
    people, 
    entries, 
    loading, 
    addEntry, 
    updateEntry, 
    deleteEntry, 
    getPersonById,
    exportData 
  } = useData();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NeondaraEntry | undefined>(undefined);
  const { t } = useLanguage();

  const person = useMemo(() => getPersonById(personId), [personId, getPersonById]);

  const personEntries = useMemo(() => {
    return entries
      .filter(entry => entry.personId === personId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries, personId]);

  const balance = useMemo(() => {
    let given = 0;
    let received = 0;
    personEntries.forEach(entry => {
      if (entry.giftType === 'Money' && entry.amount) {
        if (entry.direction === 'given') {
          given += entry.amount;
        } else {
          received += entry.amount;
        }
      }
    });
    return { given, received, net: given - received };
  }, [personEntries]);

  const handleOpenSheet = (entry?: Omit<NeondaraEntry, 'userId'>) => {
    setEditingEntry(entry as NeondaraEntry | undefined);
    setIsSheetOpen(true);
  }

  const handleExport = () => {
    exportData({ personId });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>{t('loadingDetails')}</p>
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
    <AppLayout onExport={handleExport}>
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
           {personEntries.length > 0 ? (
              <div className="grid gap-6">
                  {personEntries.map(entry => {
                      const { userId, ...cardEntry } = entry;
                      return <NeondaraCard key={entry.id} entry={cardEntry} onEdit={handleOpenSheet} onDelete={deleteEntry} personName={person.name}/>
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
              onAddEntry={addEntry}
              onUpdateEntry={updateEntry}
              entry={editingEntry}
              people={people}
          />
      </div>
    </AppLayout>
  );
}
