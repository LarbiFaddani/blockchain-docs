import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterOrganisationComponent } from './auth/register-organisation/register-organisation.component';

import { EcoleLayoutComponent } from './ecole/pages/layout/ecole-layout.component';
import { EcoleDashboardComponent } from './ecole/pages/ecole-dashboard/ecole-dashboard.component';
import { EcoleStudentsComponent } from './ecole/pages/students/ecole-students.component';
import { EcoleFilieresComponent } from './ecole/pages/filieres/ecole-filieres.component';

import { EcoleProfileComponent } from './ecole/pages/profil/ecole-profile.component';

import { EntrepriseDashboardComponent } from './entreprise/entreprise-dashboard/entreprise-dashboard.component';
import { ForbiddenComponent } from './shared/forbidden/forbidden.component';

import { authGuard } from './auth/guards/auth.guard';
import { roleGuard } from './auth/guards/role.guard';
import { EcoleDocumentComponent } from './ecole/pages/document/ecole-document.component';

// ✅ ADMIN imports
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/pages/dashboard/admin-dashboard.component';
import { AdminOrganisationsComponent } from './admin/pages/organisations/admin-organisations.component';
import { AdminUsersComponent } from './admin/pages/users/admin-users.component';
import { AdminFilieresComponent } from './admin/pages/filieres/admin-filieres.component';
import { AdminProfileComponent } from './admin/pages/profile/admin-profile.component';

export const routes: Routes = [
  // ---------------- AUTH ----------------
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterOrganisationComponent },

  // ---------------- ADMIN (SYSTEM_ADMIN) ----------------
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'organisations', component: AdminOrganisationsComponent },
      // plus tard :
      { path: 'users', component: AdminUsersComponent },
      { path: 'filieres', component: AdminFilieresComponent },
      { path: 'profile', component: AdminProfileComponent },
    ]
  },

  // ---------------- ECOLE ----------------
  {
    path: 'ecole',
    component: EcoleLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ECOLE_ADMIN'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: EcoleDashboardComponent },
      { path: 'students', component: EcoleStudentsComponent },
      { path: 'filieres', component: EcoleFilieresComponent },
      { path: 'documents', component: EcoleDocumentComponent },
      { path: 'profile', component: EcoleProfileComponent },

    ]
  },

  // ---------------- ENTREPRISE ----------------
  {
    path: 'entreprise/dashboard',
    component: EntrepriseDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ENTREPRISE_ADMIN'] }
  },

  { path: 'forbidden', component: ForbiddenComponent },

  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: '**', redirectTo: 'auth/login' }
];
