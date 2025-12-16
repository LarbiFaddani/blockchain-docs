export interface VerifyResponse {
  valid: boolean;
  message: string;
  orgId: number | null;
  userId: number | null;
  docType: string | null;
  downloadUrl: string | null;
}
export interface EntrepriseAdminDto {
  id: number;
  name: string;
  address: string;
  city: string;
  emailContact: string;
  adminUserId: number;
  ice: string;
  secteurActivite: string;
  statutJuridique: string;
}
export interface EntrepriseUpdateRequest {
  name: string;
  address: string;
  city: string;
  emailContact: string;
  ice: string;
  secteurActivite: string;
  statutJuridique: string;
}
export interface StudentResponse {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  cin: string;
  birthDate?: string;
  genre?: string;
  phoneNumber?: string;
  personalEmail?: string;
  studentCode?: string;
  ecoleId?: number;
  filiereId?: number;
  level?: string;
  enabled?: boolean;
}
