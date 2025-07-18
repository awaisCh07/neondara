
"use client"

import { useState } from 'react';
import type { NeondaraEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowUpRight, ArrowDownLeft, Gift, Home, PartyPopper, Heart, Edit, Trash2, MoreVertical, Image as ImageIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from './language-provider';

interface NeondaraCardProps {
  entry: Omit<NeondaraEntry, 'userId'>;
  onEdit: (entry: Omit<NeondaraEntry, 'userId'>) => void;
  onDelete: (id: string) => Promise<void>;
  personName?: string;
  searchTerm?: string;
}

const HighlightedText = ({ text, highlight }: { text: string; highlight?: string }) => {
  if (!highlight || !text) {
    return <>{text}</>;
  }
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-primary/30 p-0">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export function NeondaraCard({ entry, onEdit, onDelete, personName, searchTerm }: NeondaraCardProps) {
  const { t } = useLanguage();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const eventIcons: Record<NeondaraEntry['event'], React.ReactNode> = {
    Wedding: <Heart className="h-4 w-4" aria-label="Wedding" />,
    Birth: <Gift className="h-4 w-4" aria-label="Birth" />,
    Housewarming: <Home className="h-4 w-4" aria-label="Housewarming" />,
    Other: <PartyPopper className="h-4 w-4" aria-label="Other event" />,
  };

  const getEventTranslation = (event: NeondaraEntry['event']) => {
    const key = `event${event}` as 'eventWedding' | 'eventBirth' | 'eventHousewarming' | 'eventOther';
    return t(key);
  }

  const isGiven = entry.direction === 'given';
  const nameToDisplay = personName || entry.person;
  
  const titleText = isGiven ? `${t('to')}: ${nameToDisplay}` : `${t('from')}: ${nameToDisplay}`;
  const title = <HighlightedText text={titleText} highlight={searchTerm} />;

  const isImageDataUrl = entry.giftType === 'Gift' && entry.description && entry.description.startsWith('data:image');

  const handleDownload = () => {
    if (!isImageDataUrl) return;
    const link = document.createElement('a');
    link.href = entry.description;
    link.download = `gift_from_${nameToDisplay}_${entry.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        await onDelete(entry.id);
    } finally {
        setIsDeleting(false);
    }
  }

  const giftDisplay = () => {
    switch (entry.giftType) {
      case 'Money':
        return <p className="text-2xl font-headline text-foreground/90">{`Rs ${new Intl.NumberFormat().format(entry.amount || 0)}`}</p>;
      case 'Sweets':
        return <p className="text-2xl font-headline text-foreground/90"><HighlightedText text={`${entry.amount || 0}kg ${entry.description || ''}`.trim()} highlight={searchTerm} /></p>;
      case 'Gift':
        if (isImageDataUrl) {
          return (
            <div className="flex gap-4 items-start">
              <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                <DialogTrigger asChild>
                  <div className="w-24 h-24 relative flex-shrink-0 cursor-pointer">
                    <Image
                      src={entry.description}
                      alt={`Gift from ${nameToDisplay}`}
                      fill
                      className="rounded-lg object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{t('giftImage')}</DialogTitle>
                  </DialogHeader>
                  <div className="relative mt-4" style={{paddingBottom: '75%'}}>
                    <Image
                      src={entry.description}
                      alt={`Gift from ${nameToDisplay}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      {t('exportData')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="flex-grow">
                <p className="text-lg font-semibold text-foreground/90">{t('giftTypeGift')}</p>
                {entry.notes && (
                  <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground font-serif">
                    <HighlightedText text={entry.notes} highlight={searchTerm} />
                  </blockquote>
                )}
              </div>
            </div>
          );
        }
        // Fallback for gift with only text description
        return (
          <div className="flex items-center gap-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            <div>
                <p className="text-lg font-semibold text-foreground/90"><HighlightedText text={entry.description || "Gift"} highlight={searchTerm} /></p>
                 {entry.notes && (
                    <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground font-serif">
                        <HighlightedText text={entry.notes} highlight={searchTerm} />
                    </blockquote>
                )}
            </div>
          </div>
        );
      case 'Other':
        return <p className="text-2xl font-headline text-foreground/90"><HighlightedText text={entry.description} highlight={searchTerm} /></p>;
      default:
        return <p className="text-2xl font-headline text-foreground/90"><HighlightedText text={entry.description} highlight={searchTerm} /></p>;
    }
  };
  
  const notesDisplay = () => {
    // Notes are now displayed within the giftDisplay logic for 'Gift' type, so we avoid duplicating them here.
    if (entry.giftType !== 'Gift' && entry.notes) {
        return (
            <blockquote className="mt-4 border-l-2 pl-4 italic text-muted-foreground font-serif">
                <HighlightedText text={entry.notes} highlight={searchTerm} />
            </blockquote>
        );
    }
    return null;
  }


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
                {eventIcons[entry.event]}
                <span>{getEventTranslation(entry.event)}</span>
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
        {notesDisplay()}
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
              <DropdownMenuSeparator />
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
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? t('deleting') : t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
