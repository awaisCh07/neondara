
'use client';

import { useState, useMemo } from 'react';
import type { SharedBill } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Receipt, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
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

import { useLanguage } from '@/components/language-provider';
import { AppLayout } from '@/components/layout';
import { useData } from '@/components/data-provider';
import { SharedBillSheet } from '@/components/shared-bill-sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/components/auth-provider';

const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};


export default function SharedBillsPage() {
  const { user } = useAuth();
  const { people, sharedBills, loading, addSharedBill, updateSharedBill, deleteSharedBill, updateParticipantStatus, getPersonById } = useData();
  const { t } = useLanguage();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<SharedBill | null>(null);

  const handleOpenSheet = (bill: SharedBill | null = null) => {
    setEditingBill(bill);
    setIsSheetOpen(true);
  };

  const sortedBills = useMemo(() => {
    return [...sharedBills].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [sharedBills]);
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p>{t('loadingBills')}</p>
        </div>
      </AppLayout>
    );
  }

  const handleTogglePaidStatus = (billId: string, personId: string, newStatus: boolean) => {
    updateParticipantStatus(billId, personId, newStatus);
  }
  
  const getParticipantName = (id: string) => {
    if (id === user?.uid) return t('meYou');
    return getPersonById(id)?.name || t('unknown');
  }

  return (
    <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
                <h1 className="text-4xl font-headline flex items-center gap-2">
                    <Receipt />
                    {t('sharedBills')}
                </h1>
                <Button onClick={() => handleOpenSheet()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('addBill')}
                </Button>
            </div>

            {sortedBills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedBills.map(bill => {
                    const payerName = getParticipantName(bill.payerId);
                    const allPaid = bill.participants.every(p => p.isPaid);
                    return (
                    <Card key={bill.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{bill.description}</CardTitle>
                                    <CardDescription>{format(bill.date, 'PPP')}</CardDescription>
                                </div>
                                 <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">More options</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenSheet(bill)}>
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
                                            {t('deleteBillConfirmDescription')}
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteSharedBill(bill.id)} className="bg-destructive hover:bg-destructive/90">
                                                {t('delete')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                 </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div>
                                <p className="text-3xl font-bold">{`Rs ${new Intl.NumberFormat().format(bill.totalAmount)}`}</p>
                                <p className="text-sm text-muted-foreground">{t('paidBy', { name: payerName || t('unknown') })}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium mb-2">{t('participants')}</h4>
                                <TooltipProvider>
                                <div className="flex flex-wrap gap-2">
                                    {bill.participants.map(participant => {
                                        const personName = getParticipantName(participant.personId);
                                        return (
                                            <Tooltip key={participant.personId}>
                                                <TooltipTrigger asChild>
                                                    <div 
                                                        onClick={() => handleTogglePaidStatus(bill.id, participant.personId, !participant.isPaid)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Avatar className={`border-2 ${participant.isPaid ? 'border-green-500' : 'border-muted'}`}>
                                                            <AvatarFallback className={`${participant.isPaid ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                                                                {getInitials(personName || '')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{personName}</p>
                                                    <p>{t('shareAmount', { amount: `Rs ${new Intl.NumberFormat().format(participant.shareAmount)}` })}</p>
                                                    <p className={`font-bold ${participant.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                        {participant.isPaid ? t('paid') : t('unpaid')}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                </div>
                                </TooltipProvider>
                            </div>
                        </CardContent>
                        <CardFooter>
                           <Badge variant={allPaid ? 'default' : 'secondary'}>{allPaid ? t('billSettled') : t('billUnsettled')}</Badge>
                        </CardFooter>
                    </Card>
                    );
                })}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold text-foreground">{t('noBillsAdded')}</h3>
                <p className="mt-2 mb-4">{t('clickAddBill')}</p>
                <Button onClick={() => handleOpenSheet()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('addBill')}
                    </Button>
                </div>
            )}
        </div>
        <SharedBillSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            people={people}
            bill={editingBill}
            onSave={async (data, billId) => {
                if(billId) {
                    await updateSharedBill(data, billId);
                } else {
                    await addSharedBill(data);
                }
            }}
        />
    </AppLayout>
  );
}
