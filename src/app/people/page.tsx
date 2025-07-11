
'use client';

import { useState, useMemo } from 'react';
import type { Person, NeondaraEntry, Relation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, ArrowRight, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/language-provider';
import { AppLayout } from '@/components/layout';
import { useData } from '@/components/data-provider';

const relations: Relation[] = [
    { en: "Aunt", ur: "چچی، خالہ، مامی، پھوپھی" },
    { en: "Brother", ur: "بھائی" },
    { en: "Brother-in-law", ur: "سالا، بہن کا شوہر" },
    { en: "Cousin", ur: "کزن" },
    { en: "Daughter", ur: "بیٹی" },
    { en: "Father", ur: "ابو، بابا" },
    { en: "Father-in-law", ur: "سسر" },
    { en: "Friend", ur: "دوست" },
    { en: "Grandfather", ur: "دادا، نانا" },
    { en: "Grandmother", ur: "دادی، نانی" },
    { en: "Mother", ur: "امی، ماں" },
    { en: "Mother-in-law", ur: "ساس" },
    { en: "Nephew", ur: "بھتیجا، بھانجا" },
    { en: "Niece", ur: "بھتیجی، بھانجی" },
    { en: "Other", ur: "دیگر" },
    { en: "Sister", ur: "بہن" },
    { en: "Sister-in-law", ur: "سالی، بھابھی" },
    { en: "Son", ur: "بیٹا" },
    { en: "Uncle", ur: "چچا، خالو، ماموں، پھپھا" },
].sort((a, b) => a.en.localeCompare(b.en));


const personSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  relation: z.string({ required_error: "Please select a relation." }),
});

type PersonFormData = z.infer<typeof personSchema>;

type PersonWithBalance = Person & {
  balance: number;
};

export default function PeoplePage() {
  const { people, entries, loading, addPerson, updatePerson, deletePerson } = useData();
  const { language, t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      relation: "Friend"
    }
  });

  const peopleWithBalances = useMemo<PersonWithBalance[]>(() => {
    const balances = new Map<string, number>();
    entries.forEach(entry => {
      if (entry.giftType === 'Money' && entry.amount) {
        const currentBalance = balances.get(entry.personId) || 0;
        if (entry.direction === 'given') {
          balances.set(entry.personId, currentBalance + entry.amount);
        } else {
          balances.set(entry.personId, currentBalance - entry.amount);
        }
      }
    });

    return people
      .map(person => ({
        ...person,
        balance: balances.get(person.id) || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [people, entries]);
  
  const handleOpenDialog = (person: Person | null = null) => {
    setEditingPerson(person);
    if (person) {
      setValue('name', person.name);
      setValue('relation', person.relation || 'Friend');
    } else {
      reset({ name: '', relation: 'Friend' });
    }
    setIsDialogOpen(true);
  };
  
  const handleFormSubmit = async (data: PersonFormData) => {
    setIsSaving(true);
    try {
      if (editingPerson) {
        await updatePerson({ ...editingPerson, ...data });
      } else {
        await addPerson(data);
      }
      reset();
      setIsDialogOpen(false);
      setEditingPerson(null);
    } finally {
        setIsSaving(false);
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600'; // User has given more
    if (balance < 0) return 'text-red-600'; // User has received more (is owed)
    return 'text-muted-foreground';
  }
  
  const getBalanceText = (balance: number) => {
    if (balance === 0) return t('allSquare');
    if (balance > 0) return t('youHaveGivenMore', { amount: new Intl.NumberFormat().format(Math.abs(balance)) });
    return t('youAreOwed', { amount: new Intl.NumberFormat().format(Math.abs(balance)) });
  }

  const getRelationDisplay = (relationKey: string) => {
      const relation = relations.find(r => r.en === relationKey);
      if (!relation) return relationKey;
      return language === 'ur' ? relation.ur : relation.en;
  }

  const filteredPeople = useMemo(() => {
    return peopleWithBalances.filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [peopleWithBalances, searchTerm]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>{t('loadingContacts')}</p>
      </div>
    );
  }

  return (
    <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
            <h1 className="text-4xl font-headline flex items-center gap-2">
                <Users/>
                {t('peopleAndBalances')}
            </h1>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder={t('searchByName')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                    aria-label={t('searchByName')}
                    />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setEditingPerson(null); }}>
                <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('addPerson')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{editingPerson ? t('edit') : t('addNewPersonTitle')}</DialogTitle>
                    <DialogDescription>
                        {editingPerson ? "Edit this person's details." : t('addNewPersonDescription')}
                    </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            {t('name')}
                        </Label>
                        <div className="col-span-3">
                            <Input id="name" {...register('name')} className="w-full" />
                            {errors.name && <p className="text-sm font-medium text-destructive mt-1">{errors.name.message}</p>}
                        </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="relation" className="text-right">
                            {t('relation')}
                        </Label>
                        <div className="col-span-3">
                            <Controller
                                control={control}
                                name="relation"
                                render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('relation')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {relations.map(r => (
                                            <SelectItem key={r.en} value={r.en}>
                                                {getRelationDisplay(r.en)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                )}
                            />
                            {errors.relation && <p className="text-sm font-medium text-destructive mt-1">{errors.relation.message}</p>}
                        </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? t('saving') : (editingPerson ? t('saveChanges') : t('savePerson'))}
                        </Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
                </Dialog>
            </div>
        </div>

        {people.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map(person => (
                <Card key={person.id} className="flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{person.name}</CardTitle>
                            {person.relation && <CardDescription>{getRelationDisplay(person.relation)}</CardDescription>}
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
                              <DropdownMenuItem onClick={() => handleOpenDialog(person)}>
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
                                  Are you sure you want to delete {person.name}? This will not delete their transaction history, but it will remove them from your contacts. This action cannot be undone.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePerson(person.id)} className="bg-destructive hover:bg-destructive/90">
                                  {t('delete')}
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className={`text-3xl font-bold ${getBalanceColor(person.balance)}`}>
                    {new Intl.NumberFormat().format(Math.abs(person.balance))}
                    </p>
                    <p className={`text-sm mt-1 ${getBalanceColor(person.balance)}`}>
                    {getBalanceText(person.balance)}
                    </p>
                </CardContent>
                <CardFooter>
                    <Link href={`/people/${person.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                        {t('viewHistory')}
                        <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                </CardFooter>
                </Card>
            ))}
            </div>
        ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold text-foreground">{t('noPeopleAdded')}</h3>
            <p className="mt-2 mb-4">{t('clickAddPerson')}</p>
            <Button onClick={() => handleOpenDialog()}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('addPerson')}
                </Button>
            </div>
        )}
        </div>
    </AppLayout>
  );
}

    
