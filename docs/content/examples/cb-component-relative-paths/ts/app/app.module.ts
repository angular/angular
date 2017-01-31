import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SomeAbsoluteComponent, SomeRelativeComponent } from './some.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    SomeAbsoluteComponent,
    SomeRelativeComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
