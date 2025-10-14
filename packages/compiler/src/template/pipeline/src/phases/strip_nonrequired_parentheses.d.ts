/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { CompilationJob } from '../compilation';
/**
 * In most cases we can drop user added parentheses from expressions. However, in some cases
 * parentheses are needed for the expression to be considered valid JavaScript or for Typescript to
 * generate the correct output. This phases strips all parentheses except in the following
 * siturations where they are required:
 *
 * 1. Unary operators in the base of an exponentiation expression. For example, `-2 ** 3` is not
 *    valid JavaScript, but `(-2) ** 3` is.
 *
 * 2. When mixing nullish coalescing (`??`) and logical and/or operators (`&&`, `||`), we need
 *    parentheses. For example, `a ?? b && c` is not valid JavaScript, but `a ?? (b && c)` is.
 *    Note: Because of the outcome of https://github.com/microsoft/TypeScript/issues/62307
 *    We need (for now) to keep parentheses around the `??` operator when it is used with and/or operators.
 *    For example, `a ?? b && c` is not valid JavaScript, but `(a ?? b) && c` is.
 *
 * 3. Ternary expression used as an operand for nullish coalescing. Typescript generates incorrect
 *    code if the parentheses are missing. For example when `(a ? b : c) ?? d` is translated to
 *    typescript AST, the parentheses node is removed, and then the remaining AST is printed, it
 *    incorrectly prints `a ? b : c ?? d`. This is different from how it handles the same situation
 *    with `||` and `&&` where it prints the parentheses even if they are not present in the AST.
 *    Note: We may be able to remove this case if Typescript resolves the following issue:
 *    https://github.com/microsoft/TypeScript/issues/61369
 */
export declare function stripNonrequiredParentheses(job: CompilationJob): void;
