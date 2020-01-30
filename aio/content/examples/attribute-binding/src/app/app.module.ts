import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { CompWithHostBindingComponent } from './comp-with-host-binding.component';


@NgModule({
  declarations: [
    AppComponent,
    CompWithHostBindingComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
