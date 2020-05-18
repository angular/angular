import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CrisisListComponent } from './crisis-list/crisis-list.component';
import { HeroesListComponent } from './heroes-list/heroes-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

// #docplaster
// #docregion routes-array
const appRoutes = [
  {path: 'crisis-list', component: CrisisListComponent},
  {path: 'heroes-list', component: HeroesListComponent},
  {path: '', redirectTo: '/heroes-list', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
];
// #enddocregion routes-array

@NgModule({
  declarations: [
    AppComponent,
    CrisisListComponent,
    HeroesListComponent,
    PageNotFoundComponent
  ],
// #docregion imports
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
// #enddocregion imports
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
