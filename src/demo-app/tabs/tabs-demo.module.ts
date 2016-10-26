import {NgModule} from '@angular/core';
import {MaterialModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {TabsDemo, SunnyTabContent, RainyTabContent, FoggyTabContent} from './tabs-demo';

@NgModule({
  imports: [
    FormsModule,
    BrowserModule,
    MaterialModule,
    RouterModule,
  ],
  declarations: [
    TabsDemo,
    SunnyTabContent,
    RainyTabContent,
    FoggyTabContent,
  ]
})
export class TabsDemoModule {}
