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

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterOrganisationComponent },

  // ✅ ECOLE avec Layout
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

  // ENTREPRISE
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
