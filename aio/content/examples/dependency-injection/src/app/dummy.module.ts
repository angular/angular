
/// Dummy modules to satisfy Angular Language Service
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppModule } from './app.module';

////////

import { AppComponent as AppComponent1 } from './app.component.1';

@NgModule({
  imports: [ CommonModule, AppModule ],
  declarations: [ AppComponent1 ]
})
export class DummyModule1 {}

/////////

import { AppComponent as AppComponent2 } from './app.component.2';

@NgModule({
  imports: [ CommonModule, AppModule ],
  declarations: [ AppComponent2 ]
})
export class DummyModule2 {}
