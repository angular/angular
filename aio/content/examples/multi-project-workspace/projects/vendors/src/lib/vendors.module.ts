import { NgModule } from '@angular/core';
import { VendorsComponent } from './vendors.component';
import { MyComponent2Component } from './my-component2/my-component2.component';



@NgModule({
  declarations: [VendorsComponent, MyComponent2Component],
  imports: [
  ],
  exports: [VendorsComponent]
})
export class VendorsModule { }
