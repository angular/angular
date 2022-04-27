import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { RouterModule } from '@angular/router';

import { AppModule } from './app.module.js';
import { AppComponent } from './app.component.js';

@NgModule({
  bootstrap: [
    AppComponent,
  ],
  imports: [
    AppModule,
    RouterModule.forRoot([]),
    ServerModule,
  ],
})
export class AppServerModule {}
