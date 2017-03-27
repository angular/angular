import { NgModule }       from '@angular/core';
import { RouterModule }   from '@angular/router';

import { AboutComponent } from './about.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      { path: 'about', component: AboutComponent },
      { path: 'heroes', loadChildren: 'app/hero/hero.module#HeroModule'}
    ])
  ],
  exports: [ RouterModule ] // re-export the module declarations
})
export class AppRoutingModule { };
