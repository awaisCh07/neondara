import type { Timestamp } from "firebase/firestore";

export type Occasion = "Wedding" | "Birth" | "Housewarming" | "Other";
export type GiftType = "Money" | "Sweets" | "Item";

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

export type NiondraEntry = {
  id: string;
  userId: string;
  personId: string;
  person: string; // This is for display purposes, resolved from personId
  direction: 'given' | 'received';
  date: Date;
  occasion: Occasion;
  giftType: GiftType;
  amount: number | null;
  description: string;
  notes?: string;
};

export type NiondraEntryDTO = Omit<NiondraEntry, 'id' | 'date' | 'person'> & {
  date: Timestamp;
};

    