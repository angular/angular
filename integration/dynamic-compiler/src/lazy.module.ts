import {NgModule} from "@angular/core";
import {Component} from '@angular/core';

@Component({
  selector: 'lazy-component',
  template: 'Lazy-loaded component!',
  jit: true
})
export class LazyComponent {
  constructor() {
  }
}

@NgModule({
  declarations: [LazyComponent],
  jit: true,
})
export class LazyModule {
}
