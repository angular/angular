import {NgModule} from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {ApplicationEnvironment, ApplicationOperations} from 'ng-devtools';

import {DemoApplicationEnvironment} from '../demo-application-environment';
import {DemoApplicationOperations} from '../demo-application-operations';

import {AppComponent} from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    NoopAnimationsModule,
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () =>
            import('./devtools-app/devtools-app.module').then((m) => m.DevToolsModule),
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
export class AppModule {
}
