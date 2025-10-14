/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FactoryTarget } from '../compiler_facade_interface';
import * as o from '../output/output_ast';
import { R3CompiledExpression, R3Reference } from './util';
/**
 * Metadata required by the factory generator to generate a `factory` function for a type.
 */
export interface R3ConstructorFactoryMetadata {
    /**
     * String name of the type being generated (used to name the factory function).
     */
    name: string;
    /**
     * An expression representing the interface type being constructed.
     */
    type: R3Reference;
    /** Number of arguments for the `type`. */
    typeArgumentCount: number;
    /**
     * Regardless of whether `fnOrClass` is a constructor function or a user-defined factory, it
     * may have 0 or more parameters, which will be injected according to the `R3DependencyMetadata`
     * for those parameters. If this is `null`, then the type's constructor is nonexistent and will
     * be inherited from `fnOrClass` which is interpreted as the current type. If this is `'invalid'`,
     * then one or more of the parameters wasn't resolvable and any attempt to use these deps will
     * result in a runtime error.
     */
    deps: R3DependencyMetadata[] | 'invalid' | null;
    /**
     * Type of the target being created by the factory.
     */
    target: FactoryTarget;
}
export declare enum R3FactoryDelegateType {
    Class = 0,
    Function = 1
}
export interface R3DelegatedFnOrClassMetadata extends R3ConstructorFactoryMetadata {
    delegate: o.Expression;
    delegateType: R3FactoryDelegateType;
    delegateDeps: R3DependencyMetadata[];
}
export interface R3ExpressionFactoryMetadata extends R3ConstructorFactoryMetadata {
    expression: o.Expression;
}
export type R3FactoryMetadata = R3ConstructorFactoryMetadata | R3DelegatedFnOrClassMetadata | R3ExpressionFactoryMetadata;
export interface R3DependencyMetadata {
    /**
     * An expression representing the token or value to be injected.
     * Or `null` if the dependency could not be resolved - making it invalid.
     */
    token: o.Expression | null;
    /**
     * If an @Attribute decorator is present, this is the literal type of the attribute name, or
     * the unknown type if no literal type is available (e.g. the attribute name is an expression).
     * Otherwise it is null;
     */
    attributeNameType: o.Expression | null;
    /**
     * Whether the dependency has an @Host qualifier.
     */
    host: boolean;
    /**
     * Whether the dependency has an @Optional qualifier.
     */
    optional: boolean;
    /**
     * Whether the dependency has an @Self qualifier.
     */
    self: boolean;
    /**
     * Whether the dependency has an @SkipSelf qualifier.
     */
    skipSelf: boolean;
}
/**
 * Construct a factory function expression for the given `R3FactoryMetadata`.
 */
export declare function compileFactoryFunction(meta: R3FactoryMetadata): R3CompiledExpression;
export declare function createFactoryType(meta: R3FactoryMetadata): o.ExpressionType;
export declare function isDelegatedFactoryMetadata(meta: R3FactoryMetadata): meta is R3DelegatedFnOrClassMetadata;
export declare function isExpressionFactoryMetadata(meta: R3FactoryMetadata): meta is R3ExpressionFactoryMetadata;
