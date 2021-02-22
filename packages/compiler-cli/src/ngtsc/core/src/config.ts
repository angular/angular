/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file exists as a target for g3 patches which change the Angular compiler's behavior.
// Separating the patched code in a separate file eliminates the possibility of conflicts with the
// patch diffs when making changes to the rest of the compiler codebase.

// In ngtsc we no longer want to compile undecorated classes with Angular features.
// Migrations for these patterns ran as part of `ng update` and we want to ensure
// that projects do not regress. See https://hackmd.io/@alx/ryfYYuvzH for more details.
export const compileUndecoratedClassesWithAngularFeatures = false;
