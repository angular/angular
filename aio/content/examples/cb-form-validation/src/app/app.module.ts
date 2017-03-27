// #docregion
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }           from './app.component';
import { HeroFormTemplateModule } from './template/hero-form-template.module';
import { HeroFormReactiveModule } from './reactive/hero-form-reactive.module';

@NgModule({
  imports: [
    BrowserModule,
    HeroFormTemplateModule,
    HeroFormReactiveModule
  ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
