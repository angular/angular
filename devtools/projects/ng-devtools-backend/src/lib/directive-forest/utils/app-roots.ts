/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Returns all app roots. */
export function getAppRoots(): Element[] {
  const roots = Array.from(document.documentElement.querySelectorAll('[ng-version]'));

  const isTopLevel = (element: Element) => {
    let parent: Element | null = element;

    while (parent?.parentElement) {
      parent = parent.parentElement;
      if (parent.hasAttribute('ng-version')) {
        return false;
      }
    }

    return true;
  };

  return roots.filter(isTopLevel);
}
