// #docplaster
// #docregion httpclient
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// #enddocregion httpclient
import { ReactiveFormsModule } from '@angular/forms';

// #docregion httpclient
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductPreviewComponent } from './products/product-preview/product-preview.component';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { CheckoutComponent } from './checkout/checkout.component';

@NgModule({
  imports: [
    BrowserModule,
// #docregion checkout-route
    RouterModule.forRoot([
// #enddocregion checkout-route
      { path: 'products/:productId', component: ProductDetailsComponent },
// #docregion checkout-route
      { path: 'checkout', component: CheckoutComponent },
// #enddocregion checkout-route
      { path: '', component: ProductListComponent },
// #docregion checkout-route
    ]),
// #enddocregion checkout-route
    HttpClientModule,
// #enddocregion httpclient
    ReactiveFormsModule,
// #docregion httpclient
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    SideNavComponent,
    ProductListComponent,
    ProductPreviewComponent,
    ProductDetailsComponent,
    CheckoutComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
