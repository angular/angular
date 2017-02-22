// #docregion
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';

import { AppComponent }          from './app.component';
import { HeroTaxReturnComponent }     from './hero-tax-return.component';
import { HeroesListComponent }   from './heroes-list.component';
import { HeroesService }         from './heroes.service';
import { VillainsListComponent } from './villains-list.component';

import { carComponents, carServices } from './car.components';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    carServices,
    HeroesService
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

