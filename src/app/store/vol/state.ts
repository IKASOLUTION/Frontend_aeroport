import { Vol } from "./model";
export interface VolState {
    vols: Vol[];
    selectedVol: Vol | null;
    loading: boolean;
    error: string | null;
    totalItems: number;
}

export const initialVolState: VolState = {
    vols: [],
    selectedVol: null,
    loading: false,
    error: null,
    totalItems: 0
};