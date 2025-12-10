import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterOrganisationRequest,
  RegisterOrganisationResponse
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'docs_token';
  private readonly ROLE_KEY = 'docs_role';

  private isAuthSubject = new BehaviorSubject<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
  isAuthenticated$ = this.isAuthSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(
        tap(res => {
          this.storeAuth(res.token, res.role);
          this.redirectAfterLogin(res.role);
        })
      );
  }

  registerOrganisation(payload: RegisterOrganisationRequest): Observable<RegisterOrganisationResponse> {
    return this.http.post<RegisterOrganisationResponse>(
      `${environment.apiUrl}/orgs/register`,
      payload
    );
  }

  private storeAuth(token: string, role: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.ROLE_KEY, role);
    this.isAuthSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.isAuthSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  private redirectAfterLogin(role: string) {
    switch (role) {
      case 'ECOLE_ADMIN':
        this.router.navigate(['/ecole/dashboard']);
        break;
      case 'ENTREPRISE_ADMIN':
        this.router.navigate(['/entreprise/dashboard']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
