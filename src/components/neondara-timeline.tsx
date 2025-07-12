
'use client';

import { useState, useMemo } from 'react';
import type { NeondaraEntry, Event, Person } from '@/lib/types';
import { NeondaraCard } from './neondara-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { useLanguage } from './language-provider';

interface NeondaraTimelineProps {
  entries: NeondaraEntry[];
  people: Person[];
  onEdit: (entry: Omit<NeondaraEntry, 'userId'>) => void;
  onDelete: (id: string) => Promise<void>;
}

export function NeondaraTimeline({ entries, people, onEdit, onDelete }: NeondaraTimelineProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<Event | 'all'>('all');
  const [directionFilter, setDirectionFilter] = useState<'given' | 'received' | 'all'>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  
  const filteredEntries = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return entries
      .filter(entry => {
        const searchMatch = searchTerm.length > 0 ?
          entry.person.toLowerCase().includes(lowerCaseSearchTerm) ||
          (entry.description && entry.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (entry.notes && entry.notes.toLowerCase().includes(lowerCaseSearchTerm))
          : true;
        const eventMatch = eventFilter === 'all' || entry.event === eventFilter;
        const directionMatch = directionFilter === 'all' || entry.direction === directionFilter;
        const personMatch = personFilter === 'all' || entry.personId === personFilter;
        return searchMatch && eventMatch && directionMatch && personMatch;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries, searchTerm, eventFilter, directionFilter, personFilter]);

  return (
    <div>
      <div className="mb-8 p-4 rounded-lg bg-card border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative md:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchByGift')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label={t('searchByGift')}
            />
          </div>
          <Select value={personFilter} onValueChange={(value) => setPersonFilter(value)}>
            <SelectTrigger aria-label={t('filterByPerson')}>
              <SelectValue placeholder={t('filterByPerson')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPeople')}</SelectItem>
              {people.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={eventFilter} onValueChange={(value) => setEventFilter(value as Event | 'all')}>
            <SelectTrigger aria-label={t('filterByEvent')}>
              <SelectValue placeholder={t('filterByEvent')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allEvents')}</SelectItem>
              <SelectItem value="Wedding">{t('eventWedding')}</SelectItem>
              <SelectItem value="Birth">{t('eventBirth')}</SelectItem>
              <SelectItem value="Housewarming">{t('eventHousewarming')}</SelectItem>
              <SelectItem value="Other">{t('eventOther')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={directionFilter} onValueChange={(value) => setDirectionFilter(value as 'given' | 'received' | 'all')}>
            <SelectTrigger aria-label={t('filterByDirection')}>
              <SelectValue placeholder={t('filterByDirection')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('givenAndReceived')}</SelectItem>
              <SelectItem value="given">{t('directionGiven')}</SelectItem>
              <SelectItem value="received">{t('directionReceived')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredEntries.length > 0 ? (
        <div className="grid gap-6">
          {filteredEntries.map(entry => {
            const { userId, ...cardEntry } = entry;
            return <NeondaraCard key={entry.id} entry={cardEntry} onEdit={onEdit} onDelete={onDelete} searchTerm={searchTerm} />
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <h3 className="text-xl font-semibold text-foreground">{t('noEntriesFound')}</h3>
          <p className="mt-2">{t('adjustFilters')}</p>
        </div>
      )}
    </div>
  );
}
