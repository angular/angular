import {NgModule} from '@angular/core';
import {provideRouter, Routes, withComponentInputBinding} from '@angular/router';

import {authGuard} from './auth/auth.guard';
import {ComposeMessageComponent} from './compose-message/compose-message.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';

const appRoutes: Routes = [
  {path: 'compose', component: ComposeMessageComponent, outlet: 'popup'}, {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canMatch: [authGuard]
  },
  {
    path: 'crisis-center',
    loadChildren: () =>
        import('./crisis-center/crisis-center.module').then(m => m.CrisisCenterModule),
    data: {preload: true}
  },
  {path: '', redirectTo: '/superheroes', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  // #docregion withComponentInputBinding
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
  ]
  // #enddocregion withComponentInputBinding
})
export class AppRoutingModule {
}
