/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {throwError} from '../../util/assert';
import {getComponentDef} from '../definition';
import {ComponentDef} from '../interfaces/definition';
import {CONTEXT, DECLARATION_COMPONENT_VIEW, LView} from '../interfaces/view';


/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode and also it relies on the constructor function being available.
 *
 * Gets a reference to the host component def (where a current component is declared).
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
function getDeclarationComponentDef(lView: LView): ComponentDef<unknown>|null {
  !ngDevMode && throwError('Must never be called in production mode');

  const declarationLView = lView[DECLARATION_COMPONENT_VIEW] as LView;
  const context = declarationLView[CONTEXT];

  // Unable to obtain a context.
  if (!context) return null;

  return context.constructor ? getComponentDef(context.constructor) : null;
}

/**
 * WARNING: this is a **dev-mode only** function (thus should always be guarded by the `ngDevMode`)
 * and must **not** be used in production bundles. The function makes megamorphic reads, which might
 * be too slow for production mode.
 *
 * Constructs a string describing the location of the host component template. The function is used
 * in dev mode to produce error messages.
 *
 * @param lView An `LView` that represents a current component that is being rendered.
 */
export function getTemplateLocationDetails(lView: LView): string {
  !ngDevMode && throwError('Must never be called in production mode');

  const hostComponentDef = getDeclarationComponentDef(lView);
  const componentClassName = hostComponentDef?.type?.name;
  return componentClassName ? ` (used in the '${componentClassName}' component template)` : '';
}
