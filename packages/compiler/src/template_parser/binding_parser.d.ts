/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SecurityContext } from '../core';
import { ASTWithSource, BoundElementProperty, ParsedEvent, ParsedProperty, ParsedVariable } from '../expression_parser/ast';
import { Parser } from '../expression_parser/parser';
import { InterpolationConfig } from '../ml_parser/defaults';
import { InterpolatedAttributeToken, InterpolatedTextToken } from '../ml_parser/tokens';
import { ParseError, ParseSourceSpan } from '../parse_util';
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
export interface HostProperties {
    [key: string]: string;
}
export interface HostListeners {
    [key: string]: string;
}
/**
 * Parses bindings in templates and in the directive host area.
 */
export declare class BindingParser {
    private _exprParser;
    private _interpolationConfig;
    private _schemaRegistry;
    errors: ParseError[];
    constructor(_exprParser: Parser, _interpolationConfig: InterpolationConfig, _schemaRegistry: ElementSchemaRegistry, errors: ParseError[]);
    get interpolationConfig(): InterpolationConfig;
    createBoundHostProperties(properties: HostProperties, sourceSpan: ParseSourceSpan): ParsedProperty[] | null;
    createDirectiveHostEventAsts(hostListeners: HostListeners, sourceSpan: ParseSourceSpan): ParsedEvent[] | null;
    parseInterpolation(value: string, sourceSpan: ParseSourceSpan, interpolatedTokens: InterpolatedAttributeToken[] | InterpolatedTextToken[] | null): ASTWithSource;
    /**
     * Similar to `parseInterpolation`, but treats the provided string as a single expression
     * element that would normally appear within the interpolation prefix and suffix (`{{` and `}}`).
     * This is used for parsing the switch expression in ICUs.
     */
    parseInterpolationExpression(expression: string, sourceSpan: ParseSourceSpan): ASTWithSource;
    /**
     * Parses the bindings in a microsyntax expression, and converts them to
     * `ParsedProperty` or `ParsedVariable`.
     *
     * @param tplKey template binding name
     * @param tplValue template binding value
     * @param sourceSpan span of template binding relative to entire the template
     * @param absoluteValueOffset start of the tplValue relative to the entire template
     * @param targetMatchableAttrs potential attributes to match in the template
     * @param targetProps target property bindings in the template
     * @param targetVars target variables in the template
     */
    parseInlineTemplateBinding(tplKey: string, tplValue: string, sourceSpan: ParseSourceSpan, absoluteValueOffset: number, targetMatchableAttrs: string[][], targetProps: ParsedProperty[], targetVars: ParsedVariable[], isIvyAst: boolean): void;
    /**
     * Parses the bindings in a microsyntax expression, e.g.
     * ```html
     *    <tag *tplKey="let value1 = prop; let value2 = localVar">
     * ```
     *
     * @param tplKey template binding name
     * @param tplValue template binding value
     * @param sourceSpan span of template binding relative to entire the template
     * @param absoluteKeyOffset start of the `tplKey`
     * @param absoluteValueOffset start of the `tplValue`
     */
    private _parseTemplateBindings;
    parseLiteralAttr(name: string, value: string | null, sourceSpan: ParseSourceSpan, absoluteOffset: number, valueSpan: ParseSourceSpan | undefined, targetMatchableAttrs: string[][], targetProps: ParsedProperty[], keySpan: ParseSourceSpan): void;
    parsePropertyBinding(name: string, expression: string, isHost: boolean, isPartOfAssignmentBinding: boolean, sourceSpan: ParseSourceSpan, absoluteOffset: number, valueSpan: ParseSourceSpan | undefined, targetMatchableAttrs: string[][], targetProps: ParsedProperty[], keySpan: ParseSourceSpan): void;
    parsePropertyInterpolation(name: string, value: string, sourceSpan: ParseSourceSpan, valueSpan: ParseSourceSpan | undefined, targetMatchableAttrs: string[][], targetProps: ParsedProperty[], keySpan: ParseSourceSpan, interpolatedTokens: InterpolatedAttributeToken[] | InterpolatedTextToken[] | null): boolean;
    private _parsePropertyAst;
    private _parseAnimation;
    private _parseLegacyAnimation;
    parseBinding(value: string, isHostBinding: boolean, sourceSpan: ParseSourceSpan, absoluteOffset: number): ASTWithSource;
    createBoundElementProperty(elementSelector: string | null, boundProp: ParsedProperty, skipValidation?: boolean, mapPropertyName?: boolean): BoundElementProperty;
    parseEvent(name: string, expression: string, isAssignmentEvent: boolean, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan, targetMatchableAttrs: string[][], targetEvents: ParsedEvent[], keySpan: ParseSourceSpan): void;
    calcPossibleSecurityContexts(selector: string, propName: string, isAttribute: boolean): SecurityContext[];
    parseEventListenerName(rawName: string): {
        eventName: string;
        target: string | null;
    };
    parseLegacyAnimationEventName(rawName: string): {
        eventName: string;
        phase: string | null;
    };
    private _parseLegacyAnimationEvent;
    private _parseRegularEvent;
    private _parseAction;
    private _reportError;
    /**
     * @param propName the name of the property / attribute
     * @param sourceSpan
     * @param isAttr true when binding to an attribute
     */
    private _validatePropertyOrAttributeName;
    /**
     * Returns whether a parsed AST is allowed to be used within the event side of a two-way binding.
     * @param ast Parsed AST to be checked.
     */
    private _isAllowedAssignmentEvent;
}
export declare function calcPossibleSecurityContexts(registry: ElementSchemaRegistry, selector: string | null, propName: string, isAttribute: boolean): SecurityContext[];
