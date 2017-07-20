// #docplaster
// #docregion
import { NgModule }     from '@angular/core';
// #docregion import-router
import { RouterModule, Routes } from '@angular/router';
// #enddocregion import-router

import { ComposeMessageComponent } from './compose-message.component';
import { PageNotFoundComponent }   from './not-found.component';

import { CanDeactivateGuard }      from './can-deactivate-guard.service';
import { AuthGuard }               from './auth-guard.service';


const appRoutes: Routes = [
  {
    path: 'compose',
    component: ComposeMessageComponent,
    outlet: 'popup'
  },
// #docregion admin, admin-1
  {
    path: 'admin',
    loadChildren: 'app/admin/admin.module#AdminModule',
// #enddocregion admin-1
    canLoad: [AuthGuard]
// #docregion admin-1
  },
// #enddocregion admin, admin-1
  { path: '',   redirectTo: '/heroes', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CanDeactivateGuard
  ]
})
export class AppRoutingModule {}
