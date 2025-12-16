import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { VerifyResponse, EntrepriseAdminDto, EntrepriseUpdateRequest ,StudentResponse} from '../models/entreprise.models';

@Injectable({
  providedIn: 'root'
})
export class VerifyApiService {

  private readonly baseUrl = 'http://localhost:8080/api';
    private readonly baseUrlorg = 'http://localhost:8080/orgs';
    private readonly baseUrlstu = 'http://localhost:8080/student';


  constructor(private http: HttpClient) {}

  verifyDocument(file: File): Observable<VerifyResponse> {

    if (!file) {
      return throwError(() => new Error('Aucun fichier fourni pour la vérification.'));
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<VerifyResponse>(`${this.baseUrl}/docs/verify`, formData)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const message =
            err?.error?.message ||
            err?.message ||
            'Erreur lors de la vérification du document';
          return throwError(() => new Error(message));
        })
      );
  }

  // ✅ NOUVELLE API : récupérer l'entreprise via docs_user_id (adminUserId)
  getEntrepriseByAdmin(userId: number): Observable<EntrepriseAdminDto> {
    return this.http
      .get<EntrepriseAdminDto>(`${this.baseUrlorg}/entreprises/by-admin/${userId}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const message =
            err?.error?.message ||
            err?.message ||
            'Erreur lors de la récupération de l’entreprise.';
          return throwError(() => new Error(message));
        })
      );
  }
  updateEntreprise(id: number, payload: EntrepriseUpdateRequest): Observable<EntrepriseAdminDto> {
    return this.http.put<EntrepriseAdminDto>(`${this.baseUrlorg}/entreprises/update/${id}`, payload).pipe(
      catchError((err: HttpErrorResponse) => {
        const message = err?.error?.message || err?.message || 'Erreur lors de la mise à jour de l’entreprise.';
        return throwError(() => new Error(message));
      })
    );
  }

  getStudentByUserId(id: number): Observable<StudentResponse> {
    return this.http
      .get<StudentResponse>(`${this.baseUrlstu}/${id}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const message =
            err?.error?.message ||
            err?.message ||
            'Erreur lors de la récupération de l’étudiant.';
          return throwError(() => new Error(message));
        })
      );
  }

  getStudentByUserIid(userId: number): Observable<StudentResponse> {
  return this.http
    .get<StudentResponse>(`${this.baseUrlstu}/by-user/${userId}`)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        const message =
          err?.error?.message ||
          err?.message ||
          'Erreur lors de la récupération de l’étudiant.';
        return throwError(() => new Error(message));
      })
    );
}

}
