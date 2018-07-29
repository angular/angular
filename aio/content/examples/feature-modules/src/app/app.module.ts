// #docplaster
// #docregion app-module
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
// imports 배열에 추가할 모듈은 여기에서 로드합니다.
import { CustomerDashboardModule } from './customer-dashboard/customer-dashboard.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CustomerDashboardModule // 기능 모듈은 여기에 추가합니다.
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
// #enddocregion app-module
