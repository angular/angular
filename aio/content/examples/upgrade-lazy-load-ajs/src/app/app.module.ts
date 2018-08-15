import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularJSComponent } from './angular-js/angular-js.component';
import { HomeComponent } from './home/home.component';
import { App404Component } from './app404/app404.component';


@NgModule({
  declarations: [
    AppComponent,
    AngularJSComponent,
    HomeComponent,
    App404Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
