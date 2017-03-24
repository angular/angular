/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '@angular/core';

import {CompileDirectiveSummary, CompilePipeSummary} from '../compile_metadata';
import {ASTWithSource, BindingPipe, EmptyExpr, ParserError, RecursiveAstVisitor, TemplateBinding} from '../expression_parser/ast';
import {Parser} from '../expression_parser/parser';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {mergeNsAndName} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {CssSelector} from '../selector';
import {splitAtColon, splitAtPeriod} from '../util';

import {BoundElementPropertyAst, BoundEventAst, PropertyBindingType, VariableAst} from './template_ast';

const PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';

const ANIMATE_PROP_PREFIX = 'animate-';

export enum BoundPropertyType {
  DEFAULT,
  LITERAL_ATTR,
  ANIMATION
}

/**
 * Represents a parsed property.
 */
export class BoundProperty {
  constructor(
      public name: string, public expression: ASTWithSource, public type: BoundPropertyType,
      public sourceSpan: ParseSourceSpan) {}

  get isLiteral() { return this.type === BoundPropertyType.LITERAL_ATTR; }

  get isAnimation() { return this.type === BoundPropertyType.ANIMATION; }
}

/**
 * Parses bindings in templates and in the directive host area.
 */
export class BindingParser {
  pipesByName: Map<string, CompilePipeSummary> = new Map();
  private _usedPipes: Map<string, CompilePipeSummary> = new Map();

  constructor(
      private _exprParser: Parser, private _interpolationConfig: InterpolationConfig,
      private _schemaRegistry: ElementSchemaRegistry, pipes: CompilePipeSummary[],
      private _targetErrors: ParseError[]) {
    pipes.forEach(pipe => this.pipesByName.set(pipe.name, pipe));
  }

  getUsedPipes(): CompilePipeSummary[] { return Array.from(this._usedPipes.values()); }

  createDirectiveHostPropertyAsts(
      dirMeta: CompileDirectiveSummary, elementSelector: string,
      sourceSpan: ParseSourceSpan): BoundElementPropertyAst[]|null {
    if (dirMeta.hostProperties) {
      const boundProps: BoundProperty[] = [];
      Object.keys(dirMeta.hostProperties).forEach(propName => {
        const expression = dirMeta.hostProperties[propName];
        if (typeof expression === 'string') {
          this.parsePropertyBinding(propName, expression, true, sourceSpan, [], boundProps);
        } else {
          this._reportError(
              `Value of the host property binding "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`,
              sourceSpan);
        }
      });
      return boundProps.map((prop) => this.createElementPropertyAst(elementSelector, prop));
    }
    return null;
  }

  createDirectiveHostEventAsts(dirMeta: CompileDirectiveSummary, sourceSpan: ParseSourceSpan):
      BoundEventAst[]|null {
    if (dirMeta.hostListeners) {
      const targetEventAsts: BoundEventAst[] = [];
      Object.keys(dirMeta.hostListeners).forEach(propName => {
        const expression = dirMeta.hostListeners[propName];
        if (typeof expression === 'string') {
          this.parseEvent(propName, expression, sourceSpan, [], targetEventAsts);
        } else {
          this._reportError(
              `Value of the host listener "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`,
              sourceSpan);
        }
      });
      return targetEventAsts;
    }
    return null;
  }

