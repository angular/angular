// #docplaster
// #docregion
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';

/* App Root */
import
// #enddocregion
       { AppComponent }       from './app.component.2';
/*
// #docregion
       { AppComponent }       from './app.component';
// #enddocregion
*/
// #docregion
import { HighlightDirective } from './highlight.directive';
import { TitleComponent }     from './title.component';
import { UserService }        from './user.service';

/* Contact Imports */
import
// #enddocregion
       { ContactModule }      from './contact/contact.module.2';
/*
// #docregion
       { ContactModule }      from './contact/contact.module';
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
