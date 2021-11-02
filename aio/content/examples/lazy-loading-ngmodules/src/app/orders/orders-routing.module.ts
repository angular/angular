// #docplaster
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// #docregion orders-routing-module-detail
import { OrdersComponent } from './orders.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersComponent
  }
];
// #enddocregion orders-routing-module-detail

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
