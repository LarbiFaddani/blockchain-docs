// src/app/ecole/services/ecole-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EcoleDetails } from '../models/ecole.models';

@Injectable({ providedIn: 'root' })
export class EcoleApiService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * GET /orgs/ecoles
   */
  getAllEcoles(): Observable<EcoleDetails[]> {
    return this.http.get<EcoleDetails[]>(`${this.baseUrl}/orgs/ecoles`);
  }

  /**
   * GET /orgs/ecoles/{id}
   */
  getEcoleById(id: number): Observable<EcoleDetails> {
    return this.http.get<EcoleDetails>(`${this.baseUrl}/orgs/ecoles/${id}`);
  }

  
    getEcoleByAdmin(userId: number): Observable<EcoleDetails> {
    return this.http.get<EcoleDetails>(`${this.baseUrl}/orgs/ecoles/by-admin/${userId}`);
  }

  /**
   * PUT /orgs/ecoles/update/{id}
   * On utilise Partial<Ecole> pour permettre de n’envoyer que les champs modifiés.
   */
  updateEcole(id: number, body: Partial<EcoleDetails>): Observable<EcoleDetails> {
    return this.http.put<EcoleDetails>(`${this.baseUrl}/orgs/ecoles/update/${id}`, body);
  }
}
