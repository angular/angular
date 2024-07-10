/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// CommonJS / Node have global context exposed as "global" variable.
// This code should run in a Browser, so we don't want to include the whole node.d.ts
// typings for this compilation unit.
// We'll just fake the global "global" var for now.
declare var global: NodeJS.Global;
