/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of this package.
 */

// Note: Historically people relied on `platform-browser-dynamic` magically
// exposing the compiler for JIT. This is now made more explicit via this import.
import '@angular/compiler';

export * from './src/platform-browser-dynamic';

// This file only reexports content of the `src` folder. Keep it that way.
