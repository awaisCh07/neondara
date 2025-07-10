import type { Timestamp } from "firebase/firestore";

export type Occasion = "Wedding" | "Birth" | "Housewarming" | "Other";
export type GiftType = "Money" | "Sweets" | "Item";

export type RelationType = 
  | "Aunt (Chachi, Khala, Mami, Phuppi)"
  | "Brother (Bhai)"
  | "Brother-in-law (Saala, Behan ka Shohar)"
  | "Cousin (Cousin)"
  | "Daughter (Beti)"
  | "Father (Abu)"
  | "Father-in-law (Sasur)"
  | "Friend (Dost)"
  | "Grandfather (Dada, Nana)"
  | "Grandmother (Dadi, Nani)"
  | "Mother (Ammi)"
  | "Mother-in-law (Saas)"
  | "Nephew (Bhatija, Bhanja)"
  | "Niece (Bhatiji, Bhanji)"
  | "Other"
  | "Sister (Behan)"
  | "Sister-in-law (Saali, Bhabi)"
  | "Son (Beta)"
  | "Uncle (Chacha, Khalu, Mamu, Phuppa)";

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
