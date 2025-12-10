export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'ECOLE_ADMIN' | 'ENTREPRISE_ADMIN' | 'ADMIN';
}

export interface RegisterOrganisationRequest {
  orgName: string;
  orgAddress?: string;
  orgCity?: string;
  orgEmailContact?: string;

  adminEmail: string;
  adminPassword: string;
  adminRole: 'ECOLE_ADMIN' | 'ENTREPRISE_ADMIN' | 'ADMIN';

  numeroAutorisation?: string; // ecole
  typeEcole?: string;          // "SUP", "INGENIERIE"... selon ton enum
  ice?: string;                // entreprise
}

export interface RegisterOrganisationResponse {
  organisationId: number;
  adminUserId: number;
  message?: string;
}
