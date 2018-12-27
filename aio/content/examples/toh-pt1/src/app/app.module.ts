// #docplaster
// #docregion
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// #docregion formsmodule-js-import
import { FormsModule } from '@angular/forms'; // <-- NgModel은 이 패키지가 제공합니다.
// #enddocregion formsmodule-js-import

import { AppComponent } from './app.component';
// #docregion heroes-import
import { HeroesComponent } from './heroes/heroes.component';
// #enddocregion heroes-import

@NgModule({
  // #docregion declarations
  declarations: [
    AppComponent,
    HeroesComponent
  ],
  // #enddocregion declarations
  // #docregion ng-imports
  imports: [
    BrowserModule,
    FormsModule
  ],
  // #enddocregion ng-imports
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
