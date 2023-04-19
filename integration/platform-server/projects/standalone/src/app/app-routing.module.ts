import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HelloWorldComponent} from './helloworld/hello-world.component';
import {TransferStateComponent} from './transferstate/transfer-state.component';

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
        (m) => m.HttpTransferStateModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
