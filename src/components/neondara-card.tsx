
import type { NeondaraEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowUpRight, ArrowDownLeft, Gift, Home, PartyPopper, Heart, Edit, Trash2, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import Image from 'next/image';
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

interface NeondaraCardProps {
  entry: Omit<NeondaraEntry, 'userId'>;
  onEdit: (entry: Omit<NeondaraEntry, 'userId'>) => void;
  onDelete: (id: string) => void;
  personName?: string;
}

export function NeondaraCard({ entry, onEdit, onDelete, personName }: NeondaraCardProps) {
  const { t } = useLanguage();
  
  const occasionIcons: Record<NeondaraEntry['occasion'], React.ReactNode> = {
    Wedding: <Heart className="h-4 w-4" aria-label="Wedding" />,
    Birth: <Gift className="h-4 w-4" aria-label="Birth" />,
    Housewarming: <Home className="h-4 w-4" aria-label="Housewarming" />,
    Other: <PartyPopper className="h-4 w-4" aria-label="Other occasion" />,
  };

  const getOccasionTranslation = (occasion: NeondaraEntry['occasion']) => {
    const key = `occasion${occasion}` as 'occasionWedding' | 'occasionBirth' | 'occasionHousewarming' | 'occasionOther';
    return t(key);
  }

  const isGiven = entry.direction === 'given';
  const nameToDisplay = personName || entry.person;
  const title = isGiven ? `${t('to')}: ${nameToDisplay}` : `${t('from')}: ${nameToDisplay}`;
  
  const giftDisplay = () => {
    switch (entry.giftType) {
      case 'Money':
        return <p className="text-2xl font-headline text-foreground/90">{new Intl.NumberFormat().format(entry.amount || 0)}</p>;
      case 'Sweets':
        return <p className="text-2xl font-headline text-foreground/90">{`${entry.amount}kg ${entry.description}`}</p>;
      case 'Gift':
         if (entry.description && entry.description.startsWith('data:image')) {
            return (
              <a href={entry.description} download={`gift_from_${nameToDisplay}.png`} title="Click to download image">
                <Image
                  src={entry.description}
                  alt={`Gift from ${nameToDisplay}`}
                  width={400}
                  height={300}
                  className="rounded-lg object-cover w-full aspect-video transition-transform duration-300 hover:scale-105"
                />
              </a>
            );
         }
         return (
            <div className="flex items-center gap-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-2xl font-headline text-foreground/90">{entry.description || "Gift"}</p>
            </div>
         );
      case 'Other':
        return <p className="text-2xl font-headline text-foreground/90">{entry.description}</p>;
      default:
        return <p className="text-2xl font-headline text-foreground/90">{entry.description}</p>;
    }
  };

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
        {giftDisplay()}
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
