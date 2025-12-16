import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { StudentDocumentDto ,StudentResponse} from '../models/etudiant.models';

@Injectable({
  providedIn: 'root'
})
export class EtudiantDocumentService {

  private readonly baseUrl = 'http://localhost:8080/api/docs';
  private readonly baseUrlstu = 'http://localhost:8080/student';

  constructor(private http: HttpClient) {}

  /** 🔹 Tous les documents d’un étudiant */
  getDocumentsByUser(userId: number): Observable<StudentDocumentDto[]> {
    return this.http
      .get<StudentDocumentDto[]>(`${this.baseUrl}/by-user/${userId}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          const msg = err?.error?.message || 'Erreur chargement documents';
          return throwError(() => new Error(msg));
        })
      );
  }

  /** 🔹 Téléchargement */
  download(hash: string): void {
    window.open(`${this.baseUrl}/download/${hash}`, '_blank');
  }
   
 getStudentByUserId(userId: number): Observable<StudentResponse> {
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
