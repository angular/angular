/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from './output/output_ast';
/**
 * A constant pool allows a code emitter to share constant in an output context.
 *
 * The constant pool also supports sharing access to ivy definitions references.
 */
export declare class ConstantPool {
    private readonly isClosureCompilerEnabled;
    statements: o.Statement[];
    private literals;
    private literalFactories;
    private sharedConstants;
    /**
     * Constant pool also tracks claimed names from {@link uniqueName}.
     * This is useful to avoid collisions if variables are intended to be
     * named a certain way- but may conflict. We wouldn't want to always suffix
     * them with unique numbers.
     */
    private _claimedNames;
    private nextNameIndex;
    constructor(isClosureCompilerEnabled?: boolean);
    getConstLiteral(literal: o.Expression, forceShared?: boolean): o.Expression;
    getSharedConstant(def: SharedConstantDefinition, expr: o.Expression): o.Expression;
    getLiteralFactory(literal: o.LiteralArrayExpr | o.LiteralMapExpr): {
        literalFactory: o.Expression;
        literalFactoryArguments: o.Expression[];
    };
    getSharedFunctionReference(fn: o.Expression, prefix: string, useUniqueName?: boolean): o.Expression;
    private _getLiteralFactory;
    /**
     * Produce a unique name in the context of this pool.
     *
     * The name might be unique among different prefixes if any of the prefixes end in
     * a digit so the prefix should be a constant string (not based on user input) and
     * must not end in a digit.
     */
    uniqueName(name: string, alwaysIncludeSuffix?: boolean): string;
    private freshName;
}
export interface ExpressionKeyFn {
    keyOf(expr: o.Expression): string;
}
export interface SharedConstantDefinition extends ExpressionKeyFn {
    toSharedConstantDeclaration(declName: string, keyExpr: o.Expression): o.Statement;
}
export declare class GenericKeyFn implements ExpressionKeyFn {
    static readonly INSTANCE: GenericKeyFn;
    keyOf(expr: o.Expression): string;
}
