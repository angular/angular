import {NgModule, Component} from '@angular/core';

@Component({
  selector: 'lazy-component',
  template: 'Lazy-loaded component!',
  jit: true,
  standalone: false,
})
export class LazyComponent {}

@NgModule({
  declarations: [LazyComponent],
  jit: true,
})
export class LazyModule {}
