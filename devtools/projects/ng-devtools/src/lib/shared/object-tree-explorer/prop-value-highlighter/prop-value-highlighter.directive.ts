/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Directive, input} from '@angular/core';
import {Property} from '../object-tree-types';
import {PropType} from '../../../../../../protocol';

/** Should be used in conjunction with prop-value-highlighter.scss */
@Directive({
  selector: '[ngPropValueHighlighter]',
  host: {
    '[class]': 'typeClass()',
  },
})
export class PropValueHighlighterDirective {
  protected readonly ngPropValueHighlighter = input.required<Property>();

  protected readonly typeClass = computed<string>(() => {
    const prop = this.ngPropValueHighlighter();

    // Containers and class getters can have types.
    // Since their preview differs, we don't want to
    // use the specific value type highlighting.
    if (prop.descriptor.containerType !== null || prop.descriptor.preview === '(...)') {
      return 'type-default';
    }

    switch (prop.descriptor.type) {
      case PropType.Number:
      case PropType.Boolean:
        return 'type-scalar';
      case PropType.String:
        return 'type-string';
      case PropType.Null:
      case PropType.Undefined:
        return 'type-nullish';
      case PropType.BigInt:
      case PropType.Date:
      case PropType.Set:
      case PropType.Map:
      case PropType.Symbol:
      case PropType.HTMLNode:
        return 'type-object-based';
      default:
        return 'type-default';
    }
  });
}
