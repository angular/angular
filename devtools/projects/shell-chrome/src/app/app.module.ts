import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ApplicationEnvironment, ApplicationOperations, DevToolsModule } from 'ng-devtools';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChromeApplicationOperations } from './chrome-application-operations';
import { ChromeApplicationEnvironment } from './chrome-application-environment';

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
export class AppModule {}
