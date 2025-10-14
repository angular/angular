/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Instruction that returns the component instance in which the current instruction is executing.
 * This is a constant-time version of `nextContent` for the case where we know that we need the
 * component instance specifically, rather than the context of a particular template.
 *
 * @codeGenApi
 */
export declare function ɵɵcomponentInstance(): unknown;
