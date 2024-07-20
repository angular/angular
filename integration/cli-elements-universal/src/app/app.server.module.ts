import {NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';

import {AppModule} from './app.module';
import {AppComponent} from './app.component';

@NgModule({
  bootstrap: [AppComponent],
  imports: [AppModule, ServerModule],
})
export class AppServerModule {}
