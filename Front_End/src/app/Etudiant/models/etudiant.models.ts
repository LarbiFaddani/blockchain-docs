export interface StudentDocumentDto {
  id: number;
  docType: string;
  hash: string;
  createdAt: string;
  downloadUrl: string;
}
export interface StudentResponse {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  cin?: string;
  birthDate?: string;
  genre?: string;
  phoneNumber?: string;
  personalEmail?: string;
  level?: string;
  studentCode?: string;
  ecoleId?: number;
  filiereId?: number;
  enabled?: boolean;
}
