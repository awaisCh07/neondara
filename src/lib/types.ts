import type { Timestamp } from "firebase/firestore";

export type Occasion = "Wedding" | "Birth" | "Housewarming" | "Other";
export type GiftType = "Money" | "Sweets" | "Item";

export type RelationType = 
  | "Chachu" | "Chachi" | "Mamu" | "Mami" | "Dadi Amma" | "Dada Abu"
  | "Nani Amma" | "Nana Abu" | "Khala" | "Khalu" | "Bhai" | "Behan"
  | "Bhateeja" | "Bhateeji" | "Bhaanja" | "Bhaanji" | "Friend" | "Other";

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
