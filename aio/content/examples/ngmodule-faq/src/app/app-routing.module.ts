// #docregion
import { NgModule }             from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactModule }    from './contact/contact.module';

// #docregion routes
const routes: Routes = [
  { path: '', redirectTo: 'contact', pathMatch: 'full'},
  // #docregion lazy-routes
  { path: 'crisis', loadChildren: 'app/crisis/crisis.module#CrisisModule' },
  { path: 'heroes', loadChildren: 'app/hero/hero.module#HeroModule' }
  // #enddocregion lazy-routes
];
// #enddocregion routes

@NgModule({
  // #docregion imports
  imports: [
    ContactModule,
    // #docregion forRoot
    RouterModule.forRoot(routes),
    // #enddocregion forRoot
  ],
  // #enddocregion imports
  // #docregion exports
  exports: [RouterModule]
  // #enddocregion exports
})
export class AppRoutingModule {}
