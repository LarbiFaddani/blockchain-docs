import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AdminApiService } from '../../services/admin-api.service';
import { Ecole, Entreprise, Student, Filiere } from '../../models/admin.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  loading = false;
  errorMessage = '';

  ecoles: Ecole[] = [];
  entreprises: Entreprise[] = [];
  students: Student[] = [];
  filieres: Filiere[] = [];

  constructor(private api: AdminApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      ecoles: this.api.getAllEcoles(),
      entreprises: this.api.getAllEntreprises(),
      students: this.api.getAllStudents(),
      filieres: this.api.getAllFilieres()
    }).subscribe({
      next: (res) => {
        this.ecoles = res.ecoles ?? [];
        this.entreprises = res.entreprises ?? [];
        this.students = res.students ?? [];
        this.filieres = res.filieres ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'Impossible de charger le dashboard admin (vérifie Gateway / JWT / CORS).';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // KPIs
  get kpiEcoles(): number { return this.ecoles.length; }
  get kpiEntreprises(): number { return this.entreprises.length; }
  get kpiStudents(): number { return this.students.length; }
  get kpiFilieres(): number { return this.filieres.length; }

  // helpers
  safe(v: any, fb = '—'): string {
    if (v === null || v === undefined || String(v).trim() === '') return fb;
    return String(v);
  }

  topStudents(n = 6): Student[] {
    return [...this.students].slice(0, n);
  }

  topEcoles(n = 5): Ecole[] {
    return [...this.ecoles].slice(0, n);
  }
}
