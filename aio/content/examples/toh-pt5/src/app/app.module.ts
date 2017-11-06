// #docregion
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard/dashboard.component';
import { HeroDetailComponent }  from './hero-detail/hero-detail.component';
import { HeroesComponent }      from './heroes/heroes.component';
import { HeroService }          from './hero.service';
import { MessageService }       from './message.service';
import { MessagesComponent }    from './messages/messages.component';

// #docregion routing-module
import { AppRoutingModule }     from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
// #enddocregion routing-module
  // #docregion dashboard
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent
  ],
  // #enddocregion dashboard
  providers: [ HeroService, MessageService ],
  bootstrap: [ AppComponent ]
// #docregion routing-module
})
export class AppModule { }
// #enddocregion routing-module
