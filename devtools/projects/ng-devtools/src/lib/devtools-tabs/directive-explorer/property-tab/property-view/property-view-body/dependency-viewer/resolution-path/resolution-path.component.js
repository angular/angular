/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
export const NODE_TYPE_CLASS_MAP = {
  'element': 'type-element',
  'environment': 'type-env',
  'imported-module': 'type-imported',
  'null': 'type-null',
  'hidden': 'type-hidden',
};
let ResolutionPathComponent = class ResolutionPathComponent {
  constructor() {
    this.path = input([]);
    this.reversedPath = computed(() => this.path().slice().reverse());
    this.NODE_TYPE_CLASS_MAP = NODE_TYPE_CLASS_MAP;
  }
};
ResolutionPathComponent = __decorate(
  [
    Component({
      selector: 'ng-resolution-path',
      templateUrl: './resolution-path.component.html',
      styleUrl: './resolution-path.component.scss',
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  ResolutionPathComponent,
);
export {ResolutionPathComponent};
//# sourceMappingURL=resolution-path.component.js.map
