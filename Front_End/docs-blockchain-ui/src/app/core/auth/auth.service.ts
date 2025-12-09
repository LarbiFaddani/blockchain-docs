// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, tap } from 'rxjs';

// export interface LoginResponse {
//   token: string;
//   role: string; // ex: "ECOLE_ADMIN"
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private baseUrl = 'http://localhost:9001/auth'; // adapte si besoin

//   constructor(private http: HttpClient) {}

//   login(payload: { email: string; password: string }): Observable<LoginResponse> {
//     return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
//       tap((res) => {
//         // ✅ on stocke le token + le rôle dans le localStorage
//         if (res?.token) {
//           localStorage.setItem('access_token', res.token);
//         }
//         if (res?.role) {
//           localStorage.setItem('user_role', res.role);
//         }
//       })
//     );
//   }

//   register(payload: any): Observable<any> {
//     return this.http.post<any>(`${this.baseUrl}/register`, payload);
//   }

//   logout() {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('user_role');
//   }

//   isAuthenticated(): boolean {
//     return !!localStorage.getItem('access_token');
//   }

//   getRole(): string | null {
//     return localStorage.getItem('user_role');
//   }
// }
