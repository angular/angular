// #docplaster
// #docregion
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';

import { AwesomePipe }        from './awesome.pipe';
// #enddocregion
import { ContactComponent }   from './contact.component.3';
/*
// #docregion
import { ContactComponent }   from './contact.component';
// #enddocregion
*/
// #docregion
import { ContactHighlightDirective } from './contact-highlight.directive';
import { ContactService }     from './contact.service';

// #enddocregion
import { ContactRoutingModule }   from './contact-routing.module.3';
/*
// #docregion
import { ContactRoutingModule }   from './contact-routing.module';
// #enddocregion
*/
// #docregion

// #docregion class
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ContactRoutingModule
  ],
  declarations: [
    AwesomePipe,
    ContactComponent,
    ContactHighlightDirective
  ],
  providers: [ ContactService ]
})
export class ContactModule { }
// #enddocregion class
// #enddocregion
