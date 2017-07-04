import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

/* App Root */
import { AppComponent }   from './app.component';

/* Feature Modules */
import { ContactModule }    from './contact/contact.module';
import { CoreModule }       from './core/core.module';

/* Routing Module */
import { AppRoutingModule } from './app-routing.module';



@NgModule({
  declarations: [
    AppComponent
  ],
  // #docregion import-for-root
  imports: [
    BrowserModule,
    ContactModule,
    CoreModule.forRoot({userName: 'Miss Marple'}),
    AppRoutingModule
  ],
  // #enddocregion import-for-root
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
