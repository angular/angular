// #docregion
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PopupService } from './popup.service';
import { PopupComponent } from './popup.component';

// include the PopupService provider,
// but exclude PopupComponent from compilation,
// because it will be added dynamically

@NgModule({
  declarations: [AppComponent, PopupComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
  providers: [PopupService],
  bootstrap: [AppComponent],
  entryComponents: [PopupComponent],
})

export class AppModule {}
