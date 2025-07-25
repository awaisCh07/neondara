
import type { Timestamp } from "firebase/firestore";

export type Event = "Wedding" | "Birth" | "Housewarming" | "Other";
export type GiftType = "Money" | "Sweets" | "Gift" | "Other";

export type RelationType = 
  | "Aunt"
  | "Brother"
  | "Brother-in-law"
  | "Cousin"
  | "Daughter"
  | "Father"
  | "Father-in-law"
  | "Friend"
  | "Grandfather"
  | "Grandmother"
  | "Mother"
  | "Mother-in-law"
  | "Nephew"
  | "Niece"
  | "Other"
  | "Sister"
  | "Sister-in-law"
  | "Son"
  | "Uncle";

export type Relation = {
  en: RelationType;
  ur: string;
}

export type Person = {
    id: string;
    userId: string;
    name: string;
    relation?: RelationType;
    notes?: string;
}

export type NeondaraEntry = {
  id: string;
  userId: string;
  personId: string;
  person: string; // This is for display purposes, resolved from personId
  direction: 'given' | 'received';
  date: Date;
  event: Event;
  giftType: GiftType;
  amount: number | null;
  description: string; // Used for currency, item description, or gift image URL
  notes?: string;
};

export type NeondaraEntryDTO = Omit<NeondaraEntry, 'id' | 'date' | 'person'> & {
  date: Timestamp;
};

export type SharedBillParticipant = {
  personId: string;
  shareAmount: number;
  isPaid: boolean;
};

export type SharedBill = {
  id: string;
  userId: string;
  description: string;
  totalAmount: number;
  date: Date;
  payerId: string;
  participants: SharedBillParticipant[];
};

export type SharedBillDTO = Omit<SharedBill, 'id' | 'date'> & {
  date: Timestamp;
};
