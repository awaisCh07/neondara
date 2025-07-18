
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
import { Popover, PopoverContent, PopoverTrigger, PopoverPortal } from "./ui/popover"
import { CalendarIcon, Upload, X } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { NeondaraEntry, Person } from "@/lib/types"
import { Textarea } from "./ui/textarea"
import { useEffect, useState, useRef, useMemo } from "react"
import { useLanguage } from "./language-provider"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "./ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"


type FormValues = z.infer<ReturnType<typeof getFormSchema>>
type EntryInput = Omit<NeondaraEntry, 'id' | 'userId' | 'person'>;
type EntryUpdate = Omit<NeondaraEntry, 'userId' | 'person'>

interface NeondaraEntrySheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onAddEntry: (entry: EntryInput) => Promise<void>;
    onUpdateEntry: (entry: EntryUpdate) => Promise<void>;
    entry?: Omit<NeondaraEntry, 'userId'>;
    people: Person[];
}

const getFormSchema = (t: (key: any) => string) => z.object({
  direction: z.enum(['given', 'received'], { required_error: t('errorSelectDirection') }),
  personId: z.string({ required_error: t('errorSelectPerson') }),
  date: z.date({ required_error: t('errorSelectDate') }),
  event: z.enum(['Wedding', 'Birth', 'Housewarming', 'Other']),
  giftType: z.enum(['Money', 'Sweets', 'Gift', 'Other']),
  amount: z.coerce.number().positive({ message: t('errorPositiveAmount') }).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.giftType === 'Money') {
        if (!data.amount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('errorAmountRequired'), path: ['amount'] });
        }
    } else if (data.giftType === 'Sweets') {
        if (!data.amount) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('errorAmountKgRequired'), path: ['amount'] });
        }
    } else if (data.giftType === 'Gift') {
        if (!data.description) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('giftImageRequired'), path: ['description'] });
        }
    } else if (data.giftType === 'Other') {
      if (!data.description || data.description.trim().length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('errorDescriptionRequired'), path: ['description'] });
        }
    }
});


export function NeondaraEntrySheet({ isOpen, onOpenChange, onAddEntry, onUpdateEntry, entry, people }: NeondaraEntrySheetProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isMobile = useIsMobile();
    
    const formSchema = useMemo(() => getFormSchema(t), [t]);

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
                amount: entry.amount ?? undefined,
                description: entry.description ?? ""
            } : {
                direction: 'given',
                personId: undefined,
                date: new Date(),
                event: 'Wedding',
                giftType: 'Money',
                amount: undefined,
                description: '',
                notes: '',
            });

            if (entry && entry.giftType === 'Gift' && entry.description && entry.description.startsWith('data:image')) {
                setImagePreview(entry.description);
            } else {
                setImagePreview(null);
            }
        }
    }, [entry, isOpen, form]);

    const giftType = form.watch("giftType");
    
    useEffect(() => {
        // Clear errors when gift type changes
        form.clearErrors(["amount", "description"]);
        if (giftType !== 'Gift') {
            setImagePreview(null);
        }
    }, [giftType, form]);


    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImagePreview(dataUrl);
                form.setValue('description', dataUrl, { shouldValidate: true }); 
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setImagePreview(null);
        if(form.getValues('description')?.startsWith('data:image')) {
            form.setValue('description', '', { shouldValidate: true });
        }
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
    
    async function onSubmit(values: FormValues) {
        setIsSubmitting(true);
        try {
            let submissionValues = { ...values };
            
            if (values.giftType === 'Money') {
                submissionValues.amount = values.amount!;
                submissionValues.description = "";
            } else if (values.giftType === 'Sweets') {
                submissionValues.amount = values.amount!;
            } else {
                submissionValues.amount = null;
            }
            
            const newEntryData = {
                ...submissionValues,
                description: submissionValues.description || '',
                amount: submissionValues.amount
            }

            if (entry) {
                await onUpdateEntry({ ...newEntryData, id: entry.id });
            } else {
                await onAddEntry(newEntryData);
            }
            onOpenChange(false);
        } catch (error) {
            // Error toast is handled in DataProvider
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const getDescriptionLabel = () => {
        switch(giftType) {
            case 'Sweets':
                return `${t('description')}`;
            case 'Other':
                return `${t('description')} *`;
            default:
                return `${t('description')} *`;
        }
    }
    const getDescriptionPlaceholder = () => {
        switch(giftType) {
            case 'Sweets':
                return t('sweetDescriptionPlaceholder');
            case 'Other':
                return t('otherDescriptionPlaceholder');
            case 'Gift':
                return t('giftDescriptionPlaceholder');
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
                   <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                <FormLabel>{t('dateOfEvent')} *</FormLabel>
                {isMobile ? (
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
                        field.onChange(adjustedDate);
                      }}
                      className="block w-full"
                    />
                  </FormControl>
                ) : (
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
                    <PopoverPortal>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                      </PopoverContent>
                    </PopoverPortal>
                </Popover>
                )}
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
              control={form.control}
              name="event"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('event')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('event')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Wedding">{t('eventWedding')}</SelectItem>
                      <SelectItem value="Birth">{t('eventBirth')}</SelectItem>
                      <SelectItem value="Housewarming">{t('eventHousewarming')}</SelectItem>
                      <SelectItem value="Other">{t('eventOther')}</SelectItem>
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
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                            <FormLabel>{giftType === 'Sweets' ? `${t('quantityInKg')} *` : `${t('amount')} *`}</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder={giftType === 'Sweets' ? "e.g., 2.5" : "e.g., 100"} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            {(giftType === 'Sweets' || giftType === 'Other') && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getDescriptionLabel()}</FormLabel>
                    <FormControl>
                      <Input placeholder={getDescriptionPlaceholder()} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {giftType === 'Gift' && (
              <div className="space-y-4">
                <div>
                  <FormLabel>{t('giftImage')}</FormLabel>
                  <div 
                      className="mt-2 w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary cursor-pointer relative"
                      onClick={() => fileInputRef.current?.click()}
                  >
                      {imagePreview ? (
                        <>
                            <Image src={imagePreview} alt="Preview" fill className="object-contain rounded-md p-2" />
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 bg-background/50 hover:bg-background/80 rounded-full h-7 w-7" onClick={(e) => { e.stopPropagation(); removeImage();}}>
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                      ) : (
                          <div className="text-center">
                              <Upload className="mx-auto h-8 w-8" />
                              <p>{t('uploadImage')}</p>
                          </div>
                      )}
                  </div>
                  <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                  />
                  <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                </div>

                <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">{t('or')}</span>
                  <Separator className="flex-1" />
                </div>
              
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('giftDescription')}</FormLabel>
                      <FormControl>
                        <Input placeholder={getDescriptionPlaceholder()} {...field} value={field.value?.startsWith('data:image') ? '' : field.value || ''}
                          onChange={(e) => {
                            removeImage(); // Clear image if user types description
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('notesPlaceholder')} {...field} value={field.value || ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('saving') : (entry ? t('saveChanges') : t('addEntry'))}
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
