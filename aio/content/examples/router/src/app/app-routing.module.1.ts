// #docregion
import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { ClearanceListComponent }   from './clearance-list/clearance-list.component';
import { ItemListComponent }     from './item-list/item-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

// #docregion appRoutes
const appRoutes: Routes = [
  { path: 'clearance-center', component: ClearanceListComponent },
  { path: 'items',        component: ItemListComponent },
  { path: '',   redirectTo: '/clearance', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
// #enddocregion appRoutes

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
