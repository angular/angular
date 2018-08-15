// #docplaster
// #docregion , v3
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// #enddocregion v3
import { ComposeMessageComponent } from './compose-message/compose-message.component';
// #docregion v3
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const appRoutes: Routes = [
// #enddocregion v3
// #docregion compose
  {
    path: 'compose',
    component: ComposeMessageComponent,
    outlet: 'popup'
  },
// #enddocregion compose
// #docregion v3
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
