import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminApiService } from '../../services/admin-api.service';

export type UserRole = 'ADMIN' | 'ECOLE_ADMIN' | 'ENTREPRISE_ADMIN' | 'ETUDIANT' | string;

export interface UserAdmin {
  id: number;
  email: string;
  role: UserRole;
  enabled: boolean;
  displayName?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';

  users: UserAdmin[] = [];
  filteredUsers: UserAdmin[] = [];

  // Filters
  q = '';
  roleFilter = '';
  statusFilter: '' | 'enabled' | 'disabled' = '';

  roles: UserRole[] = ['ADMIN', 'ECOLE_ADMIN', 'ENTREPRISE_ADMIN', 'ETUDIANT'];

  // Pagination
  pageSize = 6;
  page = 1;

  actionLoadingId: number | null = null;

  constructor(
    private api: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ il faut ajouter getAllUsers() dans AdminApiService
    this.api.getAllUsers().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.applyFilters(true);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur chargement utilisateurs.';
        this.cdr.detectChanges();
      }
    });
  }

  // ---------- Filters ----------
  applyFilters(resetPage = false): void {
    const q = (this.q || '').trim().toLowerCase();
    const role = (this.roleFilter || '').trim();
    const status = this.statusFilter;

    let res = [...(this.users || [])];

    if (q) {
      res = res.filter(u => {
        const email = (u.email || '').toLowerCase();
        const r = String(u.role || '').toLowerCase();
        const dn = (u.displayName || '').toLowerCase();
        return email.includes(q) || r.includes(q) || dn.includes(q) || String(u.id).includes(q);
      });
    }

    if (role) {
      res = res.filter(u => String(u.role) === role);
    }

    if (status === 'enabled') {
      res = res.filter(u => u.enabled !== false);
    } else if (status === 'disabled') {
      res = res.filter(u => u.enabled === false);
    }

    // tri: plus récents en haut
    res.sort((a, b) => (b.id || 0) - (a.id || 0));

    this.filteredUsers = res;

    if (resetPage) this.page = 1;
    this.page = Math.min(this.page, this.totalPages);

    this.cdr.detectChanges();
  }

  // ---------- Pagination ----------
  get totalPages(): number {
    return Math.max(1, Math.ceil((this.filteredUsers?.length || 0) / this.pageSize));
  }

  get pagedUsers(): UserAdmin[] {
    const start = (this.page - 1) * this.pageSize;
    return (this.filteredUsers || []).slice(start, start + this.pageSize);
  }

  nextPage(): void {
    this.page = Math.min(this.page + 1, this.totalPages);
  }

  prevPage(): void {
    this.page = Math.max(this.page - 1, 1);
  }

  get pageRangeLabel(): string {
    const total = this.filteredUsers?.length || 0;
    if (!total) return '0 résultat';
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, total);
    return `${start}–${end} sur ${total}`;
  }

  // ---------- Actions ----------
  toggle(u: UserAdmin): void {
    if (!u?.id) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.actionLoadingId = u.id;

    const req$ = (u.enabled === false)
      ? this.api.enableUser(u.id)
      : this.api.disableUser(u.id);

    req$.subscribe({
      next: () => {
        u.enabled = !(u.enabled === false);
        this.successMessage = u.enabled ? 'Compte activé.' : 'Compte désactivé.';
        this.actionLoadingId = null;

        this.applyFilters(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoadingId = null;
        this.errorMessage = err?.error?.message || 'Action impossible.';
        this.cdr.detectChanges();
      }
    });
  }

  copy(text: string): void {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    this.successMessage = 'Email copié.';
  }

  safe(v: any, fb = '—'): string {
    if (v === null || v === undefined || String(v).trim() === '') return fb;
    return String(v);
  }
}
