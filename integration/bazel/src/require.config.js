/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file adds extra configuration for RequireJS in the
// devserver. For external libs, such as @ngrx, that ship with
// unamed AMD modules, RequireJS needs to be configured so that
// it can load the approriate script from the server for the
// external instead of having that script included in the bundle.
//
// For example, we configure RequireJS to load /store.umd.min.js
// from the server when it encounters require('@ngrx/store').
require.config({paths: {
  'rxjs': 'rxjs.umd',
  'rxjs/operators': 'rxjs_operators_shim',
}});
