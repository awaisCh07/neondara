export type Occasion = "Wedding" | "Birth" | "Housewarming" | "Other";
export type GiftType = "Money" | "Sweets" | "Item";

export type NiondraEntry = {
  id: string;
  direction: 'given' | 'received';
  person: string;
  date: Date;
  occasion: Occasion;
  giftType: GiftType;
  amount: number | null;
  description: string;
  notes?: string;
};
