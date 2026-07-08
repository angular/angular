/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input} from '@angular/core';

@Component({
  selector: 'app-rendered-text',
  template: '{{ text() }}',
  styles: `
    :host {
      display: block;
      margin: 0 0 0.5rem;
      color: #0f5132;
    }

    :host(.muted) {
      color: #4b5563;
    }

    :host(.danger) {
      color: #842029;
    }
  `,
})
export class RenderedTextComponent {
  readonly text = input.required<string>();
}
