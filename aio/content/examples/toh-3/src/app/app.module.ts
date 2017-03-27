// #docregion
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';

import { AppComponent }  from './app.component';
// #docregion hero-detail-import
import { HeroDetailComponent } from './hero-detail.component';
// #enddocregion hero-detail-import

// #docregion declarations
@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    HeroDetailComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion declarations
