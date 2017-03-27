// #docplaster
// #docregion
// #docregion v1
import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 import module

import { AppComponent }        from './app.component';
import { HeroDetailComponent } from './hero-detail.component'; // <-- #1 import component
// #enddocregion v1
import { HeroListComponent }   from './hero-list.component';

import { HeroService }         from './hero.service'; //  <-- #1 import service
// #docregion v1

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule // <-- #2 add to Angular module imports
  ],
  declarations: [
    AppComponent,
    HeroDetailComponent, // <-- #3 declare app component
// #enddocregion v1
    HeroListComponent
// #docregion v1
  ],
// #enddocregion v1
  exports: [ // export for the DemoModule
    AppComponent,
    HeroDetailComponent,
    HeroListComponent
  ],
  providers: [ HeroService ], // <-- #4 provide HeroService
// #docregion v1
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion v1
