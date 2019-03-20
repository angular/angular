// #docplaster
// #docregion routing
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
// #enddocregion routing
// #docregion http-client-module
import { HttpClientModule } from '@angular/common/http';
// #enddocregion http-client-module
// #docregion reactive-forms-module
import { ReactiveFormsModule } from '@angular/forms';
// #enddocregion reactive-forms-module

// #docregion routing
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductPreviewComponent } from './products/product-preview/product-preview.component';
import { ProductDetailsComponent } from './products/product-details/product-details.component';

// #docregion http-client-module-imports, reactive-forms-module-imports
@NgModule({
  imports: [
// #enddocregion http-client-module-imports, reactive-forms-module-imports
    BrowserModule,
    // #docregion product-list-route, product-details-route
    RouterModule.forRoot([
      // #enddocregion product-list-route
      { path: 'products/:productId', component: ProductDetailsComponent },
      // #docregion product-list-route
      { path: '', component: ProductListComponent },
    ]),
    // #enddocregion product-list-route, product-details-route, routing
    // #docregion http-client-module-imports, reactive-forms-module-imports
    // Other imports ...
    // #enddocregion reactive-forms-module-imports
    HttpClientModule,
    // #enddocregion http-client-module-imports
// #docregion reactive-forms-module-imports, routing
    ReactiveFormsModule,
// #docregion http-client-module-imports
  ],
// #enddocregion http-client-module-imports, reactive-forms-module-imports
  declarations: [
    AppComponent,
    TopBarComponent,
    SideNavComponent,
    ProductListComponent,
    ProductPreviewComponent,
    ProductDetailsComponent,
  ],
  bootstrap: [AppComponent],
})
// #docregion http-client-module-imports, reactive-forms-module-imports
export class AppModule { }
// #enddocregion http-client-module-imports, reactive-forms-module-imports, routing
