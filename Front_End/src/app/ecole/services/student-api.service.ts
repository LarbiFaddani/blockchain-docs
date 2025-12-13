// src/app/ecole/services/student-api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  Student,
  CreateStudentPayload,
  UpdateStudentPayload
} from '../models/ecole.models';

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * POST /student/create
   */
  createStudent(payload: CreateStudentPayload): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/student/create`, payload);
  }

  /**
   * ✅ GET /student/by-ecole/{ecoleId}
   */
  getStudentsByEcoleId(ecoleId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/student/by-ecole/${ecoleId}`);
  }

  /**
   * GET /student/cin/{cin}
   */
  getStudentByCin(cin: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/student/cin/${cin}`);
  }

  /**
   * GET /student/search
   */
  searchStudents(params: {
    firstName?: string;
    lastName?: string;
  }): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/student/search`, {
      params: {
        ...(params.firstName ? { firstName: params.firstName } : {}),
        ...(params.lastName ? { lastName: params.lastName } : {}),
      }
    });
  }

  /**
   * PUT /student/update/{id}
   */
  updateStudent(id: number, payload: UpdateStudentPayload): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/student/update/${id}`, payload);
  }

  /**
   * PUT /student/disable/{userId}
   */
  disableStudentAccount(userId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/student/disable/${userId}`, null, {
      responseType: 'text'
    });
  }

  /**
   * PUT /student/enable/{userId}
   */
  enableStudentAccount(userId: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/student/enable/${userId}`, null, {
      responseType: 'text'
    });
  }
}
