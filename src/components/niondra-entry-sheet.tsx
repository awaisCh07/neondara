"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { NiondraEntry, Person } from "@/lib/types"
import { Textarea } from "./ui/textarea"
import { useEffect } from "react"

const formSchema = z.object({
  direction: z.enum(['given', 'received'], { required_error: "Please select a direction." }),
  personId: z.string({ required_error: "Please select a person." }),
  date: z.date({ required_error: "A date is required." }),
  occasion: z.enum(['Wedding', 'Birth', 'Housewarming', 'Other']),
  giftType: z.enum(['Money', 'Sweets', 'Item']),
  amount: z.coerce.number().positive("Amount must be positive.").optional(),
  description: z.string(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.giftType === 'Money') {
        if (!data.amount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'An amount is required for money gifts.',
                path: ['amount'],
            });
        }
        if (data.description.length === 0) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Currency (e.g., USD, CAD) is required.',
                path: ['description'],
            });
        }
    } else {
        if (data.description.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'A description of at least 2 characters is required.',
                path: ['description'],
            });
        }
    }
});

type FormValues = z.infer<typeof formSchema>
type EntryInput = Omit<NiondraEntry, 'id' | 'userId' | 'person'>;
type EntryUpdate = Omit<NiondraEntry, 'userId' | 'person'>

interface NiondraEntrySheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onAddEntry: (entry: EntryInput) => void;
    onUpdateEntry: (entry: EntryUpdate) => void;
    entry?: Omit<NiondraEntry, 'userId'>;
    people: Person[];
}

export function NiondraEntrySheet({ isOpen, onOpenChange, onAddEntry, onUpdateEntry, entry, people }: NiondraEntrySheetProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        form.reset(entry ? {
            ...entry,
            amount: entry.amount ?? undefined
        } : {
            direction: 'given',
            personId: undefined,
            date: new Date(),
            occasion: 'Wedding',
            giftType: 'Money',
            amount: undefined,
            description: '',
            notes: '',
        });
    }, [entry, isOpen, form]);

    const giftType = form.watch("giftType");

    function onSubmit(values: FormValues) {
        const newEntryData = {
            ...values,
            amount: values.giftType === 'Money' ? values.amount! : null
        }
        if (entry) {
            onUpdateEntry({ ...newEntryData, id: entry.id });
        } else {
            onAddEntry(newEntryData);
        }
        onOpenChange(false);
    }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{entry ? 'Edit Entry' : 'Add New Entry'}</SheetTitle>
          <SheetDescription>
            Record a Niondra exchange. Fill in the details below.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Direction *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="given" />
                        </FormControl>
                        <FormLabel className="font-normal">Given</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="received" />
                        </FormControl>
                        <FormLabel className="font-normal">Received</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="personId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person *</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a person" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {people.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Occasion *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occasion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occasion *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an occasion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Birth">Birth</SelectItem>
                      <SelectItem value="Housewarming">Housewarming</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="giftType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gift Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a gift type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Money">Money</SelectItem>
                      <SelectItem value="Sweets">Sweets</SelectItem>
                      <SelectItem value="Item">Item</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {giftType === 'Money' && (
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount *</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{giftType === 'Money' ? 'Currency *' : 'Description *'}</FormLabel>
                  <FormControl>
                    <Input placeholder={giftType === 'Money' ? "e.g., USD, CAD" : "e.g., Box of mithai"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional remarks..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <Button type="submit">{entry ? 'Save Changes' : 'Add Entry'}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
