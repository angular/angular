// #docplaster
// #docregion app-routing-module
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


// #docregion const-routes
const routes: Routes = [
  {
    path: 'customers',
    loadChildren: 'app/customers/customers.module#CustomersModule'
  },
  {
    path: 'orders',
    loadChildren: 'app/orders/orders.module#OrdersModule'
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
// #enddocregion const-routes

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
// #enddocregion app-routing-module
