/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const safeElement = {
  async setInnerHtml(element: Element, content: string) {
    element.innerHTML = content;
  },
};

export const testonlyHtml = (content: string) => content;
