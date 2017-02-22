// #docplaster
// #docregion
// #docregion v4
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

/* App Root */
import { AppComponent }   from './app.component';

/* Feature Modules */
import { ContactModule }    from './contact/contact.module';
import { CoreModule }       from './core/core.module';

/* Routing Module */
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  // #docregion import-for-root
  imports: [
    BrowserModule,
    ContactModule,
// #enddocregion v4
// #enddocregion import-for-root
/*
// #docregion v4
    CoreModule,
// #enddocregion v4
*/
// #docregion import-for-root
    CoreModule.forRoot({userName: 'Miss Marple'}),
// #docregion v4
    AppRoutingModule
  ],
  // #enddocregion import-for-root
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
// #enddocregion v4
// #enddocregion
