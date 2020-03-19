// NEVER USED. For docs only. Should compile though
// #docplaster
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ItemListComponent }      from './item-list/item-list.component';
import { ClearanceListComponent }    from './clearance-list/clearance-list.component';
import { PageNotFoundComponent }  from './page-not-found/page-not-found.component';
import { PageNotFoundComponent as ItemDetailComponent } from './page-not-found/page-not-found.component';

// #docregion
const appRoutes: Routes = [
  { path: 'clearance-center', component: ClearanceListComponent },
  { path: 'item/:id',      component: ItemDetailComponent },
  {
    path: 'items',
    component: ItemListComponent,
    data: { title: 'Item List' }
  },
  { path: '',
    redirectTo: '/items',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
    // other imports here
  ],
// #enddocregion
/*
// #docregion
  ...
})
export class AppModule { }
// #enddocregion
*/
})
export class AppModule0 { }
