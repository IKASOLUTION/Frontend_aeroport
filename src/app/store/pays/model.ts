export interface Pays {
  id?: number;     
  nom?: string;
  code?: string;
}

export interface PaysList {
  Payss: Pays[];
  selectedPays: Pays | null;
  loading: boolean;
  error: string | null;
}