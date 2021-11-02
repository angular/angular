/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveSummary, CompilePipeSummary} from '../compile_metadata';
import {SecurityContext} from '../core';
import {AbsoluteSourceSpan, ASTWithSource, BindingPipe, BindingType, BoundElementProperty, EmptyExpr, ParsedEvent, ParsedEventType, ParsedProperty, ParsedPropertyType, ParsedVariable, ParserError, RecursiveAstVisitor, TemplateBinding, VariableBinding} from '../expression_parser/ast';
import {Parser} from '../expression_parser/parser';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {mergeNsAndName} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseLocation, ParseSourceSpan} from '../parse_util';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {CssSelector} from '../selector';
import {splitAtColon, splitAtPeriod} from '../util';

const PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
const TEMPLATE_ATTR_PREFIX = '*';
const ANIMATE_PROP_PREFIX = 'animate-';

/**
 * Parses bindings in templates and in the directive host area.
 */
export class BindingParser {
  pipesByName: Map<string, CompilePipeSummary>|null = null;

  private _usedPipes: Map<string, CompilePipeSummary> = new Map();

  constructor(
      private _exprParser: Parser, private _interpolationConfig: InterpolationConfig,
      private _schemaRegistry: ElementSchemaRegistry, pipes: CompilePipeSummary[]|null,
      public errors: ParseError[]) {
    // When the `pipes` parameter is `null`, do not check for used pipes
    // This is used in IVY when we might not know the available pipes at compile time
    if (pipes) {
      const pipesByName: Map<string, CompilePipeSummary> = new Map();
      pipes.forEach(pipe => pipesByName.set(pipe.name, pipe));
      this.pipesByName = pipesByName;
    }
  }

  get interpolationConfig(): InterpolationConfig {
    return this._interpolationConfig;
  }

  getUsedPipes(): CompilePipeSummary[] {
    return Array.from(this._usedPipes.values());
  }

  createBoundHostProperties(dirMeta: CompileDirectiveSummary, sourceSpan: ParseSourceSpan):
      ParsedProperty[]|null {
    if (dirMeta.hostProperties) {
      const boundProps: ParsedProperty[] = [];
      Object.keys(dirMeta.hostProperties).forEach(propName => {
        const expression = dirMeta.hostProperties[propName];
        if (typeof expression === 'string') {
          this.parsePropertyBinding(
              propName, expression, true, sourceSpan, sourceSpan.start.offset, undefined, [],
              // Use the `sourceSpan` for  `keySpan`. This isn't really accurate, but neither is the
              // sourceSpan, as it represents the sourceSpan of the host itself rather than the
              // source of the host binding (which doesn't exist in the template). Regardless,
              // neither of these values are used in Ivy but are only here to satisfy the function
              // signature. This should likely be refactored in the future so that `sourceSpan`
              // isn't being used inaccurately.
              boundProps, sourceSpan);
        } else {
          this._reportError(
              `Value of the host property binding "${
                  propName}" needs to be a string representing an expression but got "${
                  expression}" (${typeof expression})`,
              sourceSpan);
        }
      });
      return boundProps;
    }
    return null;
  }

  createDirectiveHostPropertyAsts(
      dirMeta: CompileDirectiveSummary, elementSelector: string,
      sourceSpan: ParseSourceSpan): BoundElementProperty[]|null {
    const boundProps = this.createBoundHostProperties(dirMeta, sourceSpan);
    return boundProps &&
        boundProps.map((prop) => this.createBoundElementProperty(elementSelector, prop));
  }

  createDirectiveHostEventAsts(dirMeta: CompileDirectiveSummary, sourceSpan: ParseSourceSpan):
      ParsedEvent[]|null {
    if (dirMeta.hostListeners) {
      const targetEvents: ParsedEvent[] = [];
      Object.keys(dirMeta.hostListeners).forEach(propName => {
        const expression = dirMeta.hostListeners[propName];
        if (typeof expression === 'string') {
          // Use the `sourceSpan` for  `keySpan` and `handlerSpan`. This isn't really accurate, but
          // neither is the `sourceSpan`, as it represents the `sourceSpan` of the host itself
          // rather than the source of the host binding (which doesn't exist in the template).
          // Regardless, neither of these values are used in Ivy but are only here to satisfy the
          // function signature. This should likely be refactored in the future so that `sourceSpan`
          // isn't being used inaccurately.
          this.parseEvent(
              propName, expression, sourceSpan, sourceSpan, [], targetEvents, sourceSpan);
        } else {
          this._reportError(
              `Value of the host listener "${
                  propName}" needs to be a string representing an expression but got "${
                  expression}" (${typeof expression})`,
              sourceSpan);
        }
      });
      return targetEvents;
    }
    return null;
  }

  parseInterpolation(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();
    const absoluteOffset = sourceSpan.fullStart.offset;

    try {
      const ast = this._exprParser.parseInterpolation(
          value, sourceInfo, absoluteOffset, this._interpolationConfig)!;
      if (ast) this._reportExpressionParserErrors(ast.errors, sourceSpan);
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
    }
  }

  /**
   * Similar to `parseInterpolation`, but treats the provided string as a single expression
   * element that would normally appear within the interpolation prefix and suffix (`{{` and `}}`).
   * This is used for parsing the switch expression in ICUs.
   */
  parseInterpolationExpression(expression: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();
    const absoluteOffset = sourceSpan.start.offset;

    try {
      const ast =
          this._exprParser.parseInterpolationExpression(expression, sourceInfo, absoluteOffset);
      if (ast) this._reportExpressionParserErrors(ast.errors, sourceSpan);
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
    }
  }

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
  parseInlineTemplateBinding(
      tplKey: string, tplValue: string, sourceSpan: ParseSourceSpan, absoluteValueOffset: number,
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[], targetVars: ParsedVariable[],
      isIvyAst: boolean) {
    const absoluteKeyOffset = sourceSpan.start.offset + TEMPLATE_ATTR_PREFIX.length;
    const bindings = this._parseTemplateBindings(
        tplKey, tplValue, sourceSpan, absoluteKeyOffset, absoluteValueOffset);

    for (const binding of bindings) {
      // sourceSpan is for the entire HTML attribute. bindingSpan is for a particular
      // binding within the microsyntax expression so it's more narrow than sourceSpan.
      const bindingSpan = moveParseSourceSpan(sourceSpan, binding.sourceSpan);
      const key = binding.key.source;
      const keySpan = moveParseSourceSpan(sourceSpan, binding.key.span);
      if (binding instanceof VariableBinding) {
        const value = binding.value ? binding.value.source : '$implicit';
        const valueSpan =
            binding.value ? moveParseSourceSpan(sourceSpan, binding.value.span) : undefined;
        targetVars.push(new ParsedVariable(key, value, bindingSpan, keySpan, valueSpan));
      } else if (binding.value) {
        const srcSpan = isIvyAst ? bindingSpan : sourceSpan;
        const valueSpan = moveParseSourceSpan(sourceSpan, binding.value.ast.sourceSpan);
        this._parsePropertyAst(
            key, binding.value, srcSpan, keySpan, valueSpan, targetMatchableAttrs, targetProps);
      } else {
        targetMatchableAttrs.push([key, '' /* value */]);
        // Since this is a literal attribute with no RHS, source span should be
        // just the key span.
        this.parseLiteralAttr(
            key, null /* value */, keySpan, absoluteValueOffset, undefined /* valueSpan */,
            targetMatchableAttrs, targetProps, keySpan);
      }
    }
  }

  /**
   * Parses the bindings in a microsyntax expression, e.g.
   * ```
   *    <tag *tplKey="let value1 = prop; let value2 = localVar">
   * ```
   *
   * @param tplKey template binding name
   * @param tplValue template binding value
   * @param sourceSpan span of template binding relative to entire the template
   * @param absoluteKeyOffset start of the `tplKey`
   * @param absoluteValueOffset start of the `tplValue`
   */
  private _parseTemplateBindings(
      tplKey: string, tplValue: string, sourceSpan: ParseSourceSpan, absoluteKeyOffset: number,
      absoluteValueOffset: number): TemplateBinding[] {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const bindingsResult = this._exprParser.parseTemplateBindings(
          tplKey, tplValue, sourceInfo, absoluteKeyOffset, absoluteValueOffset);
      this._reportExpressionParserErrors(bindingsResult.errors, sourceSpan);
      bindingsResult.templateBindings.forEach((binding) => {
        if (binding.value instanceof ASTWithSource) {
          this._checkPipes(binding.value, sourceSpan);
        }
      });
      bindingsResult.warnings.forEach((warning) => {
        this._reportError(warning, sourceSpan, ParseErrorLevel.WARNING);
      });
      return bindingsResult.templateBindings;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return [];
    }
  }

  parseLiteralAttr(
      name: string, value: string|null, sourceSpan: ParseSourceSpan, absoluteOffset: number,
      valueSpan: ParseSourceSpan|undefined, targetMatchableAttrs: string[][],
      // TODO(atscott): keySpan is only optional here so VE template parser implementation does not
      // have to change This should be required when VE is removed.
      targetProps: ParsedProperty[], keySpan?: ParseSourceSpan) {
    if (isAnimationLabel(name)) {
      name = name.substring(1);
      if (keySpan !== undefined) {
        keySpan = moveParseSourceSpan(
            keySpan, new AbsoluteSourceSpan(keySpan.start.offset + 1, keySpan.end.offset));
      }
      if (value) {
        this._reportError(
            `Assigning animation triggers via @prop="exp" attributes with an expression is invalid.` +
                ` Use property bindings (e.g. [@prop]="exp") or use an attribute without a value (e.g. @prop) instead.`,
            sourceSpan, ParseErrorLevel.ERROR);
      }
      this._parseAnimation(
          name, value, sourceSpan, absoluteOffset, keySpan, valueSpan, targetMatchableAttrs,
          targetProps);
    } else {
      targetProps.push(new ParsedProperty(
          name, this._exprParser.wrapLiteralPrimitive(value, '', absoluteOffset),
          ParsedPropertyType.LITERAL_ATTR, sourceSpan, keySpan, valueSpan));
    }
  }

  parsePropertyBinding(
      name: string, expression: string, isHost: boolean, sourceSpan: ParseSourceSpan,
      absoluteOffset: number, valueSpan: ParseSourceSpan|undefined,
      // TODO(atscott): keySpan is only optional here so VE template parser implementation does not
      // have to change This should be required when VE is removed.
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[], keySpan?: ParseSourceSpan) {
    if (name.length === 0) {
      this._reportError(`Property name is missing in binding`, sourceSpan);
    }

    let isAnimationProp = false;
    if (name.startsWith(ANIMATE_PROP_PREFIX)) {
      isAnimationProp = true;
      name = name.substring(ANIMATE_PROP_PREFIX.length);
      if (keySpan !== undefined) {
        keySpan = moveParseSourceSpan(
            keySpan,
            new AbsoluteSourceSpan(
                keySpan.start.offset + ANIMATE_PROP_PREFIX.length, keySpan.end.offset));
      }
    } else if (isAnimationLabel(name)) {
      isAnimationProp = true;
      name = name.substring(1);
      if (keySpan !== undefined) {
        keySpan = moveParseSourceSpan(
            keySpan, new AbsoluteSourceSpan(keySpan.start.offset + 1, keySpan.end.offset));
      }
    }

    if (isAnimationProp) {
      this._parseAnimation(
          name, expression, sourceSpan, absoluteOffset, keySpan, valueSpan, targetMatchableAttrs,
          targetProps);
    } else {
      this._parsePropertyAst(
          name, this._parseBinding(expression, isHost, valueSpan || sourceSpan, absoluteOffset),
          sourceSpan, keySpan, valueSpan, targetMatchableAttrs, targetProps);
    }
  }

  parsePropertyInterpolation(
      name: string, value: string, sourceSpan: ParseSourceSpan,
      valueSpan: ParseSourceSpan|undefined, targetMatchableAttrs: string[][],
      // TODO(atscott): keySpan is only optional here so VE template parser implementation does not
      // have to change This should be required when VE is removed.
      targetProps: ParsedProperty[], keySpan?: ParseSourceSpan): boolean {
    const expr = this.parseInterpolation(value, valueSpan || sourceSpan);
    if (expr) {
      this._parsePropertyAst(
          name, expr, sourceSpan, keySpan, valueSpan, targetMatchableAttrs, targetProps);
      return true;
    }
    return false;
  }

  private _parsePropertyAst(
      name: string, ast: ASTWithSource, sourceSpan: ParseSourceSpan,
      keySpan: ParseSourceSpan|undefined, valueSpan: ParseSourceSpan|undefined,
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[]) {
    targetMatchableAttrs.push([name, ast.source!]);
    targetProps.push(
        new ParsedProperty(name, ast, ParsedPropertyType.DEFAULT, sourceSpan, keySpan, valueSpan));
  }

  private _parseAnimation(
      name: string, expression: string|null, sourceSpan: ParseSourceSpan, absoluteOffset: number,
      keySpan: ParseSourceSpan|undefined, valueSpan: ParseSourceSpan|undefined,
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[]) {
    if (name.length === 0) {
      this._reportError('Animation trigger is missing', sourceSpan);
    }

    // This will occur when a @trigger is not paired with an expression.
    // For animations it is valid to not have an expression since */void
    // states will be applied by angular when the element is attached/detached
    const ast = this._parseBinding(
        expression || 'undefined', false, valueSpan || sourceSpan, absoluteOffset);
    targetMatchableAttrs.push([name, ast.source!]);
    targetProps.push(new ParsedProperty(
        name, ast, ParsedPropertyType.ANIMATION, sourceSpan, keySpan, valueSpan));
  }

  private _parseBinding(
      value: string, isHostBinding: boolean, sourceSpan: ParseSourceSpan,
      absoluteOffset: number): ASTWithSource {
    const sourceInfo = (sourceSpan && sourceSpan.start || '(unknown)').toString();

    try {
      const ast = isHostBinding ?
          this._exprParser.parseSimpleBinding(
              value, sourceInfo, absoluteOffset, this._interpolationConfig) :
          this._exprParser.parseBinding(
              value, sourceInfo, absoluteOffset, this._interpolationConfig);
      if (ast) this._reportExpressionParserErrors(ast.errors, sourceSpan);
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
    }
  }

  createBoundElementProperty(
      elementSelector: string, boundProp: ParsedProperty, skipValidation: boolean = false,
      mapPropertyName: boolean = true): BoundElementProperty {
    if (boundProp.isAnimation) {
      return new BoundElementProperty(
          boundProp.name, BindingType.Animation, SecurityContext.NONE, boundProp.expression, null,
          boundProp.sourceSpan, boundProp.keySpan, boundProp.valueSpan);
    }

    let unit: string|null = null;
    let bindingType: BindingType = undefined!;
    let boundPropertyName: string|null = null;
    const parts = boundProp.name.split(PROPERTY_PARTS_SEPARATOR);
    let securityContexts: SecurityContext[] = undefined!;

    // Check for special cases (prefix style, attr, class)
    if (parts.length > 1) {
      if (parts[0] == ATTRIBUTE_PREFIX) {
        boundPropertyName = parts.slice(1).join(PROPERTY_PARTS_SEPARATOR);
        if (!skipValidation) {
          this._validatePropertyOrAttributeName(boundPropertyName, boundProp.sourceSpan, true);
        }
        securityContexts = calcPossibleSecurityContexts(
            this._schemaRegistry, elementSelector, boundPropertyName, true);

        const nsSeparatorIdx = boundPropertyName.indexOf(':');
        if (nsSeparatorIdx > -1) {
          const ns = boundPropertyName.substring(0, nsSeparatorIdx);
          const name = boundPropertyName.substring(nsSeparatorIdx + 1);
          boundPropertyName = mergeNsAndName(ns, name);
        }

        bindingType = BindingType.Attribute;
      } else if (parts[0] == CLASS_PREFIX) {
        boundPropertyName = parts[1];
        bindingType = BindingType.Class;
        securityContexts = [SecurityContext.NONE];
      } else if (parts[0] == STYLE_PREFIX) {
        unit = parts.length > 2 ? parts[2] : null;
        boundPropertyName = parts[1];
        bindingType = BindingType.Style;
        securityContexts = [SecurityContext.STYLE];
      }
    }

    // If not a special case, use the full property name
    if (boundPropertyName === null) {
      const mappedPropName = this._schemaRegistry.getMappedPropName(boundProp.name);
      boundPropertyName = mapPropertyName ? mappedPropName : boundProp.name;
      securityContexts = calcPossibleSecurityContexts(
          this._schemaRegistry, elementSelector, mappedPropName, false);
      bindingType = BindingType.Property;
      if (!skipValidation) {
        this._validatePropertyOrAttributeName(mappedPropName, boundProp.sourceSpan, false);
      }
    }

    return new BoundElementProperty(
        boundPropertyName, bindingType, securityContexts[0], boundProp.expression, unit,
        boundProp.sourceSpan, boundProp.keySpan, boundProp.valueSpan);
  }

  // TODO: keySpan should be required but was made optional to avoid changing VE parser.
  parseEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: ParsedEvent[], keySpan?: ParseSourceSpan) {
    if (name.length === 0) {
      this._reportError(`Event name is missing in binding`, sourceSpan);
    }

    if (isAnimationLabel(name)) {
      name = name.substr(1);
      if (keySpan !== undefined) {
        keySpan = moveParseSourceSpan(
            keySpan, new AbsoluteSourceSpan(keySpan.start.offset + 1, keySpan.end.offset));
      }
      this._parseAnimationEvent(name, expression, sourceSpan, handlerSpan, targetEvents, keySpan);
    } else {
      this._parseRegularEvent(
          name, expression, sourceSpan, handlerSpan, targetMatchableAttrs, targetEvents, keySpan);
    }
  }

  calcPossibleSecurityContexts(selector: string, propName: string, isAttribute: boolean):
      SecurityContext[] {
    const prop = this._schemaRegistry.getMappedPropName(propName);
    return calcPossibleSecurityContexts(this._schemaRegistry, selector, prop, isAttribute);
  }

  private _parseAnimationEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan,
      targetEvents: ParsedEvent[], keySpan?: ParseSourceSpan) {
    const matches = splitAtPeriod(name, [name, '']);
    const eventName = matches[0];
    const phase = matches[1].toLowerCase();
    const ast = this._parseAction(expression, handlerSpan);
    targetEvents.push(new ParsedEvent(
        eventName, phase, ParsedEventType.Animation, ast, sourceSpan, handlerSpan, keySpan));

    if (eventName.length === 0) {
      this._reportError(`Animation event name is missing in binding`, sourceSpan);
    }
    if (phase) {
      if (phase !== 'start' && phase !== 'done') {
        this._reportError(
            `The provided animation output phase value "${phase}" for "@${
                eventName}" is not supported (use start or done)`,
            sourceSpan);
      }
    } else {
      this._reportError(
          `The animation trigger output event (@${
              eventName}) is missing its phase value name (start or done are currently supported)`,
          sourceSpan);
    }
  }

  private _parseRegularEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: ParsedEvent[], keySpan?: ParseSourceSpan) {
    // long format: 'target: eventName'
    const [target, eventName] = splitAtColon(name, [null!, name]);
    const ast = this._parseAction(expression, handlerSpan);
    targetMatchableAttrs.push([name!, ast.source!]);
    targetEvents.push(new ParsedEvent(
        eventName, target, ParsedEventType.Regular, ast, sourceSpan, handlerSpan, keySpan));
    // Don't detect directives for event names for now,
    // so don't add the event name to the matchableAttrs
  }

  private _parseAction(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = (sourceSpan && sourceSpan.start || '(unknown').toString();
    const absoluteOffset = (sourceSpan && sourceSpan.start) ? sourceSpan.start.offset : 0;

    try {
      const ast = this._exprParser.parseAction(
          value, sourceInfo, absoluteOffset, this._interpolationConfig);
      if (ast) {
        this._reportExpressionParserErrors(ast.errors, sourceSpan);
      }
      if (!ast || ast.ast instanceof EmptyExpr) {
        this._reportError(`Empty expressions are not allowed`, sourceSpan);
        return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
      }
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo, absoluteOffset);
    }
  }

  private _reportError(
      message: string, sourceSpan: ParseSourceSpan,
      level: ParseErrorLevel = ParseErrorLevel.ERROR) {
    this.errors.push(new ParseError(sourceSpan, message, level));
  }

  private _reportExpressionParserErrors(errors: ParserError[], sourceSpan: ParseSourceSpan) {
    for (const error of errors) {
      this._reportError(error.message, sourceSpan);
    }
  }

  // Make sure all the used pipes are known in `this.pipesByName`
  private _checkPipes(ast: ASTWithSource, sourceSpan: ParseSourceSpan): void {
    if (ast && this.pipesByName) {
      const collector = new PipeCollector();
      ast.visit(collector);
      collector.pipes.forEach((ast, pipeName) => {
        const pipeMeta = this.pipesByName!.get(pipeName);
        if (!pipeMeta) {
          this._reportError(
              `The pipe '${pipeName}' could not be found`,
              new ParseSourceSpan(
                  sourceSpan.start.moveBy(ast.span.start), sourceSpan.start.moveBy(ast.span.end)));
        } else {
          this._usedPipes.set(pipeName, pipeMeta);
        }
      });
    }
  }

  /**
   * @param propName the name of the property / attribute
   * @param sourceSpan
   * @param isAttr true when binding to an attribute
   */
  private _validatePropertyOrAttributeName(
      propName: string, sourceSpan: ParseSourceSpan, isAttr: boolean): void {
    const report = isAttr ? this._schemaRegistry.validateAttribute(propName) :
                            this._schemaRegistry.validateProperty(propName);
    if (report.error) {
      this._reportError(report.msg!, sourceSpan, ParseErrorLevel.ERROR);
    }
  }
}

export class PipeCollector extends RecursiveAstVisitor {
  pipes = new Map<string, BindingPipe>();
  override visitPipe(ast: BindingPipe, context: any): any {
    this.pipes.set(ast.name, ast);
    ast.exp.visit(this);
    this.visitAll(ast.args, context);
    return null;
  }
}

function isAnimationLabel(name: string): boolean {
  return name[0] == '@';
}

export function calcPossibleSecurityContexts(
    registry: ElementSchemaRegistry, selector: string, propName: string,
    isAttribute: boolean): SecurityContext[] {
  const ctxs: SecurityContext[] = [];
  CssSelector.parse(selector).forEach((selector) => {
    const elementNames = selector.element ? [selector.element] : registry.allKnownElementNames();
    const notElementNames =
        new Set(selector.notSelectors.filter(selector => selector.isElementSelector())
                    .map((selector) => selector.element));
    const possibleElementNames =
        elementNames.filter(elementName => !notElementNames.has(elementName));

    ctxs.push(...possibleElementNames.map(
        elementName => registry.securityContext(elementName, propName, isAttribute)));
  });
  return ctxs.length === 0 ? [SecurityContext.NONE] : Array.from(new Set(ctxs)).sort();
}

/**
 * Compute a new ParseSourceSpan based off an original `sourceSpan` by using
 * absolute offsets from the specified `absoluteSpan`.
 *
 * @param sourceSpan original source span
 * @param absoluteSpan absolute source span to move to
 */
function moveParseSourceSpan(
    sourceSpan: ParseSourceSpan, absoluteSpan: AbsoluteSourceSpan): ParseSourceSpan {
  // The difference of two absolute offsets provide the relative offset
  const startDiff = absoluteSpan.start - sourceSpan.start.offset;
  const endDiff = absoluteSpan.end - sourceSpan.end.offset;
  return new ParseSourceSpan(
      sourceSpan.start.moveBy(startDiff), sourceSpan.end.moveBy(endDiff),
      sourceSpan.fullStart.moveBy(startDiff), sourceSpan.details);
}
