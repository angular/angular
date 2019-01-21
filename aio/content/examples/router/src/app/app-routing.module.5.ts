// #docplaster
// #docregion
import { NgModule }     from '@angular/core';
// #docregion import-router
import { RouterModule, Routes } from '@angular/router';
// #enddocregion import-router

import { ComposeMessageComponent } from './compose-message/compose-message.component';
import { PageNotFoundComponent }   from './page-not-found/page-not-found.component';

import { AuthGuard }               from './auth/auth.guard';


const appRoutes: Routes = [
  {
    path: 'compose',
    component: ComposeMessageComponent,
    outlet: 'popup'
  },
// #docregion admin, admin-1
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
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
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
