/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// File contains the enums used across whole application.

// The enum with the prefixes of the main routes
export enum PagePrefix {
  API = 'api',
  CLI = 'cli',
  DOCS = 'docs',
  HOME = '',
  PLAYGROUND = 'playground',
  REFERENCE = 'reference',
  TUTORIALS = 'tutorials',
  UPDATE = 'update-guide',
}

// The enum with the default pages for each main tab
export enum DefaultPage {
  DOCS = 'overview',
  REFERENCE = 'api',
  TUTORIALS = 'tutorials',
  PLAYGROUND = 'playground',
  UPDATE = 'update-guide',
}
