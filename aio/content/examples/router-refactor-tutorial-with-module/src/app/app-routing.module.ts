
// #docplaster

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// #docregion imports
import { RouterModule } from '@angular/router';
import { CrisisListComponent } from './crisis-list/crisis-list.component';
import { HeroesListComponent } from './heroes-list/heroes-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
// #enddocregion imports

// #docregion approutes
const appRoutes = [
  {path: 'crisis-list', component: CrisisListComponent},
  {path: 'heroes-list', component: HeroesListComponent},
  {path: '', redirectTo: '/heroes-list', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
];
// #enddocregion approutes

@NgModule({
  declarations: [],
  // #docregion ngmodule-imports
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes)
  ],
  // #enddocregion ngmodule-imports
  // #docregion export
  exports: [RouterModule]
  // #enddocregion export
})
export class AppRoutingModule { }
