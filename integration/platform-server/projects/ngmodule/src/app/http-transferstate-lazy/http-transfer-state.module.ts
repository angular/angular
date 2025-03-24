import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TransferStateComponent as HttpTransferStateComponent} from './http-transfer-state.component';

const routes: Routes = [
  {
    path: '',
    component: HttpTransferStateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), HttpClientModule, CommonModule],
  declarations: [HttpTransferStateComponent],
  exports: [HttpTransferStateComponent],
})
export class HttpTransferStateModule {}
