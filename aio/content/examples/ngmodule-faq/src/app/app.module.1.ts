// #docplaster
// #docregion
/* Angular Imports */
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';

/* App Imports */
// #enddocregion
import { AppComponent }       from './app.component.1';
/*
// #docregion
import { AppComponent }       from './app.component';
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
import {
  ContactHighlightDirective as ContactHighlightDirective
} from './contact/contact-highlight.directive';

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
