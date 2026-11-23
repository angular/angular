import {Component} from '@angular/core';

@Component({
  selector: 'inlay-hints',
  template: `@for (item of [1, 2, 3]; track item) {
    {{ item }}
  }`,
})
export class InlayHintsComponent {}
