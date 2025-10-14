/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../output/output_ast';
import { CssSelector } from '../../directive_matching';
import * as t from '../r3_ast';
/**
 * Checks whether an object key contains potentially unsafe chars, thus the key should be wrapped in
 * quotes. Note: we do not wrap all keys into quotes, as it may have impact on minification and may
 * not work in some cases when object keys are mangled by a minifier.
 *
 * TODO(FW-1136): this is a temporary solution, we need to come up with a better way of working with
 * inputs that contain potentially unsafe chars.
 */
export declare const UNSAFE_OBJECT_KEY_NAME_REGEXP: RegExp;
/** Name of the temporary to use during data binding */
export declare const TEMPORARY_NAME = "_t";
/** Name of the context parameter passed into a template function */
export declare const CONTEXT_NAME = "ctx";
/** Name of the RenderFlag passed into a template function */
export declare const RENDER_FLAGS = "rf";
/**
 * Creates an allocator for a temporary variable.
 *
 * A variable declaration is added to the statements the first time the allocator is invoked.
 */
export declare function temporaryAllocator(pushStatement: (st: o.Statement) => void, name: string): () => o.ReadVarExpr;
export declare function invalid<T>(this: t.Visitor, arg: o.Expression | o.Statement | t.Node): never;
export declare function asLiteral(value: any): o.Expression;
/**
 * Serializes inputs and outputs for `defineDirective` and `defineComponent`.
 *
 * This will attempt to generate optimized data structures to minimize memory or
 * file size of fully compiled applications.
 */
export declare function conditionallyCreateDirectiveBindingLiteral(map: Record<string, string | {
    classPropertyName: string;
    bindingPropertyName: string;
    transformFunction: o.Expression | null;
    isSignal: boolean;
}>, forInputs?: boolean): o.Expression | null;
/**
 * A representation for an object literal used during codegen of definition objects. The generic
 * type `T` allows to reference a documented type of the generated structure, such that the
 * property names that are set can be resolved to their documented declaration.
 */
export declare class DefinitionMap<T = any> {
    values: {
        key: string;
        quoted: boolean;
        value: o.Expression;
    }[];
    set(key: keyof T, value: o.Expression | null): void;
    toLiteralMap(): o.LiteralMapExpr;
}
/**
 * Creates a `CssSelector` from an AST node.
 */
export declare function createCssSelectorFromNode(node: t.Element | t.Template): CssSelector;
