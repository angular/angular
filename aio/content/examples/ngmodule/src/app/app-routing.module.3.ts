import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactModule } from './contact/contact.module.3';

const routes: Routes = [
  { path: '', redirectTo: 'contact', pathMatch: 'full'},
  { path: 'crisis', loadChildren: 'app/crisis/crisis.module#CrisisModule' },
  { path: 'heroes', loadChildren: 'app/hero/hero.module.3#HeroModule' }
];

@NgModule({
  imports: [
    ContactModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
