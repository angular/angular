import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CarComponent } from './car/car.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HeroListComponent } from './heroes/hero-list.component';
import { InjectorComponent } from './injector.component';
import { TestComponent } from './test.component';
import { APP_CONFIG, HERO_DI_CONFIG }    from './app.config';
import { UserService } from './user.service';
import {
  ProvidersComponent,
  Provider1Component,
  Provider3Component,
  Provider4Component,
  Provider5Component,
  Provider6aComponent,
  Provider6bComponent,
  Provider7Component,
  Provider8Component,
  Provider9Component,
  Provider10Component,
} from './providers.component';

// #docregion ngmodule
@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    CarComponent,
    HeroesComponent,
    // #enddocregion ngmodule
    HeroListComponent,
    InjectorComponent,
    TestComponent,
    ProvidersComponent,
    Provider1Component,
    Provider3Component,
    Provider4Component,
    Provider5Component,
    Provider6aComponent,
    Provider6bComponent,
    Provider7Component,
    Provider8Component,
    Provider9Component,
    Provider10Component,
    // #docregion ngmodule
  ],
  // #docregion ngmodule-providers
  providers: [
    UserService,
    { provide: APP_CONFIG, useValue: HERO_DI_CONFIG }
  ],
  // #enddocregion ngmodule-providers
  bootstrap: [ AppComponent ]
})
export class AppModule { }
