// #docplaster
// #docregion as-generated
import { NgModule } from '@angular/core';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductAlertsComponent } from './product-alerts/product-alerts.component';
// #enddocregion as-generated

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot([{ path: '', component: ProductListComponent }])
  ],
// #docregion as-generated
  declarations: [
// #enddocregion as-generated
    AppComponent,
    TopBarComponent,
    ProductListComponent,
// #docregion as-generated
    ProductAlertsComponent
  ],
// #enddocregion as-generated
  bootstrap: [AppComponent]
})
export class AppModule {}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at https://angular.io/license
*/
