/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../output/output_ast';
import * as ir from '../ir';
export declare const BINARY_OPERATORS: Map<string, o.BinaryOperator>;
export declare function namespaceForKey(namespacePrefixKey: string | null): ir.Namespace;
export declare function keyForNamespace(namespace: ir.Namespace): string | null;
export declare function prefixWithNamespace(strippedTag: string, namespace: ir.Namespace): string;
export type LiteralType = string | number | boolean | null | Array<LiteralType>;
export declare function literalOrArrayLiteral(value: LiteralType): o.Expression;
