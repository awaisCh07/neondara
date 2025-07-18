
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, Trash2, UserPlus } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Person, SharedBill } from "@/lib/types"
import { Textarea } from "./ui/textarea"
import { useEffect, useState, useMemo } from "react"
import { useLanguage } from "./language-provider"
import { Checkbox } from "./ui/checkbox"

type FormValues = z.infer<ReturnType<typeof getFormSchema>>

interface SharedBillSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (data: Omit<SharedBill, 'id' | 'userId'>, billId?: string) => Promise<void>;
    bill?: SharedBill | null;
    people: Person[];
}

const getFormSchema = (t: (key: any) => string) => z.object({
  description: z.string().min(2, { message: t('errorMin2Chars')}),
  totalAmount: z.coerce.number().positive({ message: t('errorPositiveAmount') }),
  date: z.date({ required_error: t('errorSelectDate') }),
  payerId: z.string({ required_error: t('errorSelectPayer') }),
  participants: z.array(z.object({
    personId: z.string(),
    shareAmount: z.coerce.number().min(0),
    isPaid: z.boolean(),
  })).min(1, { message: t('errorAddParticipant') }),
});


export function SharedBillSheet({ isOpen, onOpenChange, onSave, bill, people }: SharedBillSheetProps) {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const formSchema = useMemo(() => getFormSchema(t), [t]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            participants: [],
        }
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "participants"
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(bill ? {
                ...bill,
            } : {
                description: '',
                totalAmount: undefined,
                date: new Date(),
                payerId: undefined,
                participants: [],
            });
        }
    }, [bill, isOpen, form]);

    const totalAmount = form.watch("totalAmount");
    const participantIds = form.watch("participants").map(p => p.personId);

    const handleSplitEqually = () => {
        if (!totalAmount || fields.length === 0) return;
        const share = totalAmount / fields.length;
        fields.forEach((field, index) => {
            form.setValue(`participants.${index}.shareAmount`, parseFloat(share.toFixed(2)));
        });
    }

    const addParticipant = () => {
        const unselectedPerson = people.find(p => !participantIds.includes(p.id));
        if (unselectedPerson) {
            append({ personId: unselectedPerson.id, shareAmount: 0, isPaid: false });
        }
    }
    
    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            await onSave(values, bill?.id);
            onOpenChange(false);
        } catch (error) {
            // Error toast is handled in DataProvider
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{bill ? t('editBill') : t('addBill')}</SheetTitle>
          <SheetDescription>
            {t('billSheetDescription')}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')} *</FormLabel>
                   <FormControl>
                    <Input placeholder={t('billDescriptionPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('totalAmount')} *</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 3000" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('date')} *</FormLabel>
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
                                    <span>{t('pickDate')}</span>
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
            </div>

            <FormField
              control={form.control}
              name="payerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paidBy')} *</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectPayer')} />
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
            
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">{t('participants')} *</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addParticipant} disabled={fields.length >= people.length}>
                        <UserPlus className="mr-2 h-4 w-4"/>
                        {t('addParticipant')}
                    </Button>
                </div>
                 {fields.length > 0 && (
                    <div className="space-y-4 rounded-md border p-4">
                        <Button type="button" size="sm" onClick={handleSplitEqually}>{t('splitEqually')}</Button>
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr,100px,auto,auto] gap-2 items-center">
                                 <FormField
                                    control={form.control}
                                    name={`participants.${index}.personId`}
                                    render={({ field }) => (
                                         <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('person')} />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {people.filter(p => p.id === field.value || !participantIds.includes(p.id)).map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`participants.${index}.shareAmount`}
                                    render={({ field }) => (
                                        <Input type="number" placeholder={t('share')} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`participants.${index}.isPaid`}
                                    render={({ field }) => (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <FormLabel>{t('paid')}</FormLabel>
                                        </div>
                                    )}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <FormMessage>{form.formState.errors.participants?.message || form.formState.errors.participants?.root?.message}</FormMessage>
            </div>


            <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('saving') : (bill ? t('saveChanges') : t('saveBill'))}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
