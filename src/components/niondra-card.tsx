import type { NiondraEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowUpRight, ArrowDownLeft, Gift, Home, PartyPopper, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface NiondraCardProps {
  entry: NiondraEntry;
}

const occasionIcons: Record<NiondraEntry['occasion'], React.ReactNode> = {
  Wedding: <Heart className="h-4 w-4" aria-label="Wedding" />,
  Birth: <Gift className="h-4 w-4" aria-label="Birth" />,
  Housewarming: <Home className="h-4 w-4" aria-label="Housewarming" />,
  Other: <PartyPopper className="h-4 w-4" aria-label="Other occasion" />,
};

export function NiondraCard({ entry }: NiondraCardProps) {
  const isGiven = entry.direction === 'given';
  const title = isGiven ? `To: ${entry.person}` : `From: ${entry.person}`;
  
  const giftDisplay = entry.giftType === 'Money' && entry.amount 
    ? `${new Intl.NumberFormat().format(entry.amount)} ${entry.description}` 
    : entry.description;

  return (
    <Card className="w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <Badge variant={isGiven ? "secondary" : "default"} className="capitalize">
            {isGiven ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownLeft className="h-4 w-4 mr-1" />}
            {entry.direction}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 pt-1 flex-wrap">
          <span>{format(entry.date, 'PPP')}</span>
          <span className="text-muted-foreground/50">|</span>
          <div className="flex items-center gap-1">
            {occasionIcons[entry.occasion]}
            <span>{entry.occasion}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-headline text-foreground/90">{giftDisplay}</p>
        {entry.notes && (
          <blockquote className="mt-4 border-l-2 pl-4 italic text-muted-foreground font-serif">
            {entry.notes}
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
