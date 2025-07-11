
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
import { CalendarIcon, Upload } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { NeondaraEntry, Person } from "@/lib/types"
import { Textarea } from "./ui/textarea"
import { useEffect, useState, useRef } from "react"
import { useLanguage } from "./language-provider"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

const MAX_FILE_SIZE = 500 * 1024; // 500KB

const formSchema = z.object({
  direction: z.enum(['given', 'received'], { required_error: "Please select a direction." }),
  personId: z.string({ required_error: "Please select a person." }),
  date: z.date({ required_error: "A date is required." }),
  occasion: z.enum(['Wedding', 'Birth', 'Housewarming', 'Other']),
  giftType: z.enum(['Money', 'Sweets', 'Gift', 'Other']),
  amount: z.coerce.number().positive("Amount must be positive.").optional(),
  description: z.string().min(1, "A description or image is required."), // Now only checks for non-emptiness
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.giftType === 'Money') {
        if (!data.amount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'An amount is required for money gifts.', path: ['amount'] });
        }
        if (!data.description || data.description.length === 0) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Currency (e.g., USD, CAD) is required.', path: ['description'] });
        }
    } else if (data.giftType === 'Sweets') {
        if (!data.amount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'An amount in kg is required.', path: ['amount'] });
        }
        if (!data.description || data.description.length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A description of the sweet is required.', path: ['description'] });
        }
    } else if (data.giftType === 'Gift') {
        if (!data.description || data.description.trim().length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A description or image of the gift is required.', path: ['description'] });
        }
    } else if (data.giftType === 'Other') {
      if (!data.description || data.description.trim().length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A description for the gift is required.', path: ['description'] });
        }
    }
});

type FormValues = z.infer<typeof formSchema>
type EntryInput = Omit<NeondaraEntry, 'id' | 'userId' | 'person'>;
type EntryUpdate = Omit<NeondaraEntry, 'userId' | 'person'>

interface NeondaraEntrySheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onAddEntry: (entry: EntryInput) => void;
    onUpdateEntry: (entry: EntryUpdate) => void;
    entry?: Omit<NeondaraEntry, 'userId'>;
    people: Person[];
}

export function NeondaraEntrySheet({ isOpen, onOpenChange, onAddEntry, onUpdateEntry, entry, people }: NeondaraEntrySheetProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
        }
    });

    useEffect(() => {
        if (isOpen) {
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

            if (entry && entry.giftType === 'Gift' && entry.description.startsWith('data:image')) {
                setImagePreview(entry.description);
            } else {
                setImagePreview(null);
            }
        }
    }, [entry, isOpen, form]);

    const giftType = form.watch("giftType");
    
    // Clear description when gift type changes away from 'Gift' with an image
    useEffect(() => {
        if (giftType !== 'Gift') {
            setImagePreview(null);
            if (form.getValues('description').startsWith('data:image')) {
                form.setValue('description', '');
            }
        }
    }, [giftType, form]);


    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: "Image Too Large",
                    description: `Please select an image smaller than ${MAX_FILE_SIZE / 1024}KB.`,
                    variant: "destructive"
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImagePreview(dataUrl);
                form.setValue('description', dataUrl, { shouldValidate: true }); 
            };
            reader.readAsDataURL(file);
        }
    };
    
    function onSubmit(values: FormValues) {
        let submissionValues = { ...values };

        if (values.giftType === 'Money' || values.giftType === 'Sweets') {
            submissionValues.amount = values.amount!;
        } else {
            submissionValues.amount = null;
        }
        
        const newEntryData = {
            ...submissionValues,
            amount: submissionValues.amount
        }

        if (entry) {
            onUpdateEntry({ ...newEntryData, id: entry.id });
        } else {
            onAddEntry(newEntryData);
        }
        onOpenChange(false);
    }

    const descriptionValue = form.watch('description');
    const isDescriptionImageData = descriptionValue && descriptionValue.startsWith('data:image');
    
    const getDescriptionLabel = () => {
        switch(giftType) {
            case 'Money':
                return `${t('currency')} *`;
            case 'Sweets':
                return `${t('description')} *`;
            case 'Other':
                return `${t('description')} *`;
            default:
                return `${t('description')} *`;
        }
    }
    const getDescriptionPlaceholder = () => {
        switch(giftType) {
            case 'Money':
                return t('currencyPlaceholder');
            case 'Sweets':
                return t('sweetDescriptionPlaceholder');
            case 'Other':
                return t('otherDescriptionPlaceholder');
            default:
                return t('otherDescriptionPlaceholder');
        }
    }


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{entry ? t('editEntry') : t('addNewEntry')}</SheetTitle>
          <SheetDescription>
            {t('entrySheetDescription')}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('direction')} *</FormLabel>
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
                        <FormLabel className="font-normal">{t('directionGiven')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="received" />
                        </FormControl>
                        <FormLabel className="font-normal">{t('directionReceived')}</FormLabel>
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
                  <FormLabel>{t('person')} *</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('person')} />
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
                  <FormLabel>{t('dateOfOccasion')} *</FormLabel>
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
                  <FormLabel>{t('occasion')} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('occasion')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Wedding">{t('occasionWedding')}</SelectItem>
                      <SelectItem value="Birth">{t('occasionBirth')}</SelectItem>
                      <SelectItem value="Housewarming">{t('occasionHousewarming')}</SelectItem>
                      <SelectItem value="Other">{t('occasionOther')}</SelectItem>
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
                  <FormLabel>{t('giftType')} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('giftType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Money">{t('giftTypeMoney')}</SelectItem>
                      <SelectItem value="Sweets">{t('giftTypeSweets')}</SelectItem>
                      <SelectItem value="Gift">{t('giftTypeGift')}</SelectItem>
                      <SelectItem value="Other">{t('giftTypeOther')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(giftType === 'Money' || giftType === 'Sweets') && (
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{giftType === 'Sweets' ? `${t('amount')} (kg) *` : `${t('amount')} *`}</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder={giftType === 'Sweets' ? "e.g., 2.5" : "e.g., 100"} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            {giftType !== 'Gift' && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getDescriptionLabel()}</FormLabel>
                    <FormControl>
                      <Input placeholder={getDescriptionPlaceholder()} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {giftType === 'Gift' && (
              <FormItem>
                <FormLabel>{t('giftImage')}</FormLabel>
                <FormControl>
                    <div 
                        className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                             <Image src={imagePreview} alt="Preview" width={200} height={192} className="h-full w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8" />
                                <p>{t('uploadImage')}</p>
                            </div>
                        )}
                    </div>
                </FormControl>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>{t('giftDescription')} *</FormLabel>
                      <FormControl>
                          <Input placeholder={t('giftDescriptionPlaceholder')} {...field} value={isDescriptionImageData ? '' : field.value} onChange={(e) => field.onChange(e.target.value)}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormItem>
            )}

            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('notesPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <Button type="submit">{entry ? t('saveChanges') : t('addEntry')}</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
