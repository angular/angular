// #docplaster
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
// #docregion http-client-module-import
import { HttpClientModule } from '@angular/common/http';
// #enddocregion http-client-module-import
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductAlertsComponent } from './product-alerts/product-alerts.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { ShippingComponent } from './shipping/shipping.component';

// #docregion product-details-route, http-client-module, shipping-route, cart-route

@NgModule({
  imports: [
    BrowserModule,
    // #enddocregion product-details-route, cart-route
    HttpClientModule,
    // #docregion product-details-route, cart-route
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: ProductListComponent },
      { path: 'products/:productId', component: ProductDetailsComponent },
// #enddocregion product-details-route
      { path: 'cart', component: CartComponent },
// #enddocregion cart-route, http-client-module
      { path: 'shipping', component: ShippingComponent },
// #enddocregion shipping-route
// #docregion product-details-route, http-client-module, shipping-route, cart-route
    ])
  ],
  // #enddocregion product-details-route, cart-route
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    ProductAlertsComponent,
    ProductDetailsComponent,
    CartComponent,
// #enddocregion http-client-module
    ShippingComponent
// #docregion http-client-module
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
