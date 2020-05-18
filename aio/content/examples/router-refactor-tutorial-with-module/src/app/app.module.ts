import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CrisisListComponent } from './crisis-list/crisis-list.component';
import { HeroesListComponent } from './heroes-list/heroes-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
// #docplaster
// #docregion approutingmodule-import
import { AppRoutingModule } from './app-routing.module';
// #enddocregion approutingmodule-import

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
    AppRoutingModule
  ],
// #enddocregion imports
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
