import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DevToolsModule } from 'ng-devtools';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    DevToolsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
