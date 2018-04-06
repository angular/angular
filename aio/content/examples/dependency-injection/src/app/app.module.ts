// #docplaster
import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { APP_CONFIG, HERO_DI_CONFIG }    from './app.config';
import { AppComponent } from './app.component';
import { CarComponent } from './car/car.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HeroesTspComponent } from './heroes/heroes-tsp.component';
import { HeroListComponent } from './heroes/hero-list.component';
import { InjectorComponent } from './injector.component';
import { Logger } from './logger.service';
import { TestComponent } from './test.component';
import { UserService } from './user.service';

import { ProvidersModule } from './providers.module';

// #docregion ngmodule
@NgModule({
  imports: [
    BrowserModule,
    ProvidersModule
  ],
  declarations: [
    AppComponent,
    CarComponent,
    HeroesComponent,
    // #enddocregion ngmodule
    HeroesTspComponent,
    HeroListComponent,
    InjectorComponent,
    TestComponent
    // #docregion ngmodule
  ],
  // #docregion providers, providers-2
  providers: [
    // #enddocregion providers
    Logger,
    // #docregion providers
    UserService,
    { provide: APP_CONFIG, useValue: HERO_DI_CONFIG }
  ],
  // #enddocregion providers, providers-2
  exports: [ CarComponent, HeroesComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
