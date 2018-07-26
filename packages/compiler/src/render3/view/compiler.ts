/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../../aot/static_symbol';
import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileQueryMetadata, CompileTokenMetadata, identifierName, sanitizeIdentifier} from '../../compile_metadata';
import {CompileReflector} from '../../compile_reflector';
import {BindingForm, convertActionBinding, convertPropertyBinding} from '../../compiler_util/expression_converter';
import {ConstantPool, DefinitionKind} from '../../constant_pool';
import * as core from '../../core';
import {LifecycleHooks} from '../../lifecycle_reflector';
import * as o from '../../output/output_ast';
import {typeSourceSpan} from '../../parse_util';
import {CssSelector, SelectorMatcher} from '../../selector';
import {BindingParser} from '../../template_parser/binding_parser';
import {OutputContext, error} from '../../util';
import {compileFactoryFunction, dependenciesFromGlobalMetadata} from '../r3_factory';
import {Identifiers as R3} from '../r3_identifiers';
import {Render3ParseResult} from '../r3_template_transform';
import {typeWithParameters} from '../util';

import {R3ComponentDef, R3ComponentMetadata, R3DirectiveDef, R3DirectiveMetadata, R3QueryMetadata} from './api';
import {BindingScope, TemplateDefinitionBuilder, renderFlagCheckIfStmt} from './template';
import {CONTEXT_NAME, DefinitionMap, RENDER_FLAGS, TEMPORARY_NAME, asLiteral, conditionallyCreateMapObjectLiteral, getQueryPredicate, temporaryAllocator} from './util';

function baseDirectiveFields(
    meta: R3DirectiveMetadata, constantPool: ConstantPool,
    bindingParser: BindingParser): DefinitionMap {
  const definitionMap = new DefinitionMap();

  // e.g. `type: MyDirective`
  definitionMap.set('type', meta.type);

  // e.g. `selectors: [['', 'someDir', '']]`
  definitionMap.set('selectors', createDirectiveSelector(meta.selector !));


  // e.g. `factory: () => new MyApp(injectElementRef())`
  definitionMap.set('factory', compileFactoryFunction({
                      name: meta.name,
                      fnOrClass: meta.type,
                      deps: meta.deps,
                      useNew: true,
                      injectFn: R3.directiveInject,
                    }));

  definitionMap.set('contentQueries', createContentQueriesFunction(meta, constantPool));

  definitionMap.set('contentQueriesRefresh', createContentQueriesRefreshFunction(meta));

  // e.g. `hostBindings: (dirIndex, elIndex) => { ... }
  definitionMap.set('hostBindings', createHostBindingsFunction(meta, bindingParser));

  // e.g. `attributes: ['role', 'listbox']`
  definitionMap.set('attributes', createHostAttributesArray(meta));

  // e.g 'inputs: {a: 'a'}`
  definitionMap.set('inputs', conditionallyCreateMapObjectLiteral(meta.inputs));

  // e.g 'outputs: {a: 'a'}`
  definitionMap.set('outputs', conditionallyCreateMapObjectLiteral(meta.outputs));

  // e.g. `features: [NgOnChangesFeature]`
  const features: o.Expression[] = [];

  if (meta.usesInheritance) {
    features.push(o.importExpr(R3.InheritDefinitionFeature));
  }
  if (meta.lifecycle.usesOnChanges) {
    features.push(o.importExpr(R3.NgOnChangesFeature));
  }
  if (features.length) {
    definitionMap.set('features', o.literalArr(features));
  }

  return definitionMap;
}

/**
 * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
 */
export function compileDirectiveFromMetadata(
    meta: R3DirectiveMetadata, constantPool: ConstantPool,
    bindingParser: BindingParser): R3DirectiveDef {
  const definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
  const expression = o.importExpr(R3.defineDirective).callFn([definitionMap.toLiteralMap()]);

  // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
  // string literal, which must be on one line.
  const selectorForType = (meta.selector || '').replace(/\n/g, '');

  const type = new o.ExpressionType(o.importExpr(R3.DirectiveDef, [
    typeWithParameters(meta.type, meta.typeArgumentCount),
    new o.ExpressionType(o.literal(selectorForType))
  ]));
  return {expression, type};
}

