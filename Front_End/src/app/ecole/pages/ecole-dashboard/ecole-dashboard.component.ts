import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { EcoleApiService } from '../../services/ecole-api.service';
import { StudentApiService } from '../../services/student-api.service';
import { FiliereApiService } from '../../services/filiere-api.service';
import { AuthService } from '../../../auth/services/auth.service';

import { EcoleDetails, Student, Filiere } from '../../models/ecole.models';

type BarItem = { label: string; value: number };

@Component({
  selector: 'app-ecole-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecole-dashboard.component.html',
  styleUrls: ['./ecole-dashboard.component.css']
})
export class EcoleDashboardComponent implements OnInit {
  ecoleId!: number;
  ecole?: EcoleDetails;

  loading = false;
  errorMessage = '';

  students: Student[] = [];
  filieres: Filiere[] = [];

  totalStudents = 0;
  totalFilieres = 0;

  studentsByFiliere: BarItem[] = [];
  studentsByLevel: BarItem[] = [];

  constructor(
    private ecoleApi: EcoleApiService,
    private studentApi: StudentApiService,
    private filiereApi: FiliereApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getUserId?.() ?? Number(localStorage.getItem('userId'));
    if (!userId) {
      this.errorMessage = 'Utilisateur non connecté';
      return;
    }

    this.loading = true;
    this.ecoleApi.getEcoleByAdmin(userId).subscribe({
      next: (ecole) => {
        this.ecole = ecole;
        this.ecoleId = ecole.id;
        this.loadDashboard();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger les informations de l’école.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      students: this.studentApi.getStudentsByEcoleId(this.ecoleId).pipe(
        catchError(() => of([] as Student[]))
      ),
      filieres: this.filiereApi.getFilieresByEcoleId(this.ecoleId).pipe(
        catchError(() => of([] as Filiere[]))
      )
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(({ students, filieres }) => {
        this.students = students ?? [];
        this.filieres = filieres ?? [];

        this.totalStudents = this.students.length;
        this.totalFilieres = this.filieres.length;

        this.buildCharts();
      });
  }

  private buildCharts(): void {
    const filiereMap = new Map<number, string>();
    this.filieres.forEach((f) => filiereMap.set((f as any).id ?? f.id, f.nom));

    const countByFiliere = new Map<number, number>();
    for (const s of this.students) {
      const fid = (s as any).filiereId as number | undefined;
      if (!fid) continue;
      countByFiliere.set(fid, (countByFiliere.get(fid) ?? 0) + 1);
    }

    const itemsF: BarItem[] = [];
    for (const [fid, count] of countByFiliere.entries()) {
      itemsF.push({ label: filiereMap.get(fid) ?? `Filière #${fid}`, value: count });
    }
    for (const f of this.filieres) {
      const fid = (f as any).id ?? f.id;
      if (!countByFiliere.has(fid)) itemsF.push({ label: f.nom, value: 0 });
    }

    itemsF.sort((a, b) => b.value - a.value);
    this.studentsByFiliere = itemsF.slice(0, 8);

    const countByLevel = new Map<string, number>();
    for (const s of this.students) {
      const lv = (s as any).level ? String((s as any).level) : 'Non défini';
      countByLevel.set(lv, (countByLevel.get(lv) ?? 0) + 1);
    }

    this.studentsByLevel = Array.from(countByLevel.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }

  maxValue(items: BarItem[]): number {
    return Math.max(1, ...items.map((i) => i.value));
  }

  trackByLabel(_: number, item: BarItem) {
    return item.label;
  }
}
