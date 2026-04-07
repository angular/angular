import {Routes} from '@angular/router';
import {HelloWorldComponent} from './helloworld/hello-world.component';
import {TransferStateComponent} from './transferstate/transfer-state.component';
import {DeferComponent} from './defer/defer.component';

export const routes: Routes = [
  {
    path: 'helloworld',
    component: HelloWorldComponent,
  },
  {
    path: 'transferstate',
    component: TransferStateComponent,
  },
  {
    path: 'http-transferstate-lazy',
    loadComponent: () =>
      import('./http-transferstate-lazy/http-transfer-state.component').then(
        (c) => c.TransferStateComponent,
      ),
  },
  {
    path: 'http-transferstate-lazy-on-init',
    loadComponent: () =>
      import('./http-transferstate-lazy-on-init/http-transfer-state-on-init.component').then(
        (c) => c.TransferStateOnInitComponent,
      ),
  },
  {
    path: 'error',
    component: HelloWorldComponent,
  },
  {
    path: 'defer',
    component: DeferComponent,
  },
];
