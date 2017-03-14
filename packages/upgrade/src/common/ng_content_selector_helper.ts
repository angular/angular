/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentInfo} from './component_info';

/**
 * This class gives an extension point between the static and dynamic versions
 * of ngUpgrade:
 * * In the static version (this one) we must specify them manually as part of
 *   the call to `downgradeComponent(...)`.
 * * In the dynamic version (`DynamicNgContentSelectorHelper`) we are able to
 *   ask the compiler for the selectors of a component.
 */
export class NgContentSelectorHelper {
  getNgContentSelectors(info: ComponentInfo): string[] {
    // if no selectors are passed then default to a single "wildcard" selector
    return info.selectors || ['*'];
  }
}