/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export function compileComponentFromMetadata(
    meta: R3ComponentMetadata, constantPool: ConstantPool,
    bindingParser: BindingParser): R3ComponentDef {
  const definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);

  const selector = meta.selector && CssSelector.parse(meta.selector);
  const firstSelector = selector && selector[0];

  // e.g. `attr: ["class", ".my.app"]`
  // This is optional an only included if the first selector of a component specifies attributes.
  if (firstSelector) {
    const selectorAttributes = firstSelector.getAttrs();
    if (selectorAttributes.length) {
      definitionMap.set(
          'attrs', constantPool.getConstLiteral(
                       o.literalArr(selectorAttributes.map(
                           value => value != null ? o.literal(value) : o.literal(undefined))),
                       /* forceShared */ true));
    }
  }

  // Generate the CSS matcher that recognize directive
  let directiveMatcher: SelectorMatcher|null = null;

  if (meta.directives.size) {
    const matcher = new SelectorMatcher();
    meta.directives.forEach((expression, selector: string) => {
      matcher.addSelectables(CssSelector.parse(selector), expression);
    });
    directiveMatcher = matcher;
  }

  if (meta.viewQueries.length) {
    definitionMap.set('viewQuery', createViewQueriesFunction(meta, constantPool));
  }

  // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
  const templateTypeName = meta.name;
  const templateName = templateTypeName ? `${templateTypeName}_Template` : null;

  const directivesUsed = new Set<o.Expression>();
  const pipesUsed = new Set<o.Expression>();

  const template = meta.template;
  const templateFunctionExpression =
      new TemplateDefinitionBuilder(
          constantPool, BindingScope.ROOT_SCOPE, 0, templateTypeName, templateName,
          meta.viewQueries, directiveMatcher, directivesUsed, meta.pipes, pipesUsed,
          R3.namespaceHTML)
          .buildTemplateFunction(
              template.nodes, [], template.hasNgContent, template.ngContentSelectors);

  definitionMap.set('template', templateFunctionExpression);

  // e.g. `directives: [MyDirective]`
  if (directivesUsed.size) {
    definitionMap.set('directives', o.literalArr(Array.from(directivesUsed)));
  }

  // e.g. `pipes: [MyPipe]`
  if (pipesUsed.size) {
    definitionMap.set('pipes', o.literalArr(Array.from(pipesUsed)));
  }

  // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
  // string literal, which must be on one line.
  const selectorForType = (meta.selector || '').replace(/\n/g, '');

  const expression = o.importExpr(R3.defineComponent).callFn([definitionMap.toLiteralMap()]);
  const type = new o.ExpressionType(o.importExpr(R3.ComponentDef, [
    typeWithParameters(meta.type, meta.typeArgumentCount),
    new o.ExpressionType(o.literal(selectorForType))
  ]));

  return {expression, type};
}

/**
 * A wrapper around `compileDirective` which depends on render2 global analysis data as its input
 * instead of the `R3DirectiveMetadata`.
 *
 * `R3DirectiveMetadata` is computed from `CompileDirectiveMetadata` and other statically reflected
 * information.
 */
export function compileDirectiveFromRender2(
    outputCtx: OutputContext, directive: CompileDirectiveMetadata, reflector: CompileReflector,
    bindingParser: BindingParser) {
  const name = identifierName(directive.type) !;
  name || error(`Cannot resolver the name of ${directive.type}`);

  const definitionField = outputCtx.constantPool.propertyNameOf(DefinitionKind.Directive);

  const meta = directiveMetadataFromGlobalMetadata(directive, outputCtx, reflector);
  const res = compileDirectiveFromMetadata(meta, outputCtx.constantPool, bindingParser);

  // Create the partial class to be merged with the actual class.
  outputCtx.statements.push(new o.ClassStmt(
      name, null,
      [new o.ClassField(definitionField, o.INFERRED_TYPE, [o.StmtModifier.Static], res.expression)],
      [], new o.ClassMethod(null, [], []), []));
}

/**
 * A wrapper around `compileComponent` which depends on render2 global analysis data as its input
 * instead of the `R3DirectiveMetadata`.
 *
 * `R3ComponentMetadata` is computed from `CompileDirectiveMetadata` and other statically reflected
 * information.
 */
