/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, computed, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
const URLS = {
  'change-detection': 'https://angular.dev/api/core/ChangeDetectionStrategy',
  'view-encapsulation': 'https://angular.dev/api/core/ViewEncapsulation',
  'dependency-injection': 'https://angular.dev/guide/di',
  'injector-hierarchies':
    'https://angular.dev/guide/di/hierarchical-dependency-injection#types-of-injector-hierarchies',
};
let DocsRefButtonComponent = class DocsRefButtonComponent {
  constructor() {
    this.docs = input.required();
    this.url = computed(() => URLS[this.docs()]);
  }
};
DocsRefButtonComponent = __decorate(
  [
    Component({
      selector: 'ng-docs-ref-button',
      templateUrl: './docs-ref-button.component.html',
      styleUrl: './docs-ref-button.component.scss',
      imports: [MatIcon, MatTooltip],
    }),
  ],
  DocsRefButtonComponent,
);
export {DocsRefButtonComponent};
//# sourceMappingURL=docs-ref-button.component.js.map
