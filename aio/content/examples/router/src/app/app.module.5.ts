// #docplaster
// #docregion
import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { AppComponent }            from './app.component';
import { AppRoutingModule }        from './app-routing.module';

import { ItemsModule }            from './items/items.module';
import { ClearanceCenterModule }      from './clearance-center/clearance-center.module';

import { ComposeMessageComponent } from './compose-message/compose-message.component';
import { PageNotFoundComponent }   from './page-not-found/page-not-found.component';

import { AdminModule }             from './admin/admin.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ItemsModule,
    ClearanceCenterModule,
    AdminModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    ComposeMessageComponent,
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
