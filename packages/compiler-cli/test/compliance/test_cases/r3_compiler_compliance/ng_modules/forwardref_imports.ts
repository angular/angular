import {forwardRef, NgModule} from '@angular/core';

// `AppModule` references `LaterModule` before it is declared, via `forwardRef`. In full mode the
// compiler resolves the forwardRef and emits the bare module reference in the injector imports.
@NgModule({
  imports: [forwardRef(() => LaterModule)],
})
export class AppModule {}

@NgModule({})
export class LaterModule {}
