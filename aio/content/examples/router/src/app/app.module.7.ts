// #docregion
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { Router }         from '@angular/router';

import { AppComponent }            from './app.component';
import { PageNotFoundComponent }   from './page-not-found/page-not-found.component';
import { ComposeMessageComponent } from './compose-message/compose-message.component';

import { AppRoutingModule }        from './app-routing.module';
import { ItemsModule }            from './items/items.module';
import { ClearanceCenterModule }      from './clearance-center/clearance-center.module';
import { AuthModule }              from './auth/auth.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ItemsModule,
    ClearanceCenterModule,
    AuthModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    ComposeMessageComponent,
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
})
// #docregion inspect-config
export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {
    // Use a custom replacer to display function names in the route configs
    const replacer = (key, value) => (typeof value === 'function') ? value.name : value;

    console.log('Routes: ', JSON.stringify(router.config, replacer, 2));
  }
}
// #enddocregion inspect-config
