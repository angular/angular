/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveSummary, CompilePipeSummary} from '../compile_metadata';
import {SecurityContext} from '../core';
import {ASTWithSource, BindingPipe, BindingType, BoundElementProperty, EmptyExpr, ParsedEvent, ParsedEventType, ParsedProperty, ParsedPropertyType, ParsedVariable, ParserError, RecursiveAstVisitor, TemplateBinding} from '../expression_parser/ast';
import {Parser} from '../expression_parser/parser';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {mergeNsAndName} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {CssSelector} from '../selector';
import {splitAtColon, splitAtPeriod} from '../util';

const PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';

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

  get interpolationConfig(): InterpolationConfig { return this._interpolationConfig; }

  getUsedPipes(): CompilePipeSummary[] { return Array.from(this._usedPipes.values()); }

  createBoundHostProperties(dirMeta: CompileDirectiveSummary, sourceSpan: ParseSourceSpan):
      ParsedProperty[]|null {
    if (dirMeta.hostProperties) {
      const boundProps: ParsedProperty[] = [];
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
          // TODO: pass a more accurate handlerSpan for this event.
          this.parseEvent(propName, expression, sourceSpan, sourceSpan, [], targetEvents);
        } else {
          this._reportError(
              `Value of the host listener "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`,
              sourceSpan);
        }
      });
      return targetEvents;
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

  // Parse an inline template binding. ie `<tag *tplKey="<tplValue>">`
  parseInlineTemplateBinding(
      tplKey: string, tplValue: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[],
      targetVars: ParsedVariable[]) {
    const bindings = this._parseTemplateBindings(tplKey, tplValue, sourceSpan);

    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];
      if (binding.keyIsVar) {
        targetVars.push(new ParsedVariable(binding.key, binding.name, sourceSpan));
      } else if (binding.expression) {
        this._parsePropertyAst(
            binding.key, binding.expression, sourceSpan, targetMatchableAttrs, targetProps);
      } else {
        targetMatchableAttrs.push([binding.key, '']);
        this.parseLiteralAttr(binding.key, null, sourceSpan, targetMatchableAttrs, targetProps);
      }
    }
  }

  private _parseTemplateBindings(tplKey: string, tplValue: string, sourceSpan: ParseSourceSpan):
      TemplateBinding[] {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const bindingsResult = this._exprParser.parseTemplateBindings(tplKey, tplValue, sourceInfo);
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
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[]) {
    if (isAnimationLabel(name)) {
      name = name.substring(1);
      if (value) {
        this._reportError(
            `Assigning animation triggers via @prop="exp" attributes with an expression is invalid.` +
                ` Use property bindings (e.g. [@prop]="exp") or use an attribute without a value (e.g. @prop) instead.`,
            sourceSpan, ParseErrorLevel.ERROR);
      }
      this._parseAnimation(name, value, sourceSpan, targetMatchableAttrs, targetProps);
    } else {
      targetProps.push(new ParsedProperty(
          name, this._exprParser.wrapLiteralPrimitive(value, ''), ParsedPropertyType.LITERAL_ATTR,
          sourceSpan));
    }
  }

  parsePropertyBinding(
      name: string, expression: string, isHost: boolean, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[]) {
    let isAnimationProp = false;
    if (name.startsWith(ANIMATE_PROP_PREFIX)) {
      isAnimationProp = true;
      name = name.substring(ANIMATE_PROP_PREFIX.length);
    } else if (isAnimationLabel(name)) {
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
      targetProps: ParsedProperty[]): boolean {
    const expr = this.parseInterpolation(value, sourceSpan);
    if (expr) {
      this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
      return true;
    }
    return false;
  }

  private _parsePropertyAst(
      name: string, ast: ASTWithSource, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[]) {
    targetMatchableAttrs.push([name, ast.source !]);
    targetProps.push(new ParsedProperty(name, ast, ParsedPropertyType.DEFAULT, sourceSpan));
  }

  private _parseAnimation(
      name: string, expression: string|null, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: ParsedProperty[]) {
    // This will occur when a @trigger is not paired with an expression.
    // For animations it is valid to not have an expression since */void
    // states will be applied by angular when the element is attached/detached
    const ast = this._parseBinding(expression || 'undefined', false, sourceSpan);
    targetMatchableAttrs.push([name, ast.source !]);
    targetProps.push(new ParsedProperty(name, ast, ParsedPropertyType.ANIMATION, sourceSpan));
  }

  private _parseBinding(value: string, isHostBinding: boolean, sourceSpan: ParseSourceSpan):
      ASTWithSource {
    const sourceInfo = (sourceSpan && sourceSpan.start || '(unknown)').toString();

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

  createBoundElementProperty(
      elementSelector: string, boundProp: ParsedProperty,
      skipValidation: boolean = false): BoundElementProperty {
    if (boundProp.isAnimation) {
      return new BoundElementProperty(
          boundProp.name, BindingType.Animation, SecurityContext.NONE, boundProp.expression, null,
          boundProp.sourceSpan);
    }

    let unit: string|null = null;
    let bindingType: BindingType = undefined !;
    let boundPropertyName: string|null = null;
    const parts = boundProp.name.split(PROPERTY_PARTS_SEPARATOR);
    let securityContexts: SecurityContext[] = undefined !;

    // Check for special cases (prefix style, attr, class)
    if (parts.length > 1) {
      if (parts[0] == ATTRIBUTE_PREFIX) {
        boundPropertyName = parts[1];
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
      boundPropertyName = this._schemaRegistry.getMappedPropName(boundProp.name);
      securityContexts = calcPossibleSecurityContexts(
          this._schemaRegistry, elementSelector, boundPropertyName, false);
      bindingType = BindingType.Property;
      if (!skipValidation) {
        this._validatePropertyOrAttributeName(boundPropertyName, boundProp.sourceSpan, false);
      }
    }

    return new BoundElementProperty(
        boundPropertyName, bindingType, securityContexts[0], boundProp.expression, unit,
        boundProp.sourceSpan);
  }

  parseEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: ParsedEvent[]) {
    if (isAnimationLabel(name)) {
      name = name.substr(1);
      this._parseAnimationEvent(name, expression, sourceSpan, handlerSpan, targetEvents);
    } else {
      this._parseRegularEvent(
          name, expression, sourceSpan, handlerSpan, targetMatchableAttrs, targetEvents);
    }
  }

  calcPossibleSecurityContexts(selector: string, propName: string, isAttribute: boolean):
      SecurityContext[] {
    const prop = this._schemaRegistry.getMappedPropName(propName);
    return calcPossibleSecurityContexts(this._schemaRegistry, selector, prop, isAttribute);
  }

  private _parseAnimationEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan,
      targetEvents: ParsedEvent[]) {
    const matches = splitAtPeriod(name, [name, '']);
    const eventName = matches[0];
    const phase = matches[1].toLowerCase();
    if (phase) {
      switch (phase) {
        case 'start':
        case 'done':
          const ast = this._parseAction(expression, handlerSpan);
          targetEvents.push(new ParsedEvent(
              eventName, phase, ParsedEventType.Animation, ast, sourceSpan, handlerSpan));
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

  private _parseRegularEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: ParsedEvent[]) {
    // long format: 'target: eventName'
    const [target, eventName] = splitAtColon(name, [null !, name]);
    const ast = this._parseAction(expression, handlerSpan);
    targetMatchableAttrs.push([name !, ast.source !]);
    targetEvents.push(
        new ParsedEvent(eventName, target, ParsedEventType.Regular, ast, sourceSpan, handlerSpan));
    // Don't detect directives for event names for now,
    // so don't add the event name to the matchableAttrs
  }

  private _parseAction(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = (sourceSpan && sourceSpan.start || '(unknown').toString();

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
        const pipeMeta = this.pipesByName !.get(pipeName);
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