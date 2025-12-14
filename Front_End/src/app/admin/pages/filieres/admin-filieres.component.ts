import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { AdminApiService } from '../../services/admin-api.service';
import { Ecole, Filiere, CreateFiliereRequest } from '../../models/admin.models';

@Component({
  selector: 'app-admin-filieres',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-filieres.component.html',
  styleUrls: ['./admin-filieres.component.css']
})
export class AdminFilieresComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';

  ecoles: Ecole[] = [];
  filieres: Filiere[] = [];
  filteredFilieres: Filiere[] = [];

  // Filters
  q = '';
  ecoleFilter: '' | number = '';

  // Pagination
  pageSize = 6;
  page = 1;

  // Modal
  showModal = false;
  editing = false;
  editingId: number | null = null;
  form!: FormGroup;

  actionLoadingId: number | null = null;

  constructor(
    private api: AdminApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],

      ecoleId: ['', [Validators.required]],

      nomResponsableFiliere: [''],
      accreditation: [''],
      statutAccreditation: [''],
      dateDebutAccreditation: [''],
      dateFinAccreditation: ['']
    });

    this.loadAll();
  }

  // ------------------ Load ------------------
  loadAll(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.getAllEcoles().subscribe({
      next: (ec) => {
        this.ecoles = ec ?? [];

        this.api.getAllFilieres().subscribe({
          next: (fils) => {
            this.filieres = (fils ?? []) as any;
            this.applyFilters(true);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err?.error?.message || 'Erreur chargement filières.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur chargement écoles.';
        this.cdr.detectChanges();
      }
    });
  }

  // ------------------ Filters ------------------
  applyFilters(resetPage = false): void {
    const q = (this.q || '').trim().toLowerCase();
    const ecoleId = this.ecoleFilter;

    let res: any[] = [...((this.filieres as any[]) || [])];

    if (q) {
      res = res.filter((f: any) => {
        const nom = String(f.nom ?? '').toLowerCase();
        const code = String(f.code ?? '').toLowerCase();
        const desc = String(f.description ?? '').toLowerCase();
        const id = String(f.id ?? '');
        const ecoleIdStr = String(this.getEcoleId(f) ?? '');
        return nom.includes(q) || code.includes(q) || desc.includes(q) || id.includes(q) || ecoleIdStr.includes(q);
      });
    }

    if (ecoleId !== '' && ecoleId !== null && ecoleId !== undefined) {
      res = res.filter((f: any) => Number(this.getEcoleId(f)) === Number(ecoleId));
    }

    res.sort((a: any, b: any) => (Number(b.id) || 0) - (Number(a.id) || 0));

    this.filteredFilieres = res as any;

    if (resetPage) this.page = 1;
    this.page = Math.min(this.page, this.totalPages);

    this.cdr.detectChanges();
  }

  // ------------------ Pagination ------------------
  get totalPages(): number {
    return Math.max(1, Math.ceil((this.filteredFilieres?.length || 0) / (this.pageSize || 6)));
  }

  get pagedFilieres(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return (this.filteredFilieres || []).slice(start, start + this.pageSize);
  }

  nextPage(): void {
    this.page = Math.min(this.page + 1, this.totalPages);
  }

  prevPage(): void {
    this.page = Math.max(this.page - 1, 1);
  }

  get pageRangeLabel(): string {
    const total = this.filteredFilieres?.length || 0;
    if (!total) return '0 résultat';
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, total);
    return `${start}–${end} sur ${total}`;
  }

  // ------------------ Modal ------------------
  openCreate(): void {
    this.editing = false;
    this.editingId = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.form.reset({
      nom: '',
      code: '',
      description: '',
      ecoleId: '',

      nomResponsableFiliere: '',
      accreditation: '',
      statutAccreditation: '',
      dateDebutAccreditation: '',
      dateFinAccreditation: ''
    });

    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEdit(f: any): void {
    this.editing = true;
    this.editingId = Number(f.id);
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ IMPORTANT: statutAccreditation doit correspondre à l'enum backend
    this.form.reset({
      nom: f.nom ?? '',
      code: f.code ?? '',
      description: f.description ?? '',
      ecoleId: this.getEcoleId(f) ?? '',

      nomResponsableFiliere: f.nomResponsableFiliere ?? '',
      accreditation: f.accreditation ?? '',
      statutAccreditation: f.statutAccreditation ?? '',

      // input type=date attend "YYYY-MM-DD" ou vide
      dateDebutAccreditation: f.dateDebutAccreditation ?? '',
      dateFinAccreditation: f.dateFinAccreditation ?? ''
    });

    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    // ✅ ne jamais envoyer "" pour un enum -> envoyer null
    const statut = (v.statutAccreditation && String(v.statutAccreditation).trim() !== '')
      ? String(v.statutAccreditation).trim()
      : null;

    const payload: CreateFiliereRequest = {
      nom: String(v.nom || '').trim(),
      code: String(v.code || '').trim(),
      description: v.description ? String(v.description).trim() : '',
      ecoleId: Number(v.ecoleId),

      nomResponsableFiliere: v.nomResponsableFiliere ? String(v.nomResponsableFiliere).trim() : '',
      accreditation: v.accreditation ? String(v.accreditation).trim() : '',
      statutAccreditation: statut as any,

      dateDebutAccreditation: v.dateDebutAccreditation ? v.dateDebutAccreditation : null,
      dateFinAccreditation: v.dateFinAccreditation ? v.dateFinAccreditation : null
    } as any;

    this.loading = true;

    const req$ = this.editing && this.editingId
      ? this.api.updateFiliere(this.editingId, payload)
      : this.api.createFiliere(payload);

    req$.subscribe({
      next: () => {
        this.successMessage = this.editing ? 'Filière mise à jour.' : 'Filière créée.';
        this.closeModal();
        this.loadAll();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur sauvegarde filière.';
        this.cdr.detectChanges();
      }
    });
  }

  // ------------------ Delete ------------------
  remove(f: any): void {
    const id = Number(f?.id);
    if (!id) return;

    if (!confirm('Supprimer cette filière ?')) return;

    this.actionLoadingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.deleteFiliere(id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.successMessage = 'Filière supprimée.';
        this.filieres = (this.filieres as any[]).filter((x: any) => Number(x.id) !== id) as any;
        this.applyFilters(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMessage = err?.error?.message || 'Suppression impossible.';
        this.cdr.detectChanges();
      }
    });
  }

  // ------------------ Helpers ------------------
  safe(v: any, fb = '—'): string {
    if (v === null || v === undefined || String(v).trim() === '') return fb;
    return String(v);
  }

  // ✅ récupère l'id école quel que soit le format backend
  getEcoleId(f: any): number | null {
    const id =
      f?.ecoleId ??
      f?.ecole_id ??
      f?.ecole?.id ??
      f?.idEcole ??
      null;

    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  ecoleNameById(ecoleId: any): string {
    const id = Number(ecoleId);
    if (!id) return '—';
    const e = (this.ecoles || []).find(x => Number((x as any).id) === id);
    return e ? `${this.safe((e as any).name)} (${this.safe((e as any).city)})` : `École #${id}`;
  }

  ecoleNameForFiliere(f: any): string {
    // si ton backend renvoie ecoleName, prends-le directement
    if (f?.ecoleName) return this.safe(f.ecoleName);

    const id = this.getEcoleId(f);
    return id ? this.ecoleNameById(id) : '—';
  }
}
