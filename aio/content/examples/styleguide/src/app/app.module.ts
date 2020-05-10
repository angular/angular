import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';

import { RouterModule } from '@angular/router';

import { HashLocationStrategy,
         LocationStrategy } from '@angular/common';

import { HeroData }     from '../app/hero-data';
import { AppComponent } from '../app/app.component';

import * as s0101 from '../01-01/app/app.module';
import * as s0205 from '../02-05/app/app.module';
import * as s0206 from '../02-06/app/app.module';
import * as s0207 from '../02-07/app/app.module';
import * as s0209 from '../02-09/app/app.module';
import * as s0308 from '../03-08/app/app.module';
import * as s0401 from '../04-01/app/app.module';
import * as s0402 from '../04-02/app/app.module';
import * as s0403 from '../04-03/app/app.module';
import * as s0404 from '../04-04/app/app.module';
import * as s0405 from '../04-05/app/app.module';
import * as s0406 from '../04-06/app/app.module';
import * as s0407 from '../04-07/app/app.module';
import * as s0408 from '../04-08/app/app.module';
import * as s0411 from '../04-11/app/app.module';
import * as s0412 from '../04-12/app/app.module';
import * as s0502 from '../05-02/app/app.module';
import * as s0601 from '../06-01/app/app.module';
import * as s0604 from '../06-04/app/app.module';
import * as s0801 from '../08-01/app/app.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(HeroData),

    s0101.AppModule,
    s0205.AppModule,
    s0206.AppModule,
    s0207.AppModule,
    s0209.AppModule,
    s0308.AppModule,
    s0401.AppModule,
    s0402.AppModule,
    s0403.AppModule,
    s0404.AppModule,
    s0405.AppModule,
    s0406.AppModule,
    s0407.AppModule,
    s0408.AppModule,
    s0411.AppModule,
    s0412.AppModule,
    s0502.AppModule,
    s0601.AppModule,
    s0604.AppModule,
    s0801.AppModule,

    RouterModule.forRoot([
      { path: '', redirectTo: '/01-01', pathMatch: 'full' }
    ], {/* enableTracing: true */}),
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