export function compileComponentFromRender2(
    outputCtx: OutputContext, component: CompileDirectiveMetadata, render3Ast: Render3ParseResult,
    reflector: CompileReflector, bindingParser: BindingParser, directiveTypeBySel: Map<string, any>,
    pipeTypeByName: Map<string, any>) {
  const name = identifierName(component.type) !;
  name || error(`Cannot resolver the name of ${component.type}`);

  const definitionField = outputCtx.constantPool.propertyNameOf(DefinitionKind.Component);

  const summary = component.toSummary();

  // Compute the R3ComponentMetadata from the CompileDirectiveMetadata
  const meta: R3ComponentMetadata = {
    ...directiveMetadataFromGlobalMetadata(component, outputCtx, reflector),
    selector: component.selector,
    template: {
      nodes: render3Ast.nodes,
      hasNgContent: render3Ast.hasNgContent,
      ngContentSelectors: render3Ast.ngContentSelectors,
    },
    directives: typeMapToExpressionMap(directiveTypeBySel, outputCtx),
    pipes: typeMapToExpressionMap(pipeTypeByName, outputCtx),
    viewQueries: queriesFromGlobalMetadata(component.viewQueries, outputCtx),
  };
  const res = compileComponentFromMetadata(meta, outputCtx.constantPool, bindingParser);

  // Create the partial class to be merged with the actual class.
  outputCtx.statements.push(new o.ClassStmt(
      name, null,
      [new o.ClassField(definitionField, o.INFERRED_TYPE, [o.StmtModifier.Static], res.expression)],
      [], new o.ClassMethod(null, [], []), []));
}

/**
 * Compute `R3DirectiveMetadata` given `CompileDirectiveMetadata` and a `CompileReflector`.
 */
function directiveMetadataFromGlobalMetadata(
    directive: CompileDirectiveMetadata, outputCtx: OutputContext,
    reflector: CompileReflector): R3DirectiveMetadata {
  const summary = directive.toSummary();
  const name = identifierName(directive.type) !;
  name || error(`Cannot resolver the name of ${directive.type}`);

  return {
    name,
    type: outputCtx.importExpr(directive.type.reference),
    typeArgumentCount: 0,
    typeSourceSpan:
        typeSourceSpan(directive.isComponent ? 'Component' : 'Directive', directive.type),
    selector: directive.selector,
    deps: dependenciesFromGlobalMetadata(directive.type, outputCtx, reflector),
    queries: queriesFromGlobalMetadata(directive.queries, outputCtx),
    lifecycle: {
      usesOnChanges:
          directive.type.lifecycleHooks.some(lifecycle => lifecycle == LifecycleHooks.OnChanges),
    },
    host: {
      attributes: directive.hostAttributes,
      listeners: summary.hostListeners,
      properties: summary.hostProperties,
    },
    inputs: directive.inputs,
    outputs: directive.outputs,
    usesInheritance: false,
  };
}

/**
 * Convert `CompileQueryMetadata` into `R3QueryMetadata`.
 */
function queriesFromGlobalMetadata(
    queries: CompileQueryMetadata[], outputCtx: OutputContext): R3QueryMetadata[] {
  return queries.map(query => {
    let read: o.Expression|null = null;
    if (query.read && query.read.identifier) {
      read = outputCtx.importExpr(query.read.identifier.reference);
    }
    return {
      propertyName: query.propertyName,
      first: query.first,
      predicate: selectorsFromGlobalMetadata(query.selectors, outputCtx),
      descendants: query.descendants, read,
    };
  });
}

/**
 * Convert `CompileTokenMetadata` for query selectors into either an expression for a predicate
 * type, or a list of string predicates.
 */
function selectorsFromGlobalMetadata(
    selectors: CompileTokenMetadata[], outputCtx: OutputContext): o.Expression|string[] {
  if (selectors.length > 1 || (selectors.length == 1 && selectors[0].value)) {
    const selectorStrings = selectors.map(value => value.value as string);
    selectorStrings.some(value => !value) &&
        error('Found a type among the string selectors expected');
    return outputCtx.constantPool.getConstLiteral(
        o.literalArr(selectorStrings.map(value => o.literal(value))));
  }

  if (selectors.length == 1) {
    const first = selectors[0];
    if (first.identifier) {
      return outputCtx.importExpr(first.identifier.reference);
    }
  }

  error('Unexpected query form');
  return o.NULL_EXPR;
}

function createQueryDefinition(
    query: R3QueryMetadata, constantPool: ConstantPool, idx: number | null): o.Expression {
  const predicate = getQueryPredicate(query, constantPool);

  // e.g. r3.Q(null, somePredicate, false) or r3.Q(0, ['div'], false)
  const parameters = [
    o.literal(idx, o.INFERRED_TYPE),
    predicate,
    o.literal(query.descendants),
  ];

  if (query.read) {
    parameters.push(query.read);
  }

  return o.importExpr(R3.query).callFn(parameters);
}

