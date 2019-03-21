// #docplaster
// #docregion product-details-route, http-client-module-import, http-client-module
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
// #enddocregion product-details-route
import { HttpClientModule } from '@angular/common/http';
// #enddocregion http-client-module-import
// #docregion product-details-route
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductAlertsComponent } from './product-alerts/product-alerts.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
// #enddocregion product-details-route, http-client-module
import { ShippingComponent } from './shipping/shipping.component';
import { CartComponent } from './cart/cart.component';
// #docregion product-details-route, http-client-module, shipping-route

@NgModule({
  imports: [
    BrowserModule,
    // #enddocregion product-details-route
    HttpClientModule,
    // #docregion product-details-route
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: ProductListComponent },
      { path: 'products/:productId', component: ProductDetailsComponent },
// #enddocregion product-details-route, http-client-module
      { path: 'shipping', component: ShippingComponent },
// #enddocregion shipping-route
      { path: 'cart', component: CartComponent }
// #docregion product-details-route, http-client-module, shipping-route
    ])
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    ProductAlertsComponent,
    ProductDetailsComponent,
// #enddocregion product-details-route, http-client-module
    ShippingComponent,
// #enddocregion shipping-route
    CartComponent,
// #docregion product-details-route, http-client-module, shipping-route
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
