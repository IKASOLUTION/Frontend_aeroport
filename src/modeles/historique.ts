export interface ActionHistorique {
    id: number;
    utilisateur: string;
    type_action: string;
    detail_action: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE';
    adresse_ip: string;
    date_action: string;
}
