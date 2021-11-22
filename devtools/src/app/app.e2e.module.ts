import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { DemoApplicationOperations } from '../demo-application-operations';
import { ApplicationEnvironment, ApplicationOperations } from 'ng-devtools';
import { DemoApplicationEnvironment } from '../demo-application-environment';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent],
  imports: [
    NoopAnimationsModule,
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () => import('./devtools-app/devtools-app.module').then((m) => m.DevToolsModule),
        pathMatch: 'full',
      },
      {
        path: 'demo-app',
        loadChildren: () => import('./demo-app/demo-app.module').then((m) => m.DemoAppModule),
      },
    ]),
  ],
  providers: [
    {
      provide: ApplicationOperations,
      useClass: DemoApplicationOperations,
    },
    {
      provide: ApplicationEnvironment,
      useClass: DemoApplicationEnvironment,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
