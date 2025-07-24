import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TransferStateComponentOnInit} from './http-transferstate-lazy-on-init.component';

const routes: Routes = [
  {
    path: '',
    component: TransferStateComponentOnInit,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), HttpClientModule, CommonModule],
  declarations: [TransferStateComponentOnInit],
})
export class HttpTransferStateOnInitModule {}
