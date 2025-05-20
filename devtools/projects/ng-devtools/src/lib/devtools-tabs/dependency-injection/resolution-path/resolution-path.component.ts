/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input} from '@angular/core';
import {SerializedInjector} from '../../../../../../protocol';

export const NODE_TYPE_CLASS_MAP: {[key in SerializedInjector['type']]: string} = {
  'element': 'type-element',
  'environment': 'type-env',
  'imported-module': 'type-imported',
  'null': 'type-null',
  'hidden': 'type-hidden',
};

@Component({
  selector: 'ng-resolution-path',
  templateUrl: './resolution-path.component.html',
  styleUrl: './resolution-path.component.scss',
})
export class ResolutionPathComponent {
  readonly path = input<SerializedInjector[]>([]);
  readonly reversedPath = computed(() => this.path().slice().reverse());

  NODE_TYPE_CLASS_MAP = NODE_TYPE_CLASS_MAP;
}
