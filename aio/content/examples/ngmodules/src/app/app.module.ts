import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

/* App Root */
import { AppComponent } from './app.component';

/* Feature Modules */
import { ContactModule } from './contact/contact.module';
// #docregion import-for-root
import { CoreModule } from './core/core.module';
// #enddocregion import-for-root

/* Routing Module */
import { AppRoutingModule } from './app-routing.module';


// #docregion import-for-root
@NgModule({
  imports: [
    BrowserModule,
    ContactModule,
    CoreModule.forRoot({userName: 'Miss Marple'}),
    AppRoutingModule
  ],
  // #enddocregion import-for-root
  providers: [],
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent]
  // #docregion import-for-root
})
export class AppModule { }
// #enddocregion import-for-root
