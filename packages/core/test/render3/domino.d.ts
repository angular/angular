/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare module 'domino' {
  function createWindow(html: string, url: string): Window;
  const impl: {Element: any};
}
