import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { PopupComponent } from './popup.component';
import { PopupService } from './popup.service';

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule],
  providers: [PopupService],
  declarations: [AppComponent, PopupComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
}
