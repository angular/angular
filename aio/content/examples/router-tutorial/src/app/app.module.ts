// #docplaster
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// #docregion router-import
import { RouterModule } from '@angular/router';
// #enddocregion router-import
import { AppComponent } from './app.component';
import { CrisisListComponent } from './crisis-list/crisis-list.component';
import { HeroesListComponent } from './heroes-list/heroes-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    CrisisListComponent,
    HeroesListComponent,
    PageNotFoundComponent
  ],
  // #docplaster
  // #docregion import-basic, import-redirect, import-wildcard
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: 'crisis-list', component: CrisisListComponent},
      {path: 'heroes-list', component: HeroesListComponent},
  // #enddocregion import-basic
      {path: '', redirectTo: '/heroes-list', pathMatch: 'full'},
  // #enddocregion import-redirect
      {path: '**', component: PageNotFoundComponent}
  // #enddocregion import-wildcard
  // #docregion import-basic, import-redirect, import-wildcard
    ]),
  ],
  // #enddocregion import-basic, import-redirect, import-wildcard
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
