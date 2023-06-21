/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {hyphenate} from '../../../../render3/view/style_parser';
import {OpKind} from '../../ir';
import {ComponentCompilation} from '../compilation';

/**
 * Normalizes the property name for style properties. The following normalizations are performed:
 * - Convert style property names (other than CSS vars) to hyphenated (e.g. `backgroundColor` to
 *   `background-color`)
 * - Strip `!important` from the end of class and style properties
 */
export function phasePropertyNameNormalization(cpl: ComponentCompilation) {
  for (const [, view] of cpl.views) {
    for (const op of view.update) {
      if (op.kind === OpKind.StyleProp || op.kind === OpKind.InterpolateStyleProp) {
        op.name = normalizeStylePropName(op.name);
      } else if (op.kind === OpKind.ClassProp) {
        op.name = stripImportant(op.name);
      }
    }
  }
}

/**
 * Normalizes a style prop name by hyphenating it and stripping `!important`.
 */
function normalizeStylePropName(name: string) {
  if (!name.startsWith('--')) {
    name = hyphenate(name);
  }
  return stripImportant(name);
}

/**
 * Strips `!important` out of the op name.
 */
function stripImportant(name: string) {
  // TODO: should we be doing this? The information seems to just be discarded.
  //  It also strips !important from cases like [style.!important] and
  //  [style.color!important-other-stuff], which is kind of strange.
  const importantIndex = name.indexOf('!important');
  if (importantIndex > -1) {
    return name.substring(0, importantIndex);
  }
  return name;
}
