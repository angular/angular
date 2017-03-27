// #docplaster
// #docregion
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';

/* App Root */
import
// #enddocregion
       { AppComponent }       from './app.component.1b';
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
       { ContactComponent }   from './contact/contact.component.3';
/*
// #docregion
       { ContactComponent }   from './contact/contact.component';
// #enddocregion
*/
// #docregion
import { ContactService }     from './contact/contact.service';
import { AwesomePipe }        from './contact/awesome.pipe';

// #docregion import-alias
import {
  HighlightDirective as ContactHighlightDirective
} from './contact/highlight.directive';
// #enddocregion import-alias

import { FormsModule }        from '@angular/forms';

@NgModule({
  imports: [ BrowserModule,  FormsModule ],
// #docregion declarations
  declarations: [
    AppComponent, HighlightDirective, TitleComponent,
    AwesomePipe, ContactComponent, ContactHighlightDirective
  ],
// #docregion providers
  providers: [ ContactService, UserService ],
// #enddocregion providers
  bootstrap: [ AppComponent ]
})
export class AppModule { }
