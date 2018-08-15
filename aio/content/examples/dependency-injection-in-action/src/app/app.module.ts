// #docregion
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// import { AppRoutingModule } from './app-routing.module';
import { LocationStrategy,
         HashLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';

import { HeroData } from './hero-data';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';


import { AppComponent } from './app.component';
import { HeroBioComponent } from './hero-bio.component';
import { HeroBiosComponent,
         HeroBiosAndContactsComponent } from './hero-bios.component';
import { HeroOfTheMonthComponent } from './hero-of-the-month.component';
import { HeroContactComponent } from './hero-contact.component';
import { HeroesBaseComponent,
         SortedHeroesComponent } from './sorted-heroes.component';
import { HighlightDirective } from './highlight.directive';
import { ParentFinderComponent,
         AlexComponent,
         AliceComponent,
         CarolComponent,
         ChrisComponent,
         CraigComponent,
         CathyComponent,
         BarryComponent,
         BethComponent,
         BobComponent } from './parent-finder.component';
import { StorageComponent } from './storage.component';

const declarations = [
    AppComponent,
    HeroBiosComponent, HeroBiosAndContactsComponent, HeroBioComponent,
    HeroesBaseComponent, SortedHeroesComponent,
    HeroOfTheMonthComponent, HeroContactComponent,
    HighlightDirective,
    ParentFinderComponent,
];

const componentListA = [ AliceComponent, AlexComponent ];

const componentListB = [ BarryComponent, BethComponent, BobComponent ];

const componentListC = [
  CarolComponent, ChrisComponent, CraigComponent,
  CathyComponent
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(HeroData)
    // AppRoutingModule TODO: add routes
  ],
  declarations: [
    declarations,
    componentListA,
    componentListB,
    componentListC,
    StorageComponent,
  ],
  bootstrap: [ AppComponent ],
  // #docregion providers
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ]
  // #enddocregion providers
})
export class AppModule { }
