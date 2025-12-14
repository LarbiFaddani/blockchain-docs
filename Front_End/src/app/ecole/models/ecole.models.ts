// ----------------- ENUMS -----------------

export type TypeEcole = 'PUBLIC' | 'SEMI_PUBLIC' | 'PRIVEE';

export type StatutAccreditation =
  | 'En_Cours'
  | 'RENOUVLEE'
  | 'EXPIREE'
  | 'ACCREDITE';

// ----------------- DTO FRONT -----------------

export interface EcoleDetails {
  id: number;
  name: string;
  address?: string;
  city?: string;
  emailContact?: string;
  numeroAutorisation?: string;
  typeEcole?: TypeEcole;
  anneeCreation?: number;        // ✅ Integer backend
  nombreEtudiants?: number;      // ✅ Integer backend
}

export interface Filiere {
  id: number;
  nom: string;
  code: string;
  nomResponsableFiliere?: string;
  description?: string;
  accreditation?: string;
  statutAccreditation?: StatutAccreditation;
  dateDebutAccreditation?: string; // ✅ LocalDate -> "YYYY-MM-DD"
  dateFinAccreditation?: string;   // ✅ LocalDate -> "YYYY-MM-DD"
}

export interface Student {
  id: number;
  userId?: number;
  
  enabled?: boolean;

  firstName: string;
  lastName: string;
  cin: string;

  birthDate?: string;    
  genre?: string;         
  phoneNumber?: string;

  level?: string;
  personalEmail: string;

  studentCode?: string;

  ecoleId?: number;
  filiereId?: number;

  generatedPassword?: string;
}


// ----------------- PAYLOADS -----------------

export interface CreateFilierePayload {
  ecoleId: number;
  nom: string;
  code: string;
  nomResponsableFiliere?: string;
  description?: string;
  accreditation?: string;
  statutAccreditation?: StatutAccreditation;
  dateDebutAccreditation?: string;
  dateFinAccreditation?: string;
}

export type UpdateFilierePayload = CreateFilierePayload;

export interface CreateStudentPayload {
  ecoleId: number;
  filiereId: number;
  firstName: string;
  lastName: string;
  cin: string;
  birthDate: string;     // "YYYY-MM-DD"
  genre: string;
  phoneNumber?: string;
  personalEmail: string;
  level?: string;
}

export interface UpdateStudentPayload {
  ecoleId?: number;
  filiereId?: number;
  firstName?: string;
  lastName?: string;
  cin?: string;
  birthDate?: string;
  genre?: string;
  phoneNumber?: string;
  personalEmail?: string;
  level?: string;
}

export interface UpdateEcolePayload {
  name?: string;
  address?: string;
  city?: string;
  emailContact?: string;
  numeroAutorisation?: string;
  typeEcole?: TypeEcole;
  anneeCreation?: number;
  nombreEtudiants?: number;
}
export interface DocumentModel {
  id: number;

  orgId: number;        // école
  userId: number;       // étudiant

  docType: string;     // Diplôme, Attestation, Relevé...
  filePath: string;    // URL ou chemin backend

  hash: string;        // hash SHA-256
  blockchainTx?: string;

  createdAt: string;   // ISO date (Instant → string)
}

