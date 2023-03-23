import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransferStateComponent } from './transfer-state.component';

const routes: Routes = [
  {
    path: '',
    component: TransferStateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), HttpClientModule, CommonModule],
  declarations: [TransferStateComponent],
  exports: [TransferStateComponent],
})
export class TransferStateModule {
}
