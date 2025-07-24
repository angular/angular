import {Routes} from '@angular/router';

import {AboutComponent} from './about/about.component';
import {DashboardComponent} from './dashboard/dashboard.component';

export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'about', component: AboutComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'heroes', loadChildren: () => import('./hero/hero.routes')},
];
