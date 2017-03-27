// #docplaster
// #docregion, preload-v1
import { NgModule }     from '@angular/core';
import {
  RouterModule, Routes,
// #enddocregion preload-v1
  PreloadAllModules
// #docregion preload-v1
} from '@angular/router';

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
  {
    path: 'admin',
    loadChildren: 'app/admin/admin.module#AdminModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'crisis-center',
    loadChildren: 'app/crisis-center/crisis-center.module#CrisisCenterModule'
  },
  { path: '',   redirectTo: '/heroes', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    // #docregion forRoot
    RouterModule.forRoot(
      appRoutes
      // #enddocregion preload-v1
      , { preloadingStrategy: PreloadAllModules }
      // #docregion preload-v1
    )
    // #enddocregion forRoot
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CanDeactivateGuard
  ]
})
export class AppRoutingModule {}
