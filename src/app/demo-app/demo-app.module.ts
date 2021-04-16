import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DemoAppComponent } from './demo-app.component';
import { RouterModule } from '@angular/router';

import { initializeMessageBus } from 'ng-devtools-backend';
import { ZippyComponent } from './zippy/zippy.component';
import { ZoneUnawareIFrameMessageBus } from 'src/zone-unaware-iframe-message-bus';
import { HeavyComponent } from './heavy/heavy.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [DemoAppComponent, HeavyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [DemoAppComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DemoAppComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('./todo/app.module').then((m) => m.AppModule),
          },
        ],
      },
    ]),
  ],
})
export class DemoAppModule {
  constructor(injector: Injector) {
    const el = createCustomElement(ZippyComponent, { injector });
    customElements.define('app-zippy', el as any);
  }
}

initializeMessageBus(
  new ZoneUnawareIFrameMessageBus('angular-devtools-backend', 'angular-devtools', () => window.parent)
);
