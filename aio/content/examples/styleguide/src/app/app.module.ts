import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';

import { RouterModule } from '@angular/router';

import { HashLocationStrategy,
         LocationStrategy } from '@angular/common';

import { HeroData } from '../app/hero-data';
import { AppComponent } from '../app/app.component';

import * as s0101 from '../01-01/app/app.module';
import * as s0205 from '../02-05/app/app.module';
import * as s0207 from '../02-07/app/app.module';
import * as s0208 from '../02-08/app/app.module';
import * as s0408 from '../04-08/app/app.module';
import * as s0410 from '../04-10/app/app.module';
import * as s0411 from '../04-11/app/app.module';
import * as s0412 from '../04-12/app/app.module';
import * as s0502 from '../05-02/app/app.module';
import * as s0503 from '../05-03/app/app.module';
import * as s0504 from '../05-04/app/app.module';
import * as s0512 from '../05-12/app/app.module';
import * as s0513 from '../05-13/app/app.module';
import * as s0514 from '../05-14/app/app.module';
import * as s0515 from '../05-15/app/app.module';
import * as s0516 from '../05-16/app/app.module';
import * as s0517 from '../05-17/app/app.module';
import * as s0601 from '../06-01/app/app.module';
import * as s0603 from '../06-03/app/app.module';
import * as s0701 from '../07-01/app/app.module';
import * as s0703 from '../07-03/app/app.module';
import * as s0704 from '../07-04/app/app.module';
import * as s0901 from '../09-01/app/app.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    InMemoryWebApiModule.forRoot(HeroData),

    s0101.AppModule,
    s0205.AppModule,
    s0207.AppModule,
    s0208.AppModule,
    s0408.AppModule,
    s0410.AppModule,
    s0411.AppModule,
    s0412.AppModule,
    s0502.AppModule,
    s0503.AppModule,
    s0504.AppModule,
    s0512.AppModule,
    s0513.AppModule,
    s0514.AppModule,
    s0515.AppModule,
    s0516.AppModule,
    s0517.AppModule,
    s0601.AppModule,
    s0603.AppModule,
    s0701.AppModule,
    s0703.AppModule,
    s0704.AppModule,
    s0901.AppModule,

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
