/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {HostBindingCompilationJob} from '../compilation';

const STYLE_DOT = 'style.';
const CLASS_DOT = 'class.';

export function phaseHostStylePropertyParsing(job: HostBindingCompilationJob): void {
  for (const op of job.update) {
    if (op.kind !== ir.OpKind.Binding) {
      continue;
    }

    if (op.name.startsWith(STYLE_DOT)) {
      op.bindingKind = ir.BindingKind.StyleProperty;
      op.name = op.name.substring(STYLE_DOT.length);

      if (isCssCustomProperty(op.name)) {
        op.name = hyphenate(op.name);
      }

      const {property, suffix} = parseProperty(op.name);
      op.name = property;
      op.unit = suffix;
    } else if (op.name.startsWith('style!')) {
      // TODO: do we only transform !important?
      op.name = 'style';
    } else if (op.name.startsWith(CLASS_DOT)) {
      op.bindingKind = ir.BindingKind.ClassName;
      op.name = parseProperty(op.name.substring(CLASS_DOT.length)).property;
    }
  }
}


/**
 * Checks whether property name is a custom CSS property.
 * See: https://www.w3.org/TR/css-variables-1
 */
function isCssCustomProperty(name: string): boolean {
  return name.startsWith('--');
}

function hyphenate(value: string): string {
  return value
      .replace(
          /[a-z][A-Z]/g,
          v => {
            return v.charAt(0) + '-' + v.charAt(1);
          })
      .toLowerCase();
}

function parseProperty(name: string): {property: string, suffix: string|null} {
  const overrideIndex = name.indexOf('!important');
  if (overrideIndex !== -1) {
    name = overrideIndex > 0 ? name.substring(0, overrideIndex) : '';
  }

  let suffix: string|null = null;
  let property = name;
  const unitIndex = name.lastIndexOf('.');
  if (unitIndex > 0) {
    suffix = name.slice(unitIndex + 1);
    property = name.substring(0, unitIndex);
  }

  return {property, suffix};
}
