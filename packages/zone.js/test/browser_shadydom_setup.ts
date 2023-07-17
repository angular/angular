/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function initAddEventListeners() {
  const HTMLSlotElement = (window as any).HTMLSlotElement;
  const prototypes = [
    Object.getPrototypeOf(window), Node.prototype, Text.prototype, Element.prototype,
    Object.getPrototypeOf(window), HTMLElement.prototype,
    HTMLSlotElement && HTMLSlotElement.prototype, DocumentFragment.prototype, Document.prototype
  ];
  prototypes.forEach(proto => {
    proto.addEventListener = function(eventName: string, callback: any) {
      this.callback = callback;
    };
    proto.dispatchEvent = function(event: any) {
      this.callback && this.callback.call(this, event);
    };
  });
}

initAddEventListeners();
