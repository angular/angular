// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeroTaxReturnComponent } from './hero-tax-return.component';
import { HeroesListComponent } from './heroes-list.component';
import { VillainsListComponent } from './villains-list.component';

import { carComponents } from './car.components';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    carComponents,
    HeroesListComponent,
    HeroTaxReturnComponent,
    VillainsListComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

