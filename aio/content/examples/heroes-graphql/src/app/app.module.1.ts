// #docplaster
// #docregion

// #docregion v1, v2
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

// #enddocregion v1
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

// #docregion import-apollo
import { ApolloModule } from 'apollo-angular';
import { getClient } from './client';
// #enddocregion import-apollo

// #docregion v1
import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard.component';
import { HeroesComponent }      from './heroes.component';
import { HeroDetailComponent }  from './hero-detail.component';
// #enddocregion v1, v2
import { HeroSearchComponent }  from './hero-search.component';
// #docregion v1, v2

// #docregion apollo-ngmodule
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService),
    // #enddocregion v1
    // #docregion v1
    AppRoutingModule,
    ApolloModule.forRoot(getClient)
  ],
  // #docregion search
  declarations: [
// #enddocregion apollo-ngmodule
    AppComponent,
    DashboardComponent,
    HeroDetailComponent,
    HeroesComponent,
  // #enddocregion v1, v2
    HeroSearchComponent
  // #docregion v1, v2
  ],
  // #enddocregion search
  bootstrap: [ AppComponent ]
})
export class AppModule { }
