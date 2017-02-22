// #docplaster
// #docregion
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';

import { AwesomePipe }        from './awesome.pipe';

import
// #enddocregion
       { ContactComponent }   from './contact.component.3';
/*
// #docregion
       { ContactComponent }   from './contact.component';
// #enddocregion
*/
// #docregion
import { ContactService }     from './contact.service';
import { HighlightDirective } from './highlight.directive';

// #docregion class
@NgModule({
  imports:      [ CommonModule, FormsModule ],
  declarations: [ ContactComponent, HighlightDirective, AwesomePipe ],
  exports:      [ ContactComponent ],
  providers:    [ ContactService ]
})
export class ContactModule { }
// #enddocregion class
// #enddocregion
