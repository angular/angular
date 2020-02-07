import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ApplicationOperations, DevToolsModule } from 'ng-devtools';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChromeApplicationOperations } from './chrome-application-operations';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserAnimationsModule, DevToolsModule],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: ApplicationOperations,
      useClass: ChromeApplicationOperations,
    },
  ],
})
export class AppModule {}
