import { Routes } from '@angular/router';

import { AppComponent as S0101 } from '../01-01/app';

export const routes: Routes = [
  { path: '', redirectTo: '/01-01', pathMatch: 'full' },
  { path: '01-01', component: S0101 },
];
