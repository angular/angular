// #docregion
import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { ComposeMessageComponent } from './compose-message.component';
import { CanDeactivateGuard }      from './can-deactivate-guard.service';
import { PageNotFoundComponent }   from './not-found.component';

const appRoutes: Routes = [
  {
    path: 'compose',
    component: ComposeMessageComponent,
    outlet: 'popup'
  },
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
