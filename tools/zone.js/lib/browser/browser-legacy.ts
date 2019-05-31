/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

import {eventTargetLegacyPatch} from './event-target-legacy';
import {propertyDescriptorLegacyPatch} from './property-descriptor-legacy';
import {registerElementPatch} from './register-element';

(function(_global: any) {
_global[Zone.__symbol__('legacyPatch')] = function() {
  const Zone = _global['Zone'];
  Zone.__load_patch('registerElement', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    registerElementPatch(global, api);
  });

  Zone.__load_patch('EventTargetLegacy', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    eventTargetLegacyPatch(global, api);
    propertyDescriptorLegacyPatch(api, global);
  });
};
})(typeof window !== 'undefined' ?
       window :
       typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});
