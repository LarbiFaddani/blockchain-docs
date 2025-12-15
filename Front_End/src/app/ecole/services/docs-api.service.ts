import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ✅ Utilise tes modèles existants
import { Filiere, Student } from '../models/ecole.models';
import { DocumentModel } from '../models/ecole.models';

/**
 * Résultat typé pour l'écran "Résultats" (vérification / enregistrement)
 * Ajuste les champs selon la réponse réelle de ton backend.
 */
export interface DocumentBlockchainResult {
  valid: boolean;
  message: string;

  blockchainTx?: string;
  blockNumber?: number;
  network?: string;
  timestamp?: string;

  meta?: {
    studentName: string;
    studentCin: string;
    filiereName: string;
    docType: string;
  };
}

@Injectable({ providedIn: 'root' })
export class DocsApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* =========================
   *  FILIERES + STUDENTS
   * ========================= */

  // ✅ Filieres de l'école (pour le select)
  getFilieresByEcoleId(ecoleId: number): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.baseUrl}/filieres/by-ecole/${ecoleId}`);
  }

  /**
   * ✅ Etudiants par école (optionnel)
   * Utile si tu veux précharger tout et filtrer côté front.
   */
  getStudentsByEcoleId(ecoleId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students/by-ecole/${ecoleId}`);
  }

  /**
   * ✅ Etudiants par filière (recommandé pour ton formulaire)
   * Route proposée : /students/by-filiere/{filiereId}
   */
  getStudentsByFiliereId(filiereId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students/by-filiere/${filiereId}`);
  }

  /**
   * Variante si ton backend attend une query param :
   * GET /students/by-filiere?filiereId=...
   */
  getStudentsByFiliereQuery(filiereId: number): Observable<Student[]> {
    const params = new HttpParams().set('filiereId', filiereId.toString());
    return this.http.get<Student[]>(`${this.baseUrl}/students/by-filiere`, { params });
  }

  /* =========================
   *  DOCUMENTS
   * ========================= */

  /**
   * ✅ Upload + création document côté docs-service
   * Exemple route : POST /docs/create
   * - multipart/form-data: file + orgId + userId + docType (+ filiereId optionnel)
   */
  createDocument(args: {
    orgId: number;        // école
    userId: number;       // étudiant
    docType: string;
    file: File;
    filiereId?: number;   // optionnel
  }): Observable<DocumentModel> {
    const formData = new FormData();
    formData.append('file', args.file);
    formData.append('orgId', args.orgId.toString());
    formData.append('userId', args.userId.toString());
    formData.append('docType', args.docType);

    if (args.filiereId !== undefined) {
      formData.append('filiereId', args.filiereId.toString());
    }

    //return this.http.post<DocumentModel>(`${this.baseUrl}/docs/create`, formData);
        return this.http.post<DocumentModel>(`http://localhost:8080/api/docs/create`, formData);

  }

  /**
   * ✅ Vérifier un document (sans créer) - multipart
   * Exemple route : POST /docs/verify
   */
  verifyDocument(file: File): Observable<DocumentBlockchainResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DocumentBlockchainResult>(`${this.baseUrl}/docs/verify`, formData);
  }

  getDocumentsByEcoleId(ecoleId: number): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${this.baseUrl}/api/docs/by-ecole/${ecoleId}`);
  }

  /**
   * ✅ Liste documents par école (pour tableau/historique)
   * Exemple route : GET /docs/by-org/{orgId}
   */
  getDocumentsByOrgId(orgId: number): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${this.baseUrl}/docs/by-org/${orgId}`);
  }

  /**
   * ✅ Liste documents par étudiant
   * Exemple route : GET /docs/by-user/{userId}
   */
  getDocumentsByUserId(userId: number): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${this.baseUrl}/docs/by-user/${userId}`);
  }

  /**
   * ✅ Téléchargement/preview du fichier si ton backend expose un endpoint
   * Exemple : GET /docs/file/{docId} -> blob
   */
  downloadDocumentFile(docId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/docs/file/${docId}`, { responseType: 'blob' });
  }
}
