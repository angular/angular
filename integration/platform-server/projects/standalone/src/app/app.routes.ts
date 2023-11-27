import {Routes} from '@angular/router';
import {HelloWorldComponent} from './helloworld/hello-world.component';
import {TransferStateComponent} from './transferstate/transfer-state.component';
import {DynamicComponentRoot} from './dynamic-component/dynamic-component-root.component';

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
    path: 'dynamic-component',
    component: DynamicComponentRoot,
  },
  {
    path: 'error',
    component: HelloWorldComponent,
    resolve: {
      'id': () => {
        throw new Error('Error in resolver.');
      },
    },
  },
];
