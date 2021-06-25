import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ApplicationEnvironment, ApplicationOperations, DevToolsModule} from 'ng-devtools';

import {AppComponent} from './app.component';
import {ChromeApplicationEnvironment} from './chrome-application-environment';
import {ChromeApplicationOperations} from './chrome-application-operations';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserAnimationsModule, DevToolsModule],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: ApplicationOperations,
      useClass: ChromeApplicationOperations,
    },
    {
      provide: ApplicationEnvironment,
      useClass: ChromeApplicationEnvironment,
    },
  ],
})
export class AppModule {
}
