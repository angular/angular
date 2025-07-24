import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HelloWorldComponent} from './helloworld/hello-world.component';
import {TransferStateComponent} from './transferstate/transfer-state.component';
import {DeferComponent} from './defer/defer.component';

const routes: Routes = [
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
    loadChildren: () =>
      import('./http-transferstate-lazy/http-transfer-state.module').then(
        (m) => m.HttpTransferStateModule,
      ),
  },
  {
    path: 'http-transferstate-lazy-on-init',
    loadChildren: () =>
      import('./http-transferstate-lazy-on-init/http-transferstate-lazy-on-init.module').then(
        (m) => m.HttpTransferStateOnInitModule,
      ),
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
  {
    path: 'defer',
    component: DeferComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
