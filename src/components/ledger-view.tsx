'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { NiondraEntry, NiondraEntryDTO } from '@/lib/types';
import { NiondraEntrySheet } from '@/components/niondra-entry-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, LogOut, User as UserIcon } from 'lucide-react';
import { NiondraTimeline } from './niondra-timeline';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export function LedgerView() {
  const [entries, setEntries] = useState<NiondraEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NiondraEntry | undefined>(undefined);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) {
        setLoading(false);
        return;
      };

      setLoading(true);
      try {
        const q = query(collection(db, "niondra_entries"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const entriesData = querySnapshot.docs.map(doc => {
          const data = doc.data() as NiondraEntryDTO;
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
          }
        });
        setEntries(entriesData as NiondraEntry[]);
      } catch (error) {
        console.error("Error fetching entries: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch ledger entries.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user, toast]);

  const refetchEntries = async () => {
     if (!user) return;
      try {
        const q = query(collection(db, "niondra_entries"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const entriesData = querySnapshot.docs.map(doc => {
          const data = doc.data() as NiondraEntryDTO;
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
          }
        });
        setEntries(entriesData as NiondraEntry[]);
      } catch (error) {
        console.error("Error refetching entries: ", error);
        toast({
          title: "Error",
          description: "Failed to refresh ledger entries.",
          variant: "destructive",
        });
      }
  }

  const handleAddEntry = async (newEntry: Omit<NiondraEntry, 'id' | 'userId'>) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to add an entry.", variant: "destructive" });
        return;
    }
    try {
      await addDoc(collection(db, "niondra_entries"), {
        ...newEntry,
        userId: user.uid,
        date: Timestamp.fromDate(newEntry.date),
      });
      toast({
        title: "Success",
        description: "New entry added to the ledger.",
      });
      refetchEntries(); // Refetch to get the new entry with its ID
    } catch (error) {
      console.error("Error adding entry: ", error);
      toast({
        title: "Error",
        description: "Failed to add new entry.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEntry = async (updatedEntry: Omit<NiondraEntry, 'userId'>) => {
    try {
      const entryRef = doc(db, "niondra_entries", updatedEntry.id);
      const { id, ...dataToUpdate } = updatedEntry;
      await updateDoc(entryRef, {
        ...dataToUpdate,
        date: Timestamp.fromDate(dataToUpdate.date),
      });
      toast({
        title: "Success",
        description: "Entry has been updated.",
      });
      refetchEntries(); // Refetch to update the UI
    } catch (error) {
      console.error("Error updating entry: ", error);
      toast({
        title: "Error",
        description: "Failed to update entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, "niondra_entries", entryId));
      toast({
        title: "Success",
        description: "Entry has been deleted.",
      });
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry: ", error);
      toast({
        title: "Error",
        description: "Failed to delete entry.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenSheet = (entry?: Omit<NiondraEntry, 'userId'>) => {
    setEditingEntry(entry as NiondraEntry | undefined);
    setIsSheetOpen(true);
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleExport = () => {
    const headers = "id,direction,person,date,occasion,giftType,amount,description,notes\n";
    const csvContent = entries.map(e => 
      [
        e.id,
        e.direction,
        e.person,
        e.date.toISOString().split('T')[0],
        e.occasion,
        e.giftType,
        e.amount ?? '',
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.notes?.replace(/"/g, '""') || ''}"`
      ].join(',')
    ).join('\n');

    const csv = headers + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "niondra-ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-3xl font-headline text-foreground">Niondra Ledger</h1>
            <div className="flex items-center gap-4">
               <Button size="sm" onClick={() => handleOpenSheet()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                       <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                   <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Export Data</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>Loading ledger...</p>
          </div>
        ) : (
          <NiondraTimeline 
            entries={entries} 
            onEdit={handleOpenSheet} 
            onDelete={handleDeleteEntry} 
          />
        )}
      </main>

      <NiondraEntrySheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddEntry={handleAddEntry}
        onUpdateEntry={handleUpdateEntry}
        entry={editingEntry}
      />
    </div>
  );
}
