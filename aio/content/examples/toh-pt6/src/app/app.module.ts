// #docplaster
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// #docregion import-http-client
import { HttpClientModule } from '@angular/common/http';
// #enddocregion import-http-client

// #docregion import-in-mem-stuff
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
// #enddocregion import-in-mem-stuff

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HeroSearchComponent } from './hero-search/hero-search.component';
import { MessagesComponent } from './messages/messages.component';

    // #docregion import-httpclientmodule
@NgModule({
  imports: [
    // #enddocregion import-httpclientmodule
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    // #docregion in-mem-web-api-imports
    // #docregion import-httpclientmodule
    HttpClientModule,
    // #enddocregion import-httpclientmodule

    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    // Remove it when a real server is ready to receive requests.
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    )
    // #enddocregion in-mem-web-api-imports
  // #docregion import-httpclientmodule
  ],
  // #enddocregion import-httpclientmodule
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent,
    HeroSearchComponent
  ],
  bootstrap: [ AppComponent ]
// #docregion import-httpclientmodule
})
// #enddocregion import-httpclientmodule
export class AppModule { }
