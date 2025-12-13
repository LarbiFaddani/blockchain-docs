import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { AuthService } from '../../../auth/services/auth.service';
import { EcoleApiService } from '../../services/ecole-api.service';
import { StudentApiService } from '../../services/student-api.service';
import { FiliereApiService } from '../../services/filiere-api.service';

import { EcoleDetails, Student, Filiere } from '../../models/ecole.models';

@Component({
  selector: 'app-ecole-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ecole-students.component.html',
  styleUrls: ['./ecole-students.component.css']
})
export class EcoleStudentsComponent implements OnInit {
  ecoleId!: number;
  ecole?: EcoleDetails;

  loading = false;
  errorMessage = '';
  successMessage = '';

  students: Student[] = [];
  filtered: Student[] = [];
  filieres: Filiere[] = [];

  query = '';
  showModal = false;
  editMode = false;
  selected?: Student;

  loadingActionId: number | null = null;

  searchCtrl: FormControl<string | null>;
  form: FormGroup;

  constructor(
    private auth: AuthService,
    private ecoleApi: EcoleApiService,
    private studentApi: StudentApiService,
    private filiereApi: FiliereApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchCtrl = this.fb.control<string>('');

    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      cin: ['', [Validators.required, Validators.minLength(4)]],
      personalEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      level: [''],
      genre: [''],
      birthDate: [''],
      studentCode: [''],
      filiereId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const userId = this.auth.getUserId();
    if (!userId) {
      this.errorMessage = 'Utilisateur non connecté';
      return;
    }

    // Charger ecoleId (nécessaire pour les étudiants / filières)
    this.ecoleApi.getEcoleByAdmin(userId).subscribe({
      next: (ecole) => {
        this.ecole = ecole;
        this.ecoleId = ecole.id;
        this.loadData();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Impossible de charger l’école.';
        this.cdr.detectChanges();
      }
    });

    this.searchCtrl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((v) => {
        this.query = (v ?? '').trim().toLowerCase();
        this.applyFilter();
      });
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.filiereApi.getFilieresByEcoleId(this.ecoleId).subscribe({
      next: (filieres) => {
        this.filieres = filieres ?? [];
        this.cdr.detectChanges();
      },
      error: () => {
        // non bloquant
      }
    });

    this.studentApi.getStudentsByEcoleId(this.ecoleId).subscribe({
      next: (students) => {
        this.students = (students ?? []).map((s) => ({ ...s }));
        this.filtered = [...this.students];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Erreur chargement étudiants.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private applyFilter(): void {
    if (!this.query) {
      this.filtered = [...this.students];
      return;
    }

    this.filtered = this.students.filter((s) => {
      const full = `${s.firstName ?? ''} ${s.lastName ?? ''}`.toLowerCase();
      const cin = (s.cin ?? '').toLowerCase();
      const email = (s.personalEmail ?? '').toLowerCase();
      const code = (s.studentCode ?? '').toLowerCase();
      const phone = (s.phoneNumber ?? '').toLowerCase();

      return full.includes(this.query)
        || cin.includes(this.query)
        || email.includes(this.query)
        || code.includes(this.query)
        || phone.includes(this.query);
    });
  }

  openCreate(): void {
    this.editMode = false;
    this.selected = undefined;
    this.form.reset();
    this.showModal = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEdit(s: Student): void {
    this.editMode = true;
    this.selected = s;

    this.form.patchValue({
      firstName: s.firstName ?? '',
      lastName: s.lastName ?? '',
      cin: s.cin ?? '',
      personalEmail: s.personalEmail ?? '',
      level: s.level ?? '',
      phoneNumber: s.phoneNumber ?? '',
      genre: s.genre ?? '',
      birthDate: this.normalizeDateForInput(s.birthDate),
      studentCode: s.studentCode ?? '',
      filiereId: s.filiereId ?? null
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      ...this.form.value,
      ecoleId: this.ecoleId
    };

    this.loading = true;

    if (!this.editMode) {
      this.studentApi.createStudent(payload).subscribe({
        next: () => {
          this.successMessage = 'Étudiant créé avec succès.';
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur création étudiant.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const id = this.selected?.id;
      if (!id) {
        this.errorMessage = 'Étudiant invalide (id manquant).';
        this.loading = false;
        return;
      }

      this.studentApi.updateStudent(id, payload).subscribe({
        next: () => {
          this.successMessage = 'Étudiant mis à jour.';
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur mise à jour étudiant.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ENABLE/DISABLE
  canDisable(s: Student): boolean {
    return !!s.userId && s.enabled === true;
  }

  canEnable(s: Student): boolean {
    return !!s.userId && s.enabled === false;
  }

  disableAccount(s: Student): void {
    const userId = s.userId;
    if (!userId) {
      this.errorMessage = 'userId manquant (StudentResponse doit inclure userId).';
      return;
    }
    if (!this.canDisable(s)) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.loadingActionId = s.id;

    this.studentApi.disableStudentAccount(userId)
      .pipe(finalize(() => (this.loadingActionId = null)))
      .subscribe({
        next: (msg) => {
          this.successMessage = msg || 'Compte désactivé.';
          s.enabled = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.error || 'Erreur désactivation.';
          this.cdr.detectChanges();
        }
      });
  }

  enableAccount(s: Student): void {
    const userId = s.userId;
    if (!userId) {
      this.errorMessage = 'userId manquant (StudentResponse doit inclure userId).';
      return;
    }
    if (!this.canEnable(s)) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.loadingActionId = s.id;

    this.studentApi.enableStudentAccount(userId)
      .pipe(finalize(() => (this.loadingActionId = null)))
      .subscribe({
        next: (msg) => {
          this.successMessage = msg || 'Compte activé.';
          s.enabled = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || err?.error || 'Erreur activation.';
          this.cdr.detectChanges();
        }
      });
  }

  // helpers
  trackByStudentId = (_: number, s: Student) => s.id;
  trackByFiliereId = (_: number, f: Filiere) => f.id;

  filiereNameById(id?: number | null): string {
    if (!id) return '-';
    const found = this.filieres.find((x) => x.id === Number(id));
    return found?.nom ?? `#${id}`;
  }

  filiereLabel(f: Filiere): string {
    const code = (f as any).code ?? '';
    const nom = f.nom ?? '';
    if (code && nom) return `${code} — ${nom}`;
    if (nom) return nom;
    if (code) return code;
    return `Filière #${f.id}`;
  }

  private normalizeDateForInput(d?: string | null): string {
    if (!d) return '';
    return d.length >= 10 ? d.substring(0, 10) : d;
  }
}
