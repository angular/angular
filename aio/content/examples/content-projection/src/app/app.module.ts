import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import {
  AppComponent,
  Zippy,
  ZippyContent,
  ZippyToggle
} from './app.component';
import { ZippyBasicComponent } from './zippy-basic/zippy-basic.component';
import { ZippyMultislotComponent } from './zippy-multislot/zippy-multislot.component';
import { ZippyNgprojectasComponent } from './zippy-ngprojectas/zippy-ngprojectas.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, Zippy, ZippyToggle, ZippyContent, ZippyBasicComponent, ZippyMultislotComponent, ZippyNgprojectasComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
