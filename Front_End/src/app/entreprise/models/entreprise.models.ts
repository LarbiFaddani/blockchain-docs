export interface VerifyResponse {
  valid: boolean;
  message: string;
  orgId: number | null;
  userId: number | null;
  docType: string | null;
  downloadUrl: string | null;
}
