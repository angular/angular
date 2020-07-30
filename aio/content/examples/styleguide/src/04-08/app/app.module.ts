// #docplaster
// #docregion
// #docregion example
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// #enddocregion example
import { RouterModule } from '@angular/router';
// #docregion example

import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';

@NgModule({
  imports: [
    BrowserModule,
// #enddocregion example
    RouterModule.forChild([{ path: '04-08', component: AppComponent }])
// #docregion example
  ],
  declarations: [
    AppComponent,
    HeroesComponent
  ],
  exports: [ AppComponent ],
  entryComponents: [ AppComponent ]
})
export class AppModule {}
// #enddocregion example
