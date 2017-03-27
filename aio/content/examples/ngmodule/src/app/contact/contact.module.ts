// #docregion
import { NgModule }           from '@angular/core';
import { SharedModule }       from '../shared/shared.module';

import { ContactComponent }     from './contact.component';
import { ContactService }       from './contact.service';
import { ContactRoutingModule } from './contact-routing.module';

// #docregion class
@NgModule({
  imports:      [ SharedModule, ContactRoutingModule ],
  declarations: [ ContactComponent ],
  providers:    [ ContactService ]
})
export class ContactModule { }
// #enddocregion class
