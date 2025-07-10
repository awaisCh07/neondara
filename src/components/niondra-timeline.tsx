'use client';

import { useState, useMemo } from 'react';
import type { NiondraEntry, Occasion } from '@/lib/types';
import { NiondraCard } from './niondra-card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';

interface NiondraTimelineProps {
  entries: NiondraEntry[];
}

export function NiondraTimeline({ entries }: NiondraTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [occasionFilter, setOccasionFilter] = useState<Occasion | 'all'>('all');
  const [directionFilter, setDirectionFilter] = useState<'given' | 'received' | 'all'>('all');

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
        return searchMatch && occasionMatch && directionMatch;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries, searchTerm, occasionFilter, directionFilter]);

  return (
    <div>
      <div className="mb-8 p-4 rounded-lg bg-card border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, gift..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search entries"
            />
          </div>
          <Select value={occasionFilter} onValueChange={(value) => setOccasionFilter(value as Occasion | 'all')}>
            <SelectTrigger aria-label="Filter by occasion">
              <SelectValue placeholder="Filter by occasion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Occasions</SelectItem>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Birth">Birth</SelectItem>
              <SelectItem value="Housewarming">Housewarming</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={directionFilter} onValueChange={(value) => setDirectionFilter(value as 'given' | 'received' | 'all')}>
            <SelectTrigger aria-label="Filter by direction">
              <SelectValue placeholder="Filter by direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Given & Received</SelectItem>
              <SelectItem value="given">Given</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredEntries.length > 0 ? (
        <div className="grid gap-6">
          {filteredEntries.map(entry => (
            <NiondraCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <h3 className="text-xl font-semibold text-foreground">No Entries Found</h3>
          <p className="mt-2">Try adjusting your search or filters, or add a new entry.</p>
        </div>
      )}
    </div>
  );
}
