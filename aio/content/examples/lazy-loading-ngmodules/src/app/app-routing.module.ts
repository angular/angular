// #docplaster
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// #docregion const-routes, routes-customers, routes-customers-orders
const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule)
    // #enddocregion routes-customers
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
    // #enddocregion routes-customers-orders
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
    // #docregion routes-customers, routes-customers-orders
  }
];
// #enddocregion const-routes, routes-customers, routes-customers-orders

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
