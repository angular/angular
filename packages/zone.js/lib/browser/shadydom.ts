/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('shadydom', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  // https://github.com/angular/zone.js/issues/782
  // in web components, shadydom will patch addEventListener/removeEventListener of
  // Node.prototype and WindowPrototype, this will have conflict with zone.js
  // so zone.js need to patch them again.
  const windowPrototype = Object.getPrototypeOf(window);
  if (windowPrototype && windowPrototype.hasOwnProperty('addEventListener')) {
    (windowPrototype as any)[Zone.__symbol__('addEventListener')] = null;
    (windowPrototype as any)[Zone.__symbol__('removeEventListener')] = null;
    api.patchEventTarget(global, [windowPrototype]);
  }
  if (Node.prototype.hasOwnProperty('addEventListener')) {
    (Node.prototype as any)[Zone.__symbol__('addEventListener')] = null;
    (Node.prototype as any)[Zone.__symbol__('removeEventListener')] = null;
    api.patchEventTarget(global, [Node.prototype]);
  }
});
