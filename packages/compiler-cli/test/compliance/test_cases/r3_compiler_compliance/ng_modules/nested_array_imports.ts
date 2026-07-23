import {NgModule} from '@angular/core';

@NgModule({})
export class ModA {}

@NgModule({})
export class ModB {}

export const GROUP = [ModA, ModB];

// A nested-array import element and a referenced-constant import element. The compiler emits the
// injector `imports` preserving these composite elements.
@NgModule({
  imports: [[ModA, ModB], GROUP],
})
export class NestedModule {}
