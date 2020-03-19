// #docregion
// #docregion milestone3
import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { ClearanceListComponent }   from './clearance-list/clearance-list.component';
// #enddocregion milestone3
// import { HeroListComponent }  from './hero-list/hero-list.component';  // <-- delete this line
// #docregion milestone3
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const appRoutes: Routes = [
  { path: 'clearance-center', component: ClearanceListComponent },
// #enddocregion milestone3
  // { path: 'items',     component: ItemListComponent }, // <-- delete this line
// #docregion milestone3
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
// #enddocregion milestone3
