import {props, createAction} from '@ngrx/store';
import { ListeNoire } from './model';


// ✅ Action sans wrapper
export const createListeNoire = createAction(
    '[Aeroport] Create ListeNoire', 
    props<ListeNoire>()
);

export const updateListeNoire = createAction(
    '[ListeNoire] Update ListeNoire', 
    props<ListeNoire>()
);

export const deleteListeNoire = createAction(
    '[Aeroport] Delete ListeNoire', 
    props<ListeNoire>()
);

export const changerStatusListeNoire = createAction(
    '[Aeroport] Change Status ListeNoire', 
    props<ListeNoire>()
);

export const loadListeNoire = createAction('[Aeroport] Load ListeNoire');

export const setListeNoire = createAction(
    '[Aeroport] Set ListeNoire',  
    props<{listeNoires: ListeNoire[]}>()
);