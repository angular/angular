// #docplaster
// #docregion
/* Angular Imports */
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';

/* App Imports */
// #enddocregion
import { AppComponent }       from './app.component.2';
/*
// #docregion
import { AppComponent }       from './app.component';
// #enddocregion
*/
// #docregion
import { HighlightDirective } from './highlight.directive';
import { TitleComponent }     from './title.component';
import { UserService }        from './user.service';

/* Contact Imports */
// #enddocregion
import { ContactModule }      from './contact/contact.module.2';
/*
// #docregion
import { ContactModule }      from './contact/contact.module';
// #enddocregion
*/
// #docregion

@NgModule({
  imports:      [ BrowserModule, ContactModule ],
  declarations: [ AppComponent, HighlightDirective, TitleComponent ],
  providers:    [ UserService ],
  bootstrap:    [ AppComponent ],
})
export class AppModule { }
