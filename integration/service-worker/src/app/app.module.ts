import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgswModule} from '@angular/service-worker';


import { AppComponent } from './app.component';
import {ControllerCmp} from './controller.component';

@NgModule({
  declarations: [
    AppComponent,
    ControllerCmp,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgswModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
