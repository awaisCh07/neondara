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

interface NiondraCardProps {
  entry: Omit<NiondraEntry, 'userId'>;
  onEdit: (entry: Omit<NiondraEntry, 'userId'>) => void;
  onDelete: (id: string) => void;
  personName?: string;
}

const occasionIcons: Record<NiondraEntry['occasion'], React.ReactNode> = {
  Wedding: <Heart className="h-4 w-4" aria-label="Wedding" />,
  Birth: <Gift className="h-4 w-4" aria-label="Birth" />,
  Housewarming: <Home className="h-4 w-4" aria-label="Housewarming" />,
  Other: <PartyPopper className="h-4 w-4" aria-label="Other occasion" />,
};

export function NiondraCard({ entry, onEdit, onDelete, personName }: NiondraCardProps) {
  const isGiven = entry.direction === 'given';
  const nameToDisplay = personName || entry.person;
  const title = isGiven ? `To: ${nameToDisplay}` : `From: ${nameToDisplay}`;
  
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
                <span>{entry.occasion}</span>
              </div>
            </div>
          </div>
           <Badge variant={isGiven ? "secondary" : "default"} className="capitalize">
            {isGiven ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownLeft className="h-4 w-4 mr-1" />}
            {entry.direction}
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
                Edit
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
           <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this ledger entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
