/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';

let instanceIdx = 0;

@Component({
  selector: 'ng-tree-visualizer-host',
  template: `
    <svg
      #container
      [class.panning]="panning()"
      (pointerdown)="panning.set(true)"
      (pointerup)="panning.set(false)"
      [attr.aria-labelledby]="a11yTitleId"
    >
      <title [id]="a11yTitleId">{{ this.a11yTitle() }}</title>
      <g #group></g>
    </svg>
  `,
  styleUrl: 'tree-visualizer-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeVisualizerHostComponent {
  readonly container = viewChild.required<ElementRef>('container');
  readonly group = viewChild.required<ElementRef>('group');
  protected readonly a11yTitle = input.required<string>();
  protected readonly a11yTitleId = `tree-vis-host-${++instanceIdx}`;

  panning = signal<boolean>(false);
}
