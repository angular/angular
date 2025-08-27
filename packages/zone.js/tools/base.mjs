/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Add 'use strict' to the bundle, https://github.com/angular/angular/pull/40456
const banner = `'use strict';
/**
 * @license Angular
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */`;

export default {
  banner: {
    js: banner,
  },
  legalComments: 'none',
  plugins: [],
};
