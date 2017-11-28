// #docplaster
// #docregion
/* Angular Imports */
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';

/* App Imports */
// #enddocregion
import { AppComponent }       from './app.component.3';
/*
// #docregion
import { AppComponent }       from './app.component';
// #enddocregion
*/
// #docregion
import { HighlightDirective } from './highlight.directive';
import { TitleComponent }     from './title.component';
import { UserService }        from './user.service';

/* Routing Module */
// #enddocregion
import { AppRoutingModule }   from './app-routing.module.3';
/*
// #docregion
import { AppRoutingModule }   from './app-routing.module';
// #enddocregion
*/
// #docregion

@NgModule({
// #docregion imports
  imports:      [
    BrowserModule,
    AppRoutingModule
  ],
// #enddocregion imports
  providers:    [ UserService ],
  declarations: [ AppComponent, HighlightDirective, TitleComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
