import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoApplicationOperations } from '../demo-application-operations';
import { ApplicationOperations } from 'ng-devtools';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () => import('./devtools-app/devtools-app.module').then(m => m.DevToolsModule),
        pathMatch: 'full',
      },
      {
        path: 'demo-app',
        loadChildren: () => import('./demo-app/demo-app.module').then(m => m.DemoAppModule),
      },
    ]),
  ],
  providers: [
    {
      provide: ApplicationOperations,
      useClass: DemoApplicationOperations,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
