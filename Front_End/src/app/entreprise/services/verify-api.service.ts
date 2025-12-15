import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {VerifyResponse } from '../models/entreprise.models';
/**
 * 🔁 Mapping EXACT de:
 * package com.blockchain.docsservice.dtos.VerifyResponse
 */


@Injectable({
  providedIn: 'root'
})
export class VerifyApiService {

  /**
   * ⚠️ À adapter selon ton architecture:
   * - via Gateway : http://localhost:8888/api
   * - direct docs-service : http://localhost:9004/api
   */
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * ✅ Vérification d’un document
   * Envoie UNIQUEMENT le fichier
   * Le hash est calculé côté backend
   */
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
}
