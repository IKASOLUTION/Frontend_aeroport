export interface Passager {
  id_unique: string;
  nom: string;
  prenom: string;
  date_naissance: string; // DD/MM/YYYY
  nationalite: string;
  profession: string;
  lieu_naissance: string;
  pays_residence: string;
  adresse_etranger: string;
  telephone_etranger: string;
  adresse_burkina: string;
  telephone_burkina: string;
  email: string | null;
  type_document: string;
  numero_document: string;
  date_delivrance_doc: string; // DD/MM/YYYY
  lieu_delivrance_doc: string;
  code_empreinte: string;
  photo_profil_url: string;
  photo_identite_url: string;
  doc_recto_url: string;
  doc_verso_url: string;
  empreinte_gauche_url: string;
  empreinte_droite_url: string;
  empreinte_pouces_url: string;
}
