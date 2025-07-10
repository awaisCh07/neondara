
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import type { Person, NiondraEntry, NiondraEntryDTO, RelationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, UserPlus, Users, ArrowRight } from 'lucide-react';
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

const relations: RelationType[] = ["Chachu", "Chachi", "Mamu", "Mami", "Dadi Amma", "Dada Abu", "Nani Amma", "Nana Abu", "Khala", "Khalu", "Bhai", "Behan", "Bhateeja", "Bhateeji", "Bhaanja", "Bhaanji", "Friend", "Other"];

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
  const [people, setPeople] = useState<PersonWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        let balance = 0;
        personEntries.forEach(entry => {
          if (entry.direction === 'received') {
            balance += entry.amount || 0;
          } else {
            balance -= entry.amount || 0;
          }
        });
        return { ...person, balance };
      });

      setPeople(peopleWithBalances.sort((a,b) => a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Error fetching people and balances: ", error);
      toast({ title: "Error", description: "Could not fetch your contacts.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeopleAndBalances();
  }, [user, toast]);
  
  const handleAddPerson = async (data: PersonFormData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'people'), {
        name: data.name,
        relation: data.relation,
        userId: user.uid,
      });
      toast({ title: "Success", description: `${data.name} has been added.` });
      reset();
      setIsDialogOpen(false);
      fetchPeopleAndBalances();
    } catch (error) {
       console.error("Error adding person: ", error);
       toast({ title: "Error", description: "Failed to add person.", variant: "destructive" });
    }
  };
  
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-muted-foreground';
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline flex items-center gap-2">
            <Users/>
            People & Balances
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Person</DialogTitle>
              <DialogDescription>
                Add a new friend or relative to your ledger.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddPerson)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <div className="col-span-3">
                    <Input id="name" {...register('name')} className="w-full" />
                    {errors.name && <p className="text-sm font-medium text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="relation" className="text-right">
                    Relation
                  </Label>
                  <div className="col-span-3">
                     <Controller
                        control={control}
                        name="relation"
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a relation" />
                            </SelectTrigger>
                            <SelectContent>
                                {relations.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
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
                <Button type="submit">Save person</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading your contacts...</p>
      ) : people.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map(person => (
            <Card key={person.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{person.name}</CardTitle>
                        {person.relation && <CardDescription>{person.relation}</CardDescription>}
                    </div>
                    <CardDescription>Balance</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className={`text-3xl font-bold ${getBalanceColor(person.balance)}`}>
                  {new Intl.NumberFormat().format(person.balance)}
                </p>
                 <p className={`text-sm mt-1 ${getBalanceColor(person.balance)}`}>
                  {person.balance === 0 ? "All square" : person.balance > 0 ? "They owe you" : "You owe them"}
                </p>
              </CardContent>
              <CardFooter>
                 <Link href={`/people/${person.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View History
                      <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold text-foreground">No People Added Yet</h3>
          <p className="mt-2 mb-4">Click "Add Person" to start building your Niondra network.</p>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Person
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add a New Person</DialogTitle>
                <DialogDescription>
                    Add a new friend or relative to your ledger.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleAddPerson)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <div className="col-span-3">
                            <Input id="name" {...register('name')} className="w-full" />
                            {errors.name && <p className="text-sm font-medium text-destructive mt-1">{errors.name.message}</p>}
                        </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="relation" className="text-right">
                            Relation
                        </Label>
                        <div className="col-span-3">
                            <Controller
                                control={control}
                                name="relation"
                                render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a relation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {relations.map(r => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
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
                        <Button type="submit">Save person</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      )}
    </div>
  );
}
