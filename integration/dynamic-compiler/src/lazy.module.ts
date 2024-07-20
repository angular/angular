import {NgModule, Component} from '@angular/core';

@Component({
  selector: 'lazy-component',
  template: 'Lazy-loaded component!',
  jit: true,
})
export class LazyComponent {}

@NgModule({
  declarations: [LazyComponent],
  jit: true,
})
export class LazyModule {}
