// #docplaster
// #docregion
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';

/* App Root */
import { AppComponent }       from './app.component.3';
import { HighlightDirective } from './highlight.directive';
import { TitleComponent }     from './title.component';
import { UserService }        from './user.service';

/* Feature Modules */
import { ContactModule }      from './contact/contact.module.3';

/* Routing Module */
import { AppRoutingModule }   from './app-routing.module.3';

@NgModule({
// #docregion imports
  imports:      [
    BrowserModule,
    ContactModule,
    AppRoutingModule
  ],
// #enddocregion imports
  providers:    [ UserService ],
  declarations: [ AppComponent, HighlightDirective, TitleComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
