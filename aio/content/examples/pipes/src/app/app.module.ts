// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {
  FlyingHeroesComponent,
  FlyingHeroesImpureComponent
} from './flying-heroes.component';
import { HeroAsyncMessageComponent } from './hero-async-message.component';
import { HeroBirthdayComponent } from './hero-birthday1.component';
import { HeroBirthday2Component } from './hero-birthday2.component';
import { HeroListComponent } from './hero-list.component';
import { PowerBoosterComponent } from './power-booster.component';
import { PowerBoostCalculatorComponent } from './power-boost-calculator.component';
import {
  FlyingHeroesPipe,
  FlyingHeroesImpurePipe
} from './flying-heroes.pipe';
import { FetchJsonPipe } from './fetch-json.pipe';
import { ExponentialStrengthPipe } from './exponential-strength.pipe';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    FlyingHeroesComponent,
    FlyingHeroesImpureComponent,
    HeroAsyncMessageComponent,
    HeroBirthdayComponent,
    HeroBirthday2Component,
    HeroListComponent,
    PowerBoosterComponent,
    PowerBoostCalculatorComponent,
    FlyingHeroesPipe,
    FlyingHeroesImpurePipe,
    FetchJsonPipe,
    ExponentialStrengthPipe
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