// Turn a directive selector into an R3-compatible selector for directive def
function createDirectiveSelector(selector: string): o.Expression {
  return asLiteral(core.parseSelectorToR3Selector(selector));
}

function createHostAttributesArray(meta: R3DirectiveMetadata): o.Expression|null {
  const values: o.Expression[] = [];
  const attributes = meta.host.attributes;
  for (let key of Object.getOwnPropertyNames(attributes)) {
    const value = attributes[key];
    values.push(o.literal(key), o.literal(value));
  }
  if (values.length > 0) {
    return o.literalArr(values);
  }
  return null;
}

// Return a contentQueries function or null if one is not necessary.
function createContentQueriesFunction(
    meta: R3DirectiveMetadata, constantPool: ConstantPool): o.Expression|null {
  if (meta.queries.length) {
    const statements: o.Statement[] = meta.queries.map((query: R3QueryMetadata) => {
      const queryDefinition = createQueryDefinition(query, constantPool, null);
      return o.importExpr(R3.registerContentQuery).callFn([queryDefinition]).toStmt();
    });
    const typeName = meta.name;
    return o.fn(
        [], statements, o.INFERRED_TYPE, null, typeName ? `${typeName}_ContentQueries` : null);
  }

  return null;
}

// Return a contentQueriesRefresh function or null if one is not necessary.
function createContentQueriesRefreshFunction(meta: R3DirectiveMetadata): o.Expression|null {
  if (meta.queries.length > 0) {
    const statements: o.Statement[] = [];
    const typeName = meta.name;
    const parameters = [
      new o.FnParam('dirIndex', o.NUMBER_TYPE),
      new o.FnParam('queryStartIndex', o.NUMBER_TYPE),
    ];
    const directiveInstanceVar = o.variable('instance');
    // var $tmp$: any;
    const temporary = temporaryAllocator(statements, TEMPORARY_NAME);

    // const $instance$ = $r3$.ɵd(dirIndex);
    statements.push(
        directiveInstanceVar.set(o.importExpr(R3.loadDirective).callFn([o.variable('dirIndex')]))
            .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));

    meta.queries.forEach((query: R3QueryMetadata, idx: number) => {
      const loadQLArg = o.variable('queryStartIndex');
      const getQueryList = o.importExpr(R3.loadQueryList).callFn([
        idx > 0 ? loadQLArg.plus(o.literal(idx)) : loadQLArg
      ]);
      const assignToTemporary = temporary().set(getQueryList);
      const callQueryRefresh = o.importExpr(R3.queryRefresh).callFn([assignToTemporary]);

      const updateDirective = directiveInstanceVar.prop(query.propertyName)
                                  .set(query.first ? temporary().prop('first') : temporary());
      const refreshQueryAndUpdateDirective = callQueryRefresh.and(updateDirective);

      statements.push(refreshQueryAndUpdateDirective.toStmt());
    });

    return o.fn(
        parameters, statements, o.INFERRED_TYPE, null,
        typeName ? `${typeName}_ContentQueriesRefresh` : null);
  }

  return null;
}

// Define and update any view queries
function createViewQueriesFunction(
    meta: R3ComponentMetadata, constantPool: ConstantPool): o.Expression {
  const createStatements: o.Statement[] = [];
  const updateStatements: o.Statement[] = [];
  const tempAllocator = temporaryAllocator(updateStatements, TEMPORARY_NAME);

  for (let i = 0; i < meta.viewQueries.length; i++) {
    const query = meta.viewQueries[i];

    // creation, e.g. r3.Q(0, somePredicate, true);
    const queryDefinition = createQueryDefinition(query, constantPool, i);
    createStatements.push(queryDefinition.toStmt());

    // update, e.g. (r3.qR(tmp = r3.ɵld(0)) && (ctx.someDir = tmp));
    const temporary = tempAllocator();
    const getQueryList = o.importExpr(R3.load).callFn([o.literal(i)]);
    const refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
    const updateDirective = o.variable(CONTEXT_NAME)
                                .prop(query.propertyName)
                                .set(query.first ? temporary.prop('first') : temporary);
    updateStatements.push(refresh.and(updateDirective).toStmt());
  }

  const viewQueryFnName = meta.name ? `${meta.name}_Query` : null;
  return o.fn(
      [new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null)],
      [
        renderFlagCheckIfStmt(core.RenderFlags.Create, createStatements),
        renderFlagCheckIfStmt(core.RenderFlags.Update, updateStatements)
      ],
      o.INFERRED_TYPE, null, viewQueryFnName);
}

