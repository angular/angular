// #docplaster
// #docregion
// #docregion v1, v2
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

// #enddocregion v1
// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

// #docregion v1
import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard.component';
import { HeroesComponent }      from './heroes.component';
import { HeroDetailComponent }  from './hero-detail.component';
import { HeroService }          from './hero.service';
// #enddocregion v1, v2
import { HeroSearchComponent }  from './hero-search.component';
// #docregion v1, v2

@NgModule({
  imports: [
    BrowserModule.withServerTransition({
      appId: 'toh-universal'
    }),
    FormsModule,
    HttpModule,
    // #enddocregion v1
    // #docregion in-mem-web-api
    InMemoryWebApiModule.forRoot(InMemoryDataService),
    // #enddocregion in-mem-web-api
    // #docregion v1
    AppRoutingModule
  ],
  // #docregion search
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroDetailComponent,
    HeroesComponent,
  // #enddocregion v1, v2
    HeroSearchComponent
  // #docregion v1, v2
  ],
  // #enddocregion search
  providers: [ HeroService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
