
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import type { Person, NiondraEntry, NiondraEntryDTO, RelationType, Relation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, UserPlus, Users, ArrowRight, ArrowLeft, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/language-provider';

const relations: Relation[] = [
    { en: "Aunt", ur: "Chachi, Khala, Mami, Phuppi" },
    { en: "Brother", ur: "Bhai" },
    { en: "Brother-in-law", ur: "Saala, Behan ka Shohar" },
    { en: "Cousin", ur: "Cousin" },
    { en: "Daughter", ur: "Beti" },
    { en: "Father", ur: "Abu, Baba" },
    { en: "Father-in-law", ur: "Sasur" },
    { en: "Friend", ur: "Dost" },
    { en: "Grandfather", ur: "Dada, Nana" },
    { en: "Grandmother", ur: "Dadi, Nani" },
    { en: "Mother", ur: "Ammi, Maa" },
    { en: "Mother-in-law", ur: "Saas" },
    { en: "Nephew", ur: "Bhatija, Bhanja" },
    { en: "Niece", ur: "Bhatiji, Bhanji" },
    { en: "Other", ur: "Other" },
    { en: "Sister", ur: "Behan" },
    { en: "Sister-in-law", ur: "Saali, Bhabi" },
    { en: "Son", ur: "Beta" },
    { en: "Uncle", ur: "Chacha, Khalu, Mamu, Phuppa" },
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
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [people, setPeople] = useState<PersonWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      relation: "Friend"
    }
  });

  const fetchPeopleAndBalances = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch people
      const peopleQuery = query(collection(db, 'people'), where('userId', '==', user.uid));
      const peopleSnap = await getDocs(peopleQuery);
      const peopleData = peopleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person));

      // Fetch all entries for the user
      const entriesQuery = query(collection(db, 'niondra_entries'), where('userId', '==', user.uid));
      const entriesSnap = await getDocs(entriesQuery);
      const entriesData = entriesSnap.docs.map(doc => doc.data() as NiondraEntry);

      // Calculate balances
      const peopleWithBalances = peopleData.map(person => {
        const personEntries = entriesData.filter(entry => entry.personId === person.id && entry.giftType === 'Money');
        let given = 0;
        let received = 0;
        personEntries.forEach(entry => {
          if (entry.direction === 'given') {
            given += entry.amount || 0;
          } else {
            received += entry.amount || 0;
          }
        });
        return { ...person, balance: given - received };
      });

      setPeople(peopleWithBalances.sort((a,b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Error fetching people and balances: ", error);
      toast({ title: t('error'), description: "Could not fetch your contacts.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPeopleAndBalances();
    }
  }, [user]);
  
  const handleAddPerson = async (data: PersonFormData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'people'), {
        name: data.name,
        relation: data.relation,
        userId: user.uid,
      });
      toast({ title: t('success'), description: `${data.name} has been added.` });
      reset();
      setIsDialogOpen(false);
      fetchPeopleAndBalances();
    } catch (error) {
       console.error("Error adding person: ", error);
       toast({ title: t('error'), description: "Failed to add person.", variant: "destructive" });
    }
  };
  
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600'; // User will receive
    if (balance < 0) return 'text-red-600'; // User will give
    return 'text-muted-foreground';
  }
  
  const getBalanceText = (balance: number) => {
    if (balance === 0) return t('allSquare');
    if (balance > 0) return t('youWillReceive'); // You gave more
    return t('youWillGive'); // You received more
  }

  const getRelationDisplay = (relationKey: string) => {
      const relation = relations.find(r => r.en === relationKey);
      if (!relation) return relationKey;

      if (language === 'ur') {
          return `${relation.ur} (${relation.en})`;
      }
      return `${relation.en} (${relation.ur})`;
  }


  const filteredPeople = useMemo(() => {
    return people.filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [people, searchTerm]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4"/>
          {t('backToLedger')}
      </Link>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('addPerson')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{t('addNewPersonTitle')}</DialogTitle>
                <DialogDescription>
                    {t('addNewPersonDescription')}
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleAddPerson)}>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('relation')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {relations.map(r => (
                                        <SelectItem key={r.en} value={r.en}>
                                            {language === 'ur' ? `${r.ur} (${r.en})` : `${r.en} (${r.ur})`}
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
                    <Button type="submit">{t('savePerson')}</Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      {loading ? (
        <p>{t('loadingContacts')}</p>
      ) : people.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map(person => (
            <Card key={person.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{person.name}</CardTitle>
                        {person.relation && <CardDescription>{getRelationDisplay(person.relation)}</CardDescription>}
                    </div>
                    <CardDescription>{t('balance')}</CardDescription>
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
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('addPerson')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{t('addNewPersonTitle')}</DialogTitle>
                <DialogDescription>
                    {t('addNewPersonDescription')}
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleAddPerson)}>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('relation')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {relations.map(r => (
                                            <SelectItem key={r.en} value={r.en}>
                                                {language === 'ur' ? `${r.ur} (${r.en})` : `${r.en} (${r.ur})`}
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
                        <Button type="submit">{t('savePerson')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      )}
    </div>
  );
}