  parseInterpolation(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const ast =
          this._exprParser.parseInterpolation(value, sourceInfo, this._interpolationConfig) !;
      if (ast) this._reportExpressionParserErrors(ast.errors, sourceSpan);
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  parseInlineTemplateBinding(
      prefixToken: string, value: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: BoundProperty[], targetVars: VariableAst[]) {
    const bindings = this._parseTemplateBindings(prefixToken, value, sourceSpan);
    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];
      if (binding.keyIsVar) {
        targetVars.push(new VariableAst(binding.key, binding.name, sourceSpan));
      } else if (binding.expression) {
        this._parsePropertyAst(
            binding.key, binding.expression, sourceSpan, targetMatchableAttrs, targetProps);
      } else {
        targetMatchableAttrs.push([binding.key, '']);
        this.parseLiteralAttr(binding.key, null, sourceSpan, targetMatchableAttrs, targetProps);
      }
    }
  }

  private _parseTemplateBindings(prefixToken: string, value: string, sourceSpan: ParseSourceSpan):
      TemplateBinding[] {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const bindingsResult = this._exprParser.parseTemplateBindings(prefixToken, value, sourceInfo);
      this._reportExpressionParserErrors(bindingsResult.errors, sourceSpan);
      bindingsResult.templateBindings.forEach((binding) => {
        if (binding.expression) {
          this._checkPipes(binding.expression, sourceSpan);
        }
      });
      bindingsResult.warnings.forEach(
          (warning) => { this._reportError(warning, sourceSpan, ParseErrorLevel.WARNING); });
      return bindingsResult.templateBindings;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return [];
    }
  }

  parseLiteralAttr(
      name: string, value: string|null, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: BoundProperty[]) {
    if (_isAnimationLabel(name)) {
      name = name.substring(1);
      if (value) {
        this._reportError(
            `Assigning animation triggers via @prop="exp" attributes with an expression is invalid.` +
                ` Use property bindings (e.g. [@prop]="exp") or use an attribute without a value (e.g. @prop) instead.`,
            sourceSpan, ParseErrorLevel.ERROR);
      }
      this._parseAnimation(name, value, sourceSpan, targetMatchableAttrs, targetProps);
    } else {
      targetProps.push(new BoundProperty(
          name, this._exprParser.wrapLiteralPrimitive(value, ''), BoundPropertyType.LITERAL_ATTR,
          sourceSpan));
    }
  }

  parsePropertyBinding(
      name: string, expression: string, isHost: boolean, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: BoundProperty[]) {
    let isAnimationProp = false;
    if (name.startsWith(ANIMATE_PROP_PREFIX)) {
      isAnimationProp = true;
      name = name.substring(ANIMATE_PROP_PREFIX.length);
    } else if (_isAnimationLabel(name)) {
      isAnimationProp = true;
      name = name.substring(1);
    }

    if (isAnimationProp) {
      this._parseAnimation(name, expression, sourceSpan, targetMatchableAttrs, targetProps);
    } else {
      this._parsePropertyAst(
          name, this._parseBinding(expression, isHost, sourceSpan), sourceSpan,
          targetMatchableAttrs, targetProps);
    }
  }

  parsePropertyInterpolation(
      name: string, value: string, sourceSpan: ParseSourceSpan, targetMatchableAttrs: string[][],
      targetProps: BoundProperty[]): boolean {
    const expr = this.parseInterpolation(value, sourceSpan);
    if (expr) {
      this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
      return true;
    }
    return false;
  }

  private _parsePropertyAst(
      name: string, ast: ASTWithSource, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: BoundProperty[]) {
    targetMatchableAttrs.push([name, ast.source !]);
    targetProps.push(new BoundProperty(name, ast, BoundPropertyType.DEFAULT, sourceSpan));
  }

  private _parseAnimation(
      name: string, expression: string|null, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: BoundProperty[]) {
    // This will occur when a @trigger is not paired with an expression.
    // For animations it is valid to not have an expression since */void
    // states will be applied by angular when the element is attached/detached
    const ast = this._parseBinding(expression || 'null', false, sourceSpan);
    targetMatchableAttrs.push([name, ast.source !]);
    targetProps.push(new BoundProperty(name, ast, BoundPropertyType.ANIMATION, sourceSpan));
  }

  private _parseBinding(value: string, isHostBinding: boolean, sourceSpan: ParseSourceSpan):
      ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const ast = isHostBinding ?
          this._exprParser.parseSimpleBinding(value, sourceInfo, this._interpolationConfig) :
          this._exprParser.parseBinding(value, sourceInfo, this._interpolationConfig);
      if (ast) this._reportExpressionParserErrors(ast.errors, sourceSpan);
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  createElementPropertyAst(elementSelector: string, boundProp: BoundProperty):
      BoundElementPropertyAst {
    if (boundProp.isAnimation) {
      return new BoundElementPropertyAst(
          boundProp.name, PropertyBindingType.Animation, SecurityContext.NONE, boundProp.expression,
          null, boundProp.sourceSpan);
    }

    let unit: string|null = null;
    let bindingType: PropertyBindingType = undefined !;
    let boundPropertyName: string|null = null;
    const parts = boundProp.name.split(PROPERTY_PARTS_SEPARATOR);
    let securityContexts: SecurityContext[] = undefined !;

    // Check check for special cases (prefix style, attr, class)
    if (parts.length > 1) {
      if (parts[0] == ATTRIBUTE_PREFIX) {
        boundPropertyName = parts[1];
        this._validatePropertyOrAttributeName(boundPropertyName, boundProp.sourceSpan, true);
        securityContexts = calcPossibleSecurityContexts(
            this._schemaRegistry, elementSelector, boundPropertyName, true);

        const nsSeparatorIdx = boundPropertyName.indexOf(':');
        if (nsSeparatorIdx > -1) {
          const ns = boundPropertyName.substring(0, nsSeparatorIdx);
          const name = boundPropertyName.substring(nsSeparatorIdx + 1);
          boundPropertyName = mergeNsAndName(ns, name);
        }

        bindingType = PropertyBindingType.Attribute;
      } else if (parts[0] == CLASS_PREFIX) {
        boundPropertyName = parts[1];
        bindingType = PropertyBindingType.Class;
        securityContexts = [SecurityContext.NONE];
      } else if (parts[0] == STYLE_PREFIX) {
        unit = parts.length > 2 ? parts[2] : null;
        boundPropertyName = parts[1];
        bindingType = PropertyBindingType.Style;
        securityContexts = [SecurityContext.STYLE];
      }
    }

    // If not a special case, use the full property name
    if (boundPropertyName === null) {
      boundPropertyName = this._schemaRegistry.getMappedPropName(boundProp.name);
      securityContexts = calcPossibleSecurityContexts(
          this._schemaRegistry, elementSelector, boundPropertyName, false);
      bindingType = PropertyBindingType.Property;
      this._validatePropertyOrAttributeName(boundPropertyName, boundProp.sourceSpan, false);
    }

    return new BoundElementPropertyAst(
        boundPropertyName, bindingType, securityContexts[0], boundProp.expression, unit,
        boundProp.sourceSpan);
  }

  parseEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    if (_isAnimationLabel(name)) {
      name = name.substr(1);
      this._parseAnimationEvent(name, expression, sourceSpan, targetEvents);
    } else {
      this._parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents);
    }
  }

  private _parseAnimationEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetEvents: BoundEventAst[]) {
    const matches = splitAtPeriod(name, [name, '']);
    const eventName = matches[0];
    const phase = matches[1].toLowerCase();
    if (phase) {
      switch (phase) {
        case 'start':
        case 'done':
          const ast = this._parseAction(expression, sourceSpan);
          targetEvents.push(new BoundEventAst(eventName, null, phase, ast, sourceSpan));
          break;

        default:
          this._reportError(
              `The provided animation output phase value "${phase}" for "@${eventName}" is not supported (use start or done)`,
              sourceSpan);
          break;
      }
    } else {
      this._reportError(
          `The animation trigger output event (@${eventName}) is missing its phase value name (start or done are currently supported)`,
          sourceSpan);
    }
  }

  private _parseEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    // long format: 'target: eventName'
    const [target, eventName] = splitAtColon(name, [null !, name]);
    const ast = this._parseAction(expression, sourceSpan);
    targetMatchableAttrs.push([name !, ast.source !]);
    targetEvents.push(new BoundEventAst(eventName, target, null, ast, sourceSpan));
    // Don't detect directives for event names for now,
    // so don't add the event name to the matchableAttrs
  }

  private _parseAction(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const ast = this._exprParser.parseAction(value, sourceInfo, this._interpolationConfig);
      if (ast) {
        this._reportExpressionParserErrors(ast.errors, sourceSpan);
      }
      if (!ast || ast.ast instanceof EmptyExpr) {
        this._reportError(`Empty expressions are not allowed`, sourceSpan);
        return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
      }
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  private _reportError(
      message: string, sourceSpan: ParseSourceSpan,
      level: ParseErrorLevel = ParseErrorLevel.ERROR) {
    this._targetErrors.push(new ParseError(sourceSpan, message, level));
  }

  private _reportExpressionParserErrors(errors: ParserError[], sourceSpan: ParseSourceSpan) {
    for (const error of errors) {
      this._reportError(error.message, sourceSpan);
    }
  }

  private _checkPipes(ast: ASTWithSource, sourceSpan: ParseSourceSpan) {
    if (ast) {
      const collector = new PipeCollector();
      ast.visit(collector);
      collector.pipes.forEach((ast, pipeName) => {
        const pipeMeta = this.pipesByName.get(pipeName);
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
   * @private
   */
  private _validatePropertyOrAttributeName(
      propName: string, sourceSpan: ParseSourceSpan, isAttr: boolean): void {
    const report = isAttr ? this._schemaRegistry.validateAttribute(propName) :
                            this._schemaRegistry.validateProperty(propName);
    if (report.error) {
      this._reportError(report.msg !, sourceSpan, ParseErrorLevel.ERROR);
    }
  }
}

export class PipeCollector extends RecursiveAstVisitor {
  pipes = new Map<string, BindingPipe>();
  visitPipe(ast: BindingPipe, context: any): any {
    this.pipes.set(ast.name, ast);
    ast.exp.visit(this);
    this.visitAll(ast.args, context);
    return null;
  }
}

function _isAnimationLabel(name: string): boolean {
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
