import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroService } from './hero.service';
import { MessageService } from './message.service';
import { MessagesComponent } from './messages/messages.component';

@NgModule({
  declarations: [
    AppComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  // #docregion providers
  // #docregion providers-heroservice
  providers: [
    HeroService,
    // #enddocregion providers-heroservice
    MessageService
    // #docregion providers-heroservice
  ],
  // #enddocregion providers-heroservice
  // #enddocregion providers
  bootstrap: [ AppComponent ]
})
export class AppModule { }
