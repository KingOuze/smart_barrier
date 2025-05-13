export interface User {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  role: 'administrateur' | 'agent';
  archived?: boolean;
  dateCreation?: Date;
  dateMaj?: Date;
  organisme?: string;
}
