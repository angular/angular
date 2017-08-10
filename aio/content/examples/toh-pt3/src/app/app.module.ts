// #docregion
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';

import { AppComponent }        from './app.component';
// #docregion hero-detail-import
import { HeroDetailComponent } from './hero-detail.component';
// #enddocregion hero-detail-import

@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
// #docregion declarations
  declarations: [
    AppComponent,
    HeroDetailComponent
  ],
// #enddocregion declarations
  bootstrap: [ AppComponent ]
})
export class AppModule { }
