// #docplaster
// #docregion product-details-route, http-client-module-import, http-client-module
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// #enddocregion http-client-module-import, http-client-module
import { ReactiveFormsModule } from '@angular/forms';

// #docregion http-client-module
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
// #enddocregion product-details-route, http-client-module
import { CartComponent } from './cart/cart.component';
// #docregion product-details-route, http-client-module

@NgModule({
  imports: [
    BrowserModule,
    // #enddocregion product-details-route
    HttpClientModule,
    // #enddocregion http-client-module
    ReactiveFormsModule,
    // #docregion product-details-route, http-client-module
    RouterModule.forRoot([
      { path: '', component: ProductListComponent },
      { path: 'products/:productId', component: ProductDetailsComponent },
// #enddocregion product-details-route
      { path: 'cart', component: CartComponent }
// #docregion product-details-route
    ])
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    ProductDetailsComponent,
// #enddocregion product-details-route, http-client-module
    CartComponent
// #docregion product-details-route, http-client-module
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
