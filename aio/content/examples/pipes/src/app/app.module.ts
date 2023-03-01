// #docregion
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ExponentialStrengthPipe } from './exponential-strength.pipe';
import { FetchJsonPipe } from './fetch-json.pipe';
import { FlyingHeroesComponent, FlyingHeroesImpureComponent } from './flying-heroes.component';
import { FlyingHeroesImpurePipe, FlyingHeroesPipe } from './flying-heroes.pipe';
import { HeroAsyncMessageComponent } from './hero-async-message.component';
import { HeroBirthdayComponent } from './hero-birthday1.component';
import { HeroBirthday2Component } from './hero-birthday2.component';
import { HeroListComponent } from './hero-list.component';
import { PowerBoostCalculatorComponent } from './power-boost-calculator.component';
import { PowerBoosterComponent } from './power-booster.component';
import { PrecedenceComponent } from './precedence.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
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
    ExponentialStrengthPipe,
    PrecedenceComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
