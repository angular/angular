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

// #docregion class
@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    AwesomePipe,
    ContactComponent,
    ContactHighlightDirective
  ],
  // #docregion exports
  exports:   [ ContactComponent ],
  // #enddocregion exports
  providers: [ ContactService ]
})
export class ContactModule { }
// #enddocregion class
// #enddocregion
