import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import { WidgetComponent } from './widget.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, WidgetComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
