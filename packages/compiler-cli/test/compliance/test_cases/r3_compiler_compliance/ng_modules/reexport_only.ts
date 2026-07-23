import {NgModule} from '@angular/core';

@NgModule({})
export class ChildModule {}

// `ChildModule` is only exported (never imported). In full mode the compiler still adds it to the
// injector's `imports` so its providers remain available transitively.
@NgModule({
  exports: [ChildModule],
})
export class ParentModule {}
