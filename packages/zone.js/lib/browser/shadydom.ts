/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('shadydom', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  // https://github.com/angular/zone.js/issues/782
  // in web components, shadydom will patch addEventListener/removeEventListener of
  // Node.prototype and WindowPrototype, this will have conflict with zone.js
  // so zone.js need to patch them again.
  const HTMLSlotElement = global.HTMLSlotElement;
  const prototypes = [
    Object.getPrototypeOf(window), Node.prototype, Text.prototype, Element.prototype,
    HTMLElement.prototype, HTMLSlotElement && HTMLSlotElement.prototype, DocumentFragment.prototype,
    Document.prototype
  ];
  prototypes.forEach(function(proto) {
    if (proto && proto.hasOwnProperty('addEventListener')) {
      proto[Zone.__symbol__('addEventListener')] = null;
      proto[Zone.__symbol__('removeEventListener')] = null;
      api.patchEventTarget(global, [proto]);
    }
  });
});
