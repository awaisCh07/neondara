
'use client';

import { useEffect, useState, useMemo } from 'react';
import type { NeondaraEntry, Person } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gift, Grape, Download, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NeondaraEntrySheet } from '@/components/neondara-entry-sheet';
import { useLanguage } from '@/components/language-provider';
import { AppLayout } from '@/components/layout';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useData } from '@/components/data-provider';
import { NeondaraCard } from '@/components/neondara-card';
import { Separator } from '@/components/ui/separator';


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
  const [searchTerm, setSearchTerm] = useState('');


  const person = useMemo(() => getPersonById(personId), [personId, getPersonById]);

  const personEntries = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return entries
      .filter(entry => {
        if (entry.personId !== personId) return false;

        if (searchTerm.length > 0) {
          const descriptionMatch = entry.description && entry.description.toLowerCase().includes(lowerCaseSearchTerm);
          const notesMatch = entry.notes && entry.notes.toLowerCase().includes(lowerCaseSearchTerm);
          return descriptionMatch || notesMatch;
        }
        
        return true;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries, personId, searchTerm]);

  const summaryStats = useMemo(() => {
    let moneyGiven = 0;
    let moneyReceived = 0;
    let sweetsGiven = 0;
    let sweetsReceived = 0;
    let giftsGivenCount = 0;
    let giftsReceivedCount = 0;

    // Summary should be based on all entries for the person, not filtered ones.
    const allPersonEntries = entries.filter(entry => entry.personId === personId);

    allPersonEntries.forEach(entry => {
      if (entry.direction === 'given') {
        if (entry.giftType === 'Money' && entry.amount) {
          moneyGiven += entry.amount;
        } else if (entry.giftType === 'Sweets' && entry.amount) {
          sweetsGiven += entry.amount;
        } else if (entry.giftType === 'Gift') {
          giftsGivenCount++;
        }
      } else { // received
        if (entry.giftType === 'Money' && entry.amount) {
          moneyReceived += entry.amount;
        } else if (entry.giftType === 'Sweets' && entry.amount) {
          sweetsReceived += entry.amount;
        } else if (entry.giftType === 'Gift') {
          giftsReceivedCount++;
        }
      }
    });

    return { 
        moneyGiven, 
        moneyReceived, 
        netMoney: moneyGiven - moneyReceived,
        sweetsGiven,
        sweetsReceived,
        giftsGivenCount,
        giftsReceivedCount
    };
  }, [entries, personId]);
  
  const balanceColor = useMemo(() => summaryStats.netMoney === 0 ? 'text-foreground' : summaryStats.netMoney > 0 ? 'text-green-600' : 'text-red-600', [summaryStats.netMoney]);

  const balanceText = useMemo(() => {
      if (summaryStats.netMoney === 0) return t('allSquare');
      const formattedAmount = `Rs ${new Intl.NumberFormat().format(Math.abs(summaryStats.netMoney))}`;
      if (summaryStats.netMoney > 0) return t('youHaveGivenMore', { amount: formattedAmount });
      return t('youAreOwed', { amount: formattedAmount });
  }, [summaryStats.netMoney, t]);


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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <Link href="/people" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    {t('backToPeople')}
                </Link>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        {t('exportData')}
                    </Button>
                </div>
              </div>

               <h1 className="text-4xl font-headline">{person.name}</h1>
               {person.relation && <p className="text-lg text-muted-foreground">{person.relation}</p>}
          </div>

          <Card className="mb-8">
              <CardHeader>
                  <CardTitle>{t('balanceSummary')}</CardTitle>
                  <CardDescription>{t('balanceSummaryDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t('netBalance')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">{t('totalGiven')}</p>
                            <p className="text-2xl font-bold">{`Rs ${new Intl.NumberFormat().format(summaryStats.moneyGiven)}`}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('totalReceived')}</p>
                            <p className="text-2xl font-bold">{`Rs ${new Intl.NumberFormat().format(summaryStats.moneyReceived)}`}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('netBalance')}</p>
                            <p className={`text-2xl font-bold ${balanceColor}`}>{balanceText}</p>
                        </div>
                    </div>
                  </div>
                  <Separator />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center"><Grape className="mr-2 h-5 w-5" /> Sweets Exchanged</h3>
                         <div className="flex justify-around text-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Given</p>
                              <p className="text-2xl font-bold">{summaryStats.sweetsGiven}<span className="text-base font-normal text-muted-foreground">kg</span></p>
                            </div>
                             <div>
                              <p className="text-sm text-muted-foreground">Received</p>
                              <p className="text-2xl font-bold">{summaryStats.sweetsReceived}<span className="text-base font-normal text-muted-foreground">kg</span></p>
                            </div>
                        </div>
                      </div>
                       <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center"><Gift className="mr-2 h-5 w-5" /> Gifts Exchanged</h3>
                          <div className="flex justify-around text-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Given</p>
                              <p className="text-2xl font-bold">{summaryStats.giftsGivenCount}</p>
                            </div>
                             <div>
                              <p className="text-sm text-muted-foreground">Received</p>
                              <p className="text-2xl font-bold">{summaryStats.giftsReceivedCount}</p>
                            </div>
                        </div>
                      </div>
                   </div>
              </CardContent>
          </Card>
          
          <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
            <h2 className="text-2xl font-bold">{t('transactionHistory')}</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('searchByGift')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                    aria-label={t('searchByGift')}
                />
            </div>
          </div>
           {personEntries.length > 0 ? (
              <div className="grid gap-6">
                  {personEntries.map(entry => {
                      const { userId, ...cardEntry } = entry;
                      return <NeondaraCard key={entry.id} entry={cardEntry} onEdit={handleOpenSheet} onDelete={deleteEntry} personName={person.name} searchTerm={searchTerm}/>
                  })}
              </div>
          ) : (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                  <h3 className="text-xl font-semibold text-foreground">{t('noEntriesFound')}</h3>
                  <p className="mt-2">{searchTerm ? t('adjustFilters') : `${t('noHistoryYet')} ${t('startTracking')} ${person.name}.`}</p>
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
