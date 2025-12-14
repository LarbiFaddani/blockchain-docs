// src/app/admin/models/admin.models.ts

// ---------- ENUMS ----------
export type OrgType = 'ECOLE' | 'ENTREPRISE';

// Ta requête RegisterOrganisationRequest
export interface RegisterOrganisationRequest {
  orgType: OrgType;

  // organisation (commun)
  name: string;
  address: string;
  city: string;
  emailContact: string;

  // admin à créer dans auth-service
  adminEmail: string;
  adminPassword: string;
  adminRole: string; // ex: "ECOLE_ADMIN" ou "ENTREPRISE_ADMIN"

  // ECOLE (optionnels selon orgType)
  numeroAutorisation?: string;
  typeEcole?: string; // ou enum si tu as un enum côté back
  anneeCreation?: string; // LocalDate en string "YYYY-MM-DD"
  nombreEtudiants?: number;

  // ENTREPRISE (optionnels)
  ice?: string;
  secteurActivite?: string;
  statutJuridique?: string;
}

// Réponse RegisterOrganisationResponse
export interface RegisterOrganisationResponse {
  orgId: number;
  type: string;
  name: string;
  adminUserId: number;
  adminEmail: string;
}

// ---------- ECOLE / ENTREPRISE ----------
export interface Ecole {
  id: number;
  name: string;
  address: string;
  city: string;
  emailContact: string;

  numeroAutorisation?: string;
  typeEcole?: string;
  anneeCreation?: string;
  nombreEtudiants?: number;

  adminUserId?: number;
}

export interface Entreprise {
  id: number;
  name: string;
  address: string;
  city: string;
  emailContact: string;

  ice?: string;
  secteurActivite?: string;
  statutJuridique?: string;

  adminUserId?: number;
}

// ---------- STUDENT ----------
export interface Student {
  id: number;
  userId: number;

  firstName: string;
  lastName: string;
  cin: string;

  birthDate?: string; // "YYYY-MM-DD"
  genre?: string;
  phoneNumber?: string;

  personalEmail?: string;
  level?: string;

  studentCode?: string;
  generatedPassword?: string;

  ecoleId?: number;
  filiereId?: number;

  enabled?: boolean | null; // ta logique "safe"
}

// ---------- FILIERE ----------
export type StatutAccreditation = 'En_Cours' | 'RENOUVLEE' | 'EXPIREE' | 'ACCREDITE';

export interface Filiere {
  id: number;
  nom: string;
  code: string;
  nomResponsableFiliere?: string;
  description?: string;

  accreditation?: string;
  statutAccreditation?: StatutAccreditation | string;

  dateDebutAccreditation?: string;
  dateFinAccreditation?: string;

  ecoleId?: number; // pas toujours présent selon ton FiliereResponse actuel
}

export interface CreateFiliereRequest {
  ecoleId: number;
  nom: string;
  code: string;
  nomResponsableFiliere?: string;
  description?: string;
  accreditation?: string;
  statutAccreditation?: string;
  dateDebutAccreditation?: string;
  dateFinAccreditation?: string;
}
export interface UserAdmin {
  id: number;
  email: string;
  role: 'ADMIN' | 'ECOLE_ADMIN' | 'ENTREPRISE_ADMIN' | 'ETUDIANT';
  enabled: boolean;
}