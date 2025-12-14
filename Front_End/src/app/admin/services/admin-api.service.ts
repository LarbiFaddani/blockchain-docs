import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  RegisterOrganisationRequest,
  RegisterOrganisationResponse,
  Ecole,
  Entreprise,
  Student,
  Filiere,
  CreateFiliereRequest,
  UserAdmin
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly API = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // =========================================================
  // ORGANISATIONS
  // =========================================================
  registerOrganisation(
    req: RegisterOrganisationRequest
  ): Observable<RegisterOrganisationResponse> {
    return this.http.post<RegisterOrganisationResponse>(
      `${this.API}/orgs/register`,
      req
    );
  }

  // ---------------- ECOLES ----------------
  getAllEcoles(): Observable<Ecole[]> {
    return this.http.get<Ecole[]>(`${this.API}/orgs/ecoles`);
  }

  getEcoleById(id: number): Observable<Ecole> {
    return this.http.get<Ecole>(`${this.API}/orgs/ecoles/${id}`);
  }

  updateEcole(id: number, payload: Partial<Ecole>): Observable<Ecole> {
    return this.http.put<Ecole>(
      `${this.API}/orgs/ecoles/update/${id}`,
      payload
    );
  }

  // ---------------- ENTREPRISES ----------------
  getAllEntreprises(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.API}/orgs/entreprises`);
  }

  getEntrepriseById(id: number): Observable<Entreprise> {
    return this.http.get<Entreprise>(`${this.API}/orgs/entreprises/${id}`);
  }

  updateEntreprise(id: number, payload: Partial<Entreprise>): Observable<Entreprise> {
    return this.http.put<Entreprise>(
      `${this.API}/orgs/entreprises/update/${id}`,
      payload
    );
  }

  // =========================================================
  // STUDENTS
  // =========================================================
  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.API}/student/all`);
  }

  getStudentByCin(cin: string): Observable<Student> {
    return this.http.get<Student>(
      `${this.API}/student/cin/${encodeURIComponent(cin)}`
    );
  }

  searchStudents(firstName?: string, lastName?: string): Observable<Student[]> {
    const params: string[] = [];
    if (firstName) params.push(`firstName=${encodeURIComponent(firstName)}`);
    if (lastName) params.push(`lastName=${encodeURIComponent(lastName)}`);

    const qs = params.length ? `?${params.join('&')}` : '';
    return this.http.get<Student[]>(`${this.API}/student/search${qs}`);
  }

  updateStudent(id: number, payload: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(
      `${this.API}/student/update/${id}`,
      payload
    );
  }

  disableStudentAccount(userId: number): Observable<string> {
    return this.http.put(
      `${this.API}/student/disable/${userId}`,
      {},
      { responseType: 'text' }
    );
  }

  enableStudentAccount(userId: number): Observable<string> {
    return this.http.put(
      `${this.API}/student/enable/${userId}`,
      {},
      { responseType: 'text' }
    );
  }

  // =========================================================
  // FILIERES
  // =========================================================
  getAllFilieres(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.API}/filieres/all`);
  }

  getFilieresByEcole(ecoleId: number): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(`${this.API}/filieres/by-ecole/${ecoleId}`);
  }

  createFiliere(payload: CreateFiliereRequest): Observable<Filiere> {
    return this.http.post<Filiere>(`${this.API}/filieres/add`, payload);
  }

  updateFiliere(id: number, payload: CreateFiliereRequest): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.API}/filieres/update/${id}`, payload);
  }

  deleteFiliere(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/filieres/delete/${id}`);
  }

  // =========================================================
  // USERS (AUTH-SERVICE – ADMIN GLOBAL)
  // =========================================================
  getAllUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(`${this.API}/auth/users/all`);
  }

  disableUser(userId: number): Observable<string> {
    return this.http.put(
      `${this.API}/auth/disable/${userId}`,
      {},
      { responseType: 'text' }
    );
  }

  enableUser(userId: number): Observable<string> {
    return this.http.put(
      `${this.API}/auth/enable/${userId}`,
      {},
      { responseType: 'text' }
    );
  }

  // =========================================================
  // PROFILE (ADMIN)
  // =========================================================

  // 1) récupérer user par id (profil)
  getUserById(userId: number): Observable<UserAdmin> {
    return this.http.get<UserAdmin>(`${this.API}/auth/users/${userId}`);
  }

  // 2) changer mot de passe
  changePassword(
  userId: number,
  payload: { currentPassword: string; newPassword: string }
): Observable<string> {
  return this.http.put(
    `${this.API}/auth/users/${userId}/password`,
    payload,
    { responseType: 'text' }
  );
}

}
