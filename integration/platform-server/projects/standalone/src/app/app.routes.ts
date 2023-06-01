import {Routes} from '@angular/router';
import {HelloWorldComponent} from './helloworld/hello-world.component';
import {TransferStateComponent} from './transferstate/transfer-state.component';

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
        (c) => c.TransferStateComponent
      ),
  },
];
