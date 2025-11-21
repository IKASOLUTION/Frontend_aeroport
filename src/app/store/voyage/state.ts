import {Voyage } from "./model";
export interface VoyageState {
     voyages: Voyage[];
     selectedVoyage: Voyage | null;
    loading: boolean;
    error: string | null;
    totalItems: number;

}



export const initialVoyageState: VoyageState = {
    voyages: [],
    selectedVoyage: null,
    loading: false,
    error: null,
    totalItems: 0
};