// #docplaster
// #docregion
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

// #docregion admin-route
import {authGuard} from '../auth/auth.guard';

import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {AdminComponent} from './admin/admin.component';
import {ManageCrisesComponent} from './manage-crises/manage-crises.component';
import {ManageHeroesComponent} from './manage-heroes/manage-heroes.component';

const adminRoutes: Routes = [{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard],

  // #enddocregion admin-route
  // #docregion admin-route
  children: [{
    path: '',
    children: [
      {path: 'crises', component: ManageCrisesComponent},
      {path: 'heroes', component: ManageHeroesComponent},
      {path: '', component: AdminDashboardComponent}
    ],
    // #enddocregion admin-route
    canActivateChild: [authGuard]
    // #docregion admin-route
  }]
}];

@NgModule({imports: [RouterModule.forChild(adminRoutes)], exports: [RouterModule]})
export class AdminRoutingModule {
}
// #enddocregion
