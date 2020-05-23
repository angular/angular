import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ExampleProgressbarComponent } from './progress-bar.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, ExampleProgressbarComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
