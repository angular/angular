// #docplaster
// #docregion
// #docregion first-config
import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { FormsModule }          from '@angular/forms';
// #docregion import-router
import { RouterModule, Routes } from '@angular/router';
// #enddocregion import-router

import { AppComponent }          from './app.component';
import { ClearanceListComponent }   from './clearance-list/clearance-list.component';
import { ItemListComponent }     from './item-list/item-list.component';
// #enddocregion first-config
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
// #docregion first-config

// #docregion appRoutes
const appRoutes: Routes = [
  { path: 'clearance-center', component: ClearanceListComponent },
  { path: 'items', component: ItemListComponent },
// #enddocregion first-config

  { path: '',   redirectTo: '/heroes', pathMatch: 'full' },
// #docregion wildcard
  { path: '**', component: PageNotFoundComponent }
// #enddocregion wildcard
// #docregion first-config
];
// #enddocregion appRoutes

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  declarations: [
    AppComponent,
    ItemListComponent,
    ClearanceListComponent,
// #enddocregion first-config
    PageNotFoundComponent
// #docregion first-config
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion
