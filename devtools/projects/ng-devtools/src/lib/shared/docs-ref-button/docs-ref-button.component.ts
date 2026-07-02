/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

type Docs =
  | 'view-encapsulation'
  | 'change-detection'
  | 'dependency-injection'
  | 'injector-hierarchies';

const URLS: {[key in Docs]: string} = {
  'change-detection': 'https://angular.dev/api/core/ChangeDetectionStrategy',
  'view-encapsulation': 'https://angular.dev/api/core/ViewEncapsulation',
  'dependency-injection': 'https://angular.dev/guide/di',
  'injector-hierarchies':
    'https://angular.dev/guide/di/hierarchical-dependency-injection#types-of-injector-hierarchies',
};

@Component({
  selector: 'ng-docs-ref-button',
  templateUrl: './docs-ref-button.component.html',
  styleUrl: './docs-ref-button.component.scss',
  imports: [MatIcon, MatTooltip],
})
export class DocsRefButtonComponent {
  protected readonly docs = input.required<Docs>();
  protected readonly url = computed(() => URLS[this.docs()]);
}
