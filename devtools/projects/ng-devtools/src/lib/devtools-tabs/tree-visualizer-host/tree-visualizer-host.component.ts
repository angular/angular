/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ElementRef, viewChild} from '@angular/core';

@Component({
  selector: 'ng-tree-visualizer-host',
  template: `
    <svg #container>
      <g #group></g>
    </svg>
  `,
  styleUrl: 'tree-visualizer-host.component.scss',
})
export class TreeVisualizerHostComponent {
  readonly container = viewChild.required<ElementRef>('container');
  readonly group = viewChild.required<ElementRef>('group');
}
