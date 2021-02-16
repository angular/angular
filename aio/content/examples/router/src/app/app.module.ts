// #docplaster
// #docregion auth, preload
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
// #docregion animations-module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// #enddocregion auth, animations-module
import { Router } from '@angular/router';

// #docregion auth
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ComposeMessageComponent } from './compose-message/compose-message.component';

import { AppRoutingModule } from './app-routing.module';
import { HeroesModule } from './heroes/heroes.module';
import { AuthModule } from './auth/auth.module';

// #docregion animations-module
@NgModule({
  imports: [
    // #enddocregion animations-module
    BrowserModule,
    // #docregion animations-module
    BrowserAnimationsModule,
    // #enddocregion animations-module
    FormsModule,
    HeroesModule,
    AuthModule,
    AppRoutingModule,
    // #docregion animations-module
  ],
  // #enddocregion animations-module
  declarations: [
    AppComponent,
    ComposeMessageComponent,
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
// #docregion animations-module
})
// #enddocregion animations-module
export class AppModule {
// #enddocregion preload, auth
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {
    // Use a custom replacer to display function names in the route configs
    // const replacer = (key, value) => (typeof value === 'function') ? value.name : value;

    // console.log('Routes: ', JSON.stringify(router.config, replacer, 2));
  }
// #docregion preload, auth
}
// #enddocregion preload, auth
