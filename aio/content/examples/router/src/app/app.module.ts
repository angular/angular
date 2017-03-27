// #docplaster
// #docregion
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
// #docregion animations-module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// #enddocregion animations-module
// #docregion inspect-config
import { Router } from '@angular/router';

// #enddocregion inspect-config
import { AppComponent }            from './app.component';
import { AppRoutingModule }        from './app-routing.module';

import { HeroesModule }            from './heroes/heroes.module';
import { ComposeMessageComponent } from './compose-message.component';
import { LoginRoutingModule }      from './login-routing.module';
import { LoginComponent }          from './login.component';
import { PageNotFoundComponent }   from './not-found.component';

import { DialogService }           from './dialog.service';

// #docregion animations-module
@NgModule({
  imports: [
    // #enddocregion animations-module
    BrowserModule,
    FormsModule,
    HeroesModule,
    LoginRoutingModule,
    AppRoutingModule,
    // #docregion animations-module
    BrowserAnimationsModule
    // #enddocregion animations-module
  ],
  declarations: [
    AppComponent,
    ComposeMessageComponent,
    LoginComponent,
    PageNotFoundComponent
  ],
  providers: [
    DialogService
  ],
  bootstrap: [ AppComponent ]
})
// #docregion inspect-config
export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {
    console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}
// #enddocregion inspect-config
