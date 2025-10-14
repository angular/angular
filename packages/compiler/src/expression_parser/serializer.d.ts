/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as expr from './ast';
/** Serializes the given AST into a normalized string format. */
export declare function serialize(expression: expr.ASTWithSource): string;
