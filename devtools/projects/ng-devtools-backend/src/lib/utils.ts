/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const runOutsideAngular = (f: () => any): void => {
  const w = window as any;
  if (!w.Zone || !w.Zone.current) {
    f();
    return;
  }
  if (w.Zone.current._name !== 'angular') {
    w.Zone.current.run(f);
    return;
  }
  const parent = w.Zone.current._parent;
  if (parent && parent.run) {
    parent.run(f);
    return;
  }
  f();
};

export const isCustomElement = (node: Node) => {
  if (typeof customElements === 'undefined') {
    return false;
  }
  if (!(node instanceof HTMLElement)) {
    return false;
  }
  const tagName = node.tagName.toLowerCase();
  return !!customElements.get(tagName);
};