// Return a host binding function or null if one is not necessary.
function createHostBindingsFunction(
    meta: R3DirectiveMetadata, bindingParser: BindingParser): o.Expression|null {
  const statements: o.Statement[] = [];

  const hostBindingSourceSpan = meta.typeSourceSpan;

  const directiveSummary = metadataAsSummary(meta);

  // Calculate the host property bindings
  const bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
  const bindingContext = o.importExpr(R3.loadDirective).callFn([o.variable('dirIndex')]);
  if (bindings) {
    for (const binding of bindings) {
      const bindingExpr = convertPropertyBinding(
          null, bindingContext, binding.expression, 'b', BindingForm.TrySimple,
          () => error('Unexpected interpolation'));
      statements.push(...bindingExpr.stmts);
      statements.push(o.importExpr(R3.elementProperty)
                          .callFn([
                            o.variable('elIndex'),
                            o.literal(binding.name),
                            o.importExpr(R3.bind).callFn([bindingExpr.currValExpr]),
                          ])
                          .toStmt());
    }
  }

  // Calculate host event bindings
  const eventBindings =
      bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
  if (eventBindings) {
    for (const binding of eventBindings) {
      const bindingExpr = convertActionBinding(
          null, bindingContext, binding.handler, 'b', () => error('Unexpected interpolation'));
      const bindingName = binding.name && sanitizeIdentifier(binding.name);
      const typeName = meta.name;
      const functionName =
          typeName && bindingName ? `${typeName}_${bindingName}_HostBindingHandler` : null;
      const handler = o.fn(
          [new o.FnParam('$event', o.DYNAMIC_TYPE)],
          [...bindingExpr.stmts, new o.ReturnStatement(bindingExpr.allowDefault)], o.INFERRED_TYPE,
          null, functionName);
      statements.push(
          o.importExpr(R3.listener).callFn([o.literal(binding.name), handler]).toStmt());
    }
  }

  if (statements.length > 0) {
    const typeName = meta.name;
    return o.fn(
        [
          new o.FnParam('dirIndex', o.NUMBER_TYPE),
          new o.FnParam('elIndex', o.NUMBER_TYPE),
        ],
        statements, o.INFERRED_TYPE, null, typeName ? `${typeName}_HostBindings` : null);
  }

  return null;
}

function metadataAsSummary(meta: R3DirectiveMetadata): CompileDirectiveSummary {
  // clang-format off
  return {
    hostAttributes: meta.host.attributes,
    hostListeners: meta.host.listeners,
    hostProperties: meta.host.properties,
  } as CompileDirectiveSummary;
  // clang-format on
}


function typeMapToExpressionMap(
    map: Map<string, StaticSymbol>, outputCtx: OutputContext): Map<string, o.Expression> {
  // Convert each map entry into another entry where the value is an expression importing the type.
  const entries = Array.from(map).map(
      ([key, type]): [string, o.Expression] => [key, outputCtx.importExpr(type)]);
  return new Map(entries);
}

const HOST_REG_EXP = /^(?:(?:\[([^\]]+)\])|(?:\(([^\)]+)\)))|(\@[-\w]+)$/;

// Represents the groups in the above regex.
const enum HostBindingGroup {
  // group 1: "prop" from "[prop]"
  Property = 1,

  // group 2: "event" from "(event)"
  Event = 2,

  // group 3: "@trigger" from "@trigger"
  Animation = 3,
}

export function parseHostBindings(host: {[key: string]: string}): {
  attributes: {[key: string]: string},
  listeners: {[key: string]: string},
  properties: {[key: string]: string},
  animations: {[key: string]: string},
} {
  const attributes: {[key: string]: string} = {};
  const listeners: {[key: string]: string} = {};
  const properties: {[key: string]: string} = {};
  const animations: {[key: string]: string} = {};

  Object.keys(host).forEach(key => {
    const value = host[key];
    const matches = key.match(HOST_REG_EXP);
    if (matches === null) {
      attributes[key] = value;
    } else if (matches[HostBindingGroup.Property] != null) {
      properties[matches[HostBindingGroup.Property]] = value;
    } else if (matches[HostBindingGroup.Event] != null) {
      listeners[matches[HostBindingGroup.Event]] = value;
    } else if (matches[HostBindingGroup.Animation] != null) {
      animations[matches[HostBindingGroup.Animation]] = value;
    }
  });

  return {attributes, listeners, properties, animations};
}
