// #docplaster
// #docregion
/* Angular Imports */
import { NgModule }           from '@angular/core';
import { BrowserModule }      from '@angular/platform-browser';
import { FormsModule }        from '@angular/forms';

/* App Imports */
// #enddocregion
import { AppComponent }       from './app.component.1b';
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
import { ContactComponent } from './contact/contact.component.3';
/*
// #docregion
import { ContactComponent } from './contact/contact.component';
// #enddocregion
*/
// #docregion
import { AwesomePipe } from './contact/awesome.pipe';
import { ContactService } from './contact/contact.service';
import { ContactHighlightDirective } from './contact/contact-highlight.directive';

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
