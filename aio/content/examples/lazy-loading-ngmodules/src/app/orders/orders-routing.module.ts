// #docplaster
// #docregion orders-routing-module
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// #docregion orders-routing-module-detail
import { OrderListComponent } from './order-list/order-list.component';

const routes: Routes = [
  {
    path: '',
    component: OrderListComponent
  }
];
// #enddocregion orders-routing-module-detail

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
// #enddocregion orders-routing-module
