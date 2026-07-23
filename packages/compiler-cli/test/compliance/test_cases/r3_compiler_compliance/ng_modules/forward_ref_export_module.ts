import {forwardRef, NgModule} from '@angular/core';

@NgModule({})
export class BarModule {}

@NgModule({
  exports: [forwardRef(() => BarModule)],
})
export class FooModule {}
