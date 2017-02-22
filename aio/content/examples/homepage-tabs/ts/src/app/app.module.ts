// #docregion
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DiDemoComponent } from './di_demo';
import { UiTabsComponent, UiPaneDirective } from './ui_tabs';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [
    DiDemoComponent,
    UiTabsComponent,
    UiPaneDirective
  ],
  bootstrap:    [ DiDemoComponent ]
})
export class AppModule { }
