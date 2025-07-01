/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, ElementRef, input, signal, viewChild} from '@angular/core';

@Component({
  selector: 'ng-tree-visualizer-host',
  template: `
    <svg
      #container
      [class.panning]="panning()"
      (pointerdown)="panning.set(true)"
      (pointerup)="panning.set(false)"
      [attr.aria-labelledby]="ariaTitleId()"
    >
      <title [id]="ariaTitleId()">{{ this.ariaTitle() }}</title>
      <g #group></g>
    </svg>
  `,
  styleUrl: 'tree-visualizer-host.component.scss',
})
export class TreeVisualizerHostComponent {
  readonly container = viewChild.required<ElementRef>('container');
  readonly group = viewChild.required<ElementRef>('group');
  protected readonly ariaTitle = input.required<string>();
  protected readonly ariaTitleId = computed(() =>
    this.ariaTitle().toLowerCase().replace(/\s/g, '-'),
  );

  panning = signal<boolean>(false);
}
