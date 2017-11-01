// #docregion
import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { HttpModule }           from '@angular/http';
import { ReactiveFormsModule }  from '@angular/forms';

import { AppComponent }               from './app.component';
import { AppRoutingModule }           from './app-routing.module';
import { HeroListComponent }          from './hero-list.component';
import { HeroCounterComponent }       from './hero-counter.component';
import { MessageLogComponent }        from './message-log.component';
import { HeroDetailComponent }        from './hero-detail.component';

import { HeroService }                from './hero.service';

// #docregion event-aggregator-import
import { EventAggregatorService }     from  './event-aggregator.service';
// #enddocregion event-aggregator-import

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    ReactiveFormsModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService)
  ],
  declarations: [
    AppComponent,
    HeroCounterComponent,
    HeroListComponent,
    MessageLogComponent,
    HeroDetailComponent
  ],
  providers: [
    HeroService,
    EventAggregatorService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
// #enddocregion
