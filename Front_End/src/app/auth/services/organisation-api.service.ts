// src/app/auth/services/organisation-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Type d'organisation côté front.
 * Aligné avec ton enum OrgType côté backend:
 *   public enum OrgType { ECOLE, ENTREPRISE }
 */
export type OrgType = 'ECOLE' | 'ENTREPRISE';

/**
 * Payload envoyé à /orgs/register
 * Aligné avec RegisterOrganisationRequest côté backend.
 * On garde toutes les propriétés (pas de "?"),
 * et on utilise null / 0 quand ce n’est pas applicable.
 */
export interface RegisterOrganisationRequest {
  orgType: OrgType;

  // Infos organisation (communes)
  name: string;
  address: string;
  city: string;
  emailContact: string;

  // Admin
  adminEmail: string;
  adminPassword: string;
  adminRole: string; // "ECOLE_ADMIN" ou "ENTREPRISE_ADMIN"

  // ECOLE
  numeroAutorisation: string | null;
  typeEcole: string | null;      // "PUBLIC" | "SEMI_PUBLIC" | "PRIVEE"
  anneeCreation: string | null;  // "YYYY-MM-DD"
  nombreEtudiants: number;       // 0 si non rempli

  // ENTREPRISE
  ice: string | null;
  secteurActivite: string | null;
  statutJuridique: string | null;
}

/**
 * Réponse renvoyée par /orgs/register
 * Alignée sur RegisterOrganisationResponse côté backend.
 */
export interface RegisterOrganisationResponse {
  orgId: number;
  type: string;        // "ECOLE" ou "ENTREPRISE"
  name: string;
  adminUserId: number;
  adminEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganisationApiService {

  /**
   * environment.apiUrl doit être = 'http://localhost:8080'
   * pour passer par le gateway.
   */
  private readonly baseUrl = `${environment.apiUrl}/orgs`;

  constructor(private http: HttpClient) {}

  /**
   * Appelle POST /orgs/register via le gateway
   * pour créer une organisation + admin associé.
   */
  registerOrganisation(
    body: RegisterOrganisationRequest
  ): Observable<RegisterOrganisationResponse> {
    return this.http.post<RegisterOrganisationResponse>(
      `${this.baseUrl}/register`,
      body
    );
  }
}
