'use client';

import { useState, useMemo } from 'react';
import type { NiondraEntry, Occasion, Person } from '@/lib/types';
import { NiondraCard } from './niondra-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { useLanguage } from './language-provider';

interface NiondraTimelineProps {
  entries: NiondraEntry[];
  people: Person[];
  onEdit: (entry: Omit<NiondraEntry, 'userId'>) => void;
  onDelete: (id: string) => void;
}

export function NiondraTimeline({ entries, people, onEdit, onDelete }: NiondraTimelineProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [occasionFilter, setOccasionFilter] = useState<Occasion | 'all'>('all');
  const [directionFilter, setDirectionFilter] = useState<'given' | 'received' | 'all'>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  
  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const searchMatch = searchTerm.length > 0 ?
          entry.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.description.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const occasionMatch = occasionFilter === 'all' || entry.occasion === occasionFilter;
        const directionMatch = directionFilter === 'all' || entry.direction === directionFilter;
        const personMatch = personFilter === 'all' || entry.personId === personFilter;
        return searchMatch && occasionMatch && directionMatch && personMatch;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries, searchTerm, occasionFilter, directionFilter, personFilter]);

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
          <Select value={occasionFilter} onValueChange={(value) => setOccasionFilter(value as Occasion | 'all')}>
            <SelectTrigger aria-label={t('filterByOccasion')}>
              <SelectValue placeholder={t('filterByOccasion')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allOccasions')}</SelectItem>
              <SelectItem value="Wedding">{t('occasionWedding')}</SelectItem>
              <SelectItem value="Birth">{t('occasionBirth')}</SelectItem>
              <SelectItem value="Housewarming">{t('occasionHousewarming')}</SelectItem>
              <SelectItem value="Other">{t('occasionOther')}</SelectItem>
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
            return <NiondraCard key={entry.id} entry={cardEntry} onEdit={onEdit} onDelete={onDelete} />
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
