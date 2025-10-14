/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ConstantPool } from '../../constant_pool';
import * as o from '../../output/output_ast';
import { ParseError, ParseSourceSpan } from '../../parse_util';
import { BindingParser } from '../../template_parser/binding_parser';
import { R3CompiledExpression } from '../util';
import { R3ComponentMetadata, R3DeferResolverFunctionMetadata, R3DirectiveMetadata, R3TemplateDependency } from './api';
/**
 * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
 */
export declare function compileDirectiveFromMetadata(meta: R3DirectiveMetadata, constantPool: ConstantPool, bindingParser: BindingParser): R3CompiledExpression;
/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export declare function compileComponentFromMetadata(meta: R3ComponentMetadata<R3TemplateDependency>, constantPool: ConstantPool, bindingParser: BindingParser): R3CompiledExpression;
/**
 * Creates the type specification from the component meta. This type is inserted into .d.ts files
 * to be consumed by upstream compilations.
 */
export declare function createComponentType(meta: R3ComponentMetadata<R3TemplateDependency>): o.Type;
/**
 * Creates the type specification from the directive meta. This type is inserted into .d.ts files
 * to be consumed by upstream compilations.
 */
export declare function createDirectiveType(meta: R3DirectiveMetadata): o.Type;
export interface ParsedHostBindings {
    attributes: {
        [key: string]: o.Expression;
    };
    listeners: {
        [key: string]: string;
    };
    properties: {
        [key: string]: string;
    };
    specialAttributes: {
        styleAttr?: string;
        classAttr?: string;
    };
}
export declare function parseHostBindings(host: {
    [key: string]: string | o.Expression;
}): ParsedHostBindings;
/**
 * Verifies host bindings and returns the list of errors (if any). Empty array indicates that a
 * given set of host bindings has no errors.
 *
 * @param bindings set of host bindings to verify.
 * @param sourceSpan source span where host bindings were defined.
 * @returns array of errors associated with a given set of host bindings.
 */
export declare function verifyHostBindings(bindings: ParsedHostBindings, sourceSpan: ParseSourceSpan): ParseError[];
/**
 * Encapsulates a CSS stylesheet with emulated view encapsulation.
 * This allows a stylesheet to be used with an Angular component that
 * is using the `ViewEncapsulation.Emulated` mode.
 *
 * @param style The content of a CSS stylesheet.
 * @param componentIdentifier The identifier to use within the CSS rules.
 * @returns The encapsulated content for the style.
 */
export declare function encapsulateStyle(style: string, componentIdentifier?: string): string;
/**
 * Converts an input/output mapping object literal into an array where the even keys are the
 * public name of the binding and the odd ones are the name it was aliased to. E.g.
 * `{inputOne: 'aliasOne', inputTwo: 'aliasTwo'}` will become
 * `['inputOne', 'aliasOne', 'inputTwo', 'aliasTwo']`.
 *
 * This conversion is necessary, because hosts bind to the public name of the host directive and
 * keeping the mapping in an object literal will break for apps using property renaming.
 */
export declare function createHostDirectivesMappingArray(mapping: Record<string, string>): o.LiteralArrayExpr | null;
/**
 * Compiles the dependency resolver function for a defer block.
 */
export declare function compileDeferResolverFunction(meta: R3DeferResolverFunctionMetadata): o.ArrowFunctionExpr;
