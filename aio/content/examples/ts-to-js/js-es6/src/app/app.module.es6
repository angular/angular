import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ConfirmComponent } from './confirm.component';
// #docregion appimport
import { HeroComponent } from './hero.component';

// #enddocregion appimport
import { HeroComponent as HeroDIComponent } from './hero-di.component';
import { HeroComponent as HeroDIInjectComponent } from './hero-di-inject.component';
import { HeroComponent as HeroDIInjectAdditionalComponent } from './hero-di-inject-additional.component';
import { HeroHostComponent } from './hero-host.component';
import { HeroIOComponent } from './hero-io.component';
import { HeroComponent as HeroLifecycleComponent } from './hero-lifecycle.component';
import { HeroQueriesComponent, ViewChildComponent, ContentChildComponent } from './hero-queries.component';
import { HeroTitleComponent } from './hero-title.component';

import { DataService } from './data.service';

export class AppModule { }

AppModule.annotations = [
  new NgModule({
    imports: [ BrowserModule],
    declarations: [
      AppComponent,
      ConfirmComponent,
      HeroComponent,
      HeroDIComponent,
      HeroDIInjectComponent,
      HeroDIInjectAdditionalComponent,
      HeroHostComponent,
      HeroIOComponent,
      HeroLifecycleComponent,
      HeroQueriesComponent, ViewChildComponent, ContentChildComponent,
      HeroTitleComponent
    ],
    providers: [
      DataService,
      { provide: 'heroName', useValue: 'Windstorm' }
    ],
    bootstrap: [ AppComponent ],

    // schemas: [ NO_ERRORS_SCHEMA ] // helpful for debugging
  })
]

/* tslint:disable no-unused-variable */
// #docregion ng2import
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  LocationStrategy,
  HashLocationStrategy
} from '@angular/common';
// #enddocregion ng2import
