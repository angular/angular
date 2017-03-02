/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from '../common/test_helpers';

export function nodes(html: string) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return Array.prototype.slice.call(div.childNodes);
}
