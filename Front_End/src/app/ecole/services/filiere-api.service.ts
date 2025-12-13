import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Filiere, CreateFilierePayload, UpdateFilierePayload } from '../models/ecole.models';

@Injectable({ providedIn: 'root' })
export class FiliereApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllFilieres(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.baseUrl}/filieres/all`);
  }

  // ✅ NOUVEAU: filières by schoolId
  getFilieresByEcoleId(ecoleId: number): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.baseUrl}/filieres/by-ecole/${ecoleId}`);
  }

  createFiliere(payload: CreateFilierePayload): Observable<Filiere> {
    return this.http.post<Filiere>(`${this.baseUrl}/filieres/add`, payload);
  }

  updateFiliere(id: number, payload: UpdateFilierePayload): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.baseUrl}/filieres/update/${id}`, payload);
  }

  deleteFiliere(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/filieres/delete/${id}`);
  }
}
