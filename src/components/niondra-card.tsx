import type { NiondraEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowUpRight, ArrowDownLeft, Gift, Home, PartyPopper, Heart, Edit, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLanguage } from './language-provider';

interface NiondraCardProps {
  entry: Omit<NiondraEntry, 'userId'>;
  onEdit: (entry: Omit<NiondraEntry, 'userId'>) => void;
  onDelete: (id: string) => void;
  personName?: string;
}

export function NiondraCard({ entry, onEdit, onDelete, personName }: NiondraCardProps) {
  const { t } = useLanguage();
  
  const occasionIcons: Record<NiondraEntry['occasion'], React.ReactNode> = {
    Wedding: <Heart className="h-4 w-4" aria-label="Wedding" />,
    Birth: <Gift className="h-4 w-4" aria-label="Birth" />,
    Housewarming: <Home className="h-4 w-4" aria-label="Housewarming" />,
    Other: <PartyPopper className="h-4 w-4" aria-label="Other occasion" />,
  };

  const getOccasionTranslation = (occasion: NiondraEntry['occasion']) => {
    const key = `occasion${occasion}` as 'occasionWedding' | 'occasionBirth' | 'occasionHousewarming' | 'occasionOther';
    return t(key);
  }

  const isGiven = entry.direction === 'given';
  const nameToDisplay = personName || entry.person;
  const title = isGiven ? `${t('to')}: ${nameToDisplay}` : `${t('from')}: ${nameToDisplay}`;
  
  const giftDisplay = entry.giftType === 'Money' && entry.amount 
    ? `${new Intl.NumberFormat().format(entry.amount)} ${entry.description}` 
    : entry.description;

  return (
    <Card className="w-full transition-all duration-300 ease-in-out hover:shadow-xl flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
             <div className="text-sm text-muted-foreground flex items-center gap-2 pt-1 flex-wrap">
              <span>{format(entry.date, 'PPP')}</span>
              <span className="text-muted-foreground/50">|</span>
              <div className="flex items-center gap-1">
                {occasionIcons[entry.occasion]}
                <span>{getOccasionTranslation(entry.occasion)}</span>
              </div>
            </div>
          </div>
           <Badge variant={isGiven ? "secondary" : "default"} className="capitalize">
            {isGiven ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownLeft className="h-4 w-4 mr-1" />}
            {isGiven ? t('directionGiven') : t('directionReceived')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-2xl font-headline text-foreground/90">{giftDisplay}</p>
        {entry.notes && (
          <blockquote className="mt-4 border-l-2 pl-4 italic text-muted-foreground font-serif">
            {entry.notes}
          </blockquote>
        )}
      </CardContent>
       <CardFooter className="flex justify-end">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit className="mr-2 h-4 w-4" />
                {t('edit')}
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
           <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteConfirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
