// #docplaster
// #docregion
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';

import
// #enddocregion
       { AppComponent }       from './app.component.1';
/*
// #docregion
       { AppComponent }       from './app.component';
// #enddocregion
*/
// #docregion
import { HighlightDirective } from './highlight.directive';
import { TitleComponent }     from './title.component';
import { UserService }        from './user.service';

/* Contact Related Imports */
import { FormsModule }        from '@angular/forms';

import { AwesomePipe }        from './contact/awesome.pipe';
import { ContactComponent }   from './contact/contact.component.3';

// #docregion import-contact-directive
import {
  HighlightDirective as ContactHighlightDirective
} from './contact/highlight.directive';
// #enddocregion import-contact-directive

@NgModule({
// #docregion imports
  imports: [ BrowserModule, FormsModule ],
// #enddocregion imports
// #docregion declarations, directive, component
  declarations: [
    AppComponent,
    HighlightDirective,
// #enddocregion directive
    TitleComponent,
// #enddocregion component

    AwesomePipe,
    ContactComponent,
    ContactHighlightDirective
// #docregion directive, component
  ],
// #enddocregion declarations, directive, component
// #docregion providers
  providers: [ UserService ],
// #enddocregion providers
  bootstrap: [ AppComponent ]
})
export class AppModule { }
