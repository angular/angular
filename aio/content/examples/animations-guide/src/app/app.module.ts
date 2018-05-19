import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppComponent} from './app.component';
import {OpenCloseComponent} from './open-close.component';
import {StatusSliderComponent} from './status-slider.component';

@NgModule({
  imports: [BrowserAnimationsModule],
  declarations: [
    AppComponent,
    StatusSliderComponent,
    OpenCloseComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
