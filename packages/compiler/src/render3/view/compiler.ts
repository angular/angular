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
import {BindingForm, convertPropertyBinding} from '../../compiler_util/expression_converter';
import {ConstantPool, DefinitionKind} from '../../constant_pool';
import * as core from '../../core';
import {AST, ParsedEvent, ParsedEventType, ParsedProperty} from '../../expression_parser/ast';
import {LifecycleHooks} from '../../lifecycle_reflector';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../ml_parser/interpolation_config';
import * as o from '../../output/output_ast';
import {typeSourceSpan} from '../../parse_util';
import {CssSelector, SelectorMatcher} from '../../selector';
import {ShadowCss} from '../../shadow_css';
import {CONTENT_ATTR, HOST_ATTR} from '../../style_compiler';
import {BindingParser} from '../../template_parser/binding_parser';
import {OutputContext, error} from '../../util';
import {BoundEvent} from '../r3_ast';
import {compileFactoryFunction, dependenciesFromGlobalMetadata} from '../r3_factory';
import {Identifiers as R3} from '../r3_identifiers';
import {Render3ParseResult} from '../r3_template_transform';
import {prepareSyntheticListenerFunctionName, prepareSyntheticPropertyName, typeWithParameters} from '../util';

import {R3ComponentDef, R3ComponentMetadata, R3DirectiveDef, R3DirectiveMetadata, R3QueryMetadata} from './api';
import {Instruction, StylingBuilder} from './styling_builder';
import {BindingScope, TemplateDefinitionBuilder, ValueConverter, prepareEventListenerParameters, renderFlagCheckIfStmt, resolveSanitizationFn} from './template';
import {CONTEXT_NAME, DefinitionMap, RENDER_FLAGS, TEMPORARY_NAME, asLiteral, conditionallyCreateMapObjectLiteral, getQueryPredicate, temporaryAllocator} from './util';

const EMPTY_ARRAY: any[] = [];

// This regex matches any binding names that contain the "attr." prefix, e.g. "attr.required"
// If there is a match, the first matching group will contain the attribute name to bind.
const ATTR_REGEX = /attr\.([^\]]+)/;

function getStylingPrefix(propName: string): string {
  return propName.substring(0, 5).toLowerCase();
}

function baseDirectiveFields(
    meta: R3DirectiveMetadata, constantPool: ConstantPool,
    bindingParser: BindingParser): {definitionMap: DefinitionMap, statements: o.Statement[]} {
  const definitionMap = new DefinitionMap();

  // e.g. `type: MyDirective`
  definitionMap.set('type', meta.type);

  // e.g. `selectors: [['', 'someDir', '']]`
  definitionMap.set('selectors', createDirectiveSelector(meta.selector));


  // e.g. `factory: () => new MyApp(directiveInject(ElementRef))`
  const result = compileFactoryFunction({
    name: meta.name,
    type: meta.type,
    deps: meta.deps,
    injectFn: R3.directiveInject,
  });
  definitionMap.set('factory', result.factory);

  definitionMap.set('contentQueries', createContentQueriesFunction(meta, constantPool));

  definitionMap.set('contentQueriesRefresh', createContentQueriesRefreshFunction(meta));

  // Initialize hostVarsCount to number of bound host properties (interpolations illegal),
  // except 'style' and 'class' properties, since they should *not* allocate host var slots
  const hostVarsCount = Object.keys(meta.host.properties)
                            .filter(name => {
                              const prefix = getStylingPrefix(name);
                              return prefix !== 'style' && prefix !== 'class';
                            })
                            .length;

  const elVarExp = o.variable('elIndex');
  const contextVarExp = o.variable(CONTEXT_NAME);
  const styleBuilder = new StylingBuilder(elVarExp, contextVarExp);

  const allOtherAttributes: any = {};
  const attrNames = Object.getOwnPropertyNames(meta.host.attributes);
  for (let i = 0; i < attrNames.length; i++) {
    const attr = attrNames[i];
    const value = meta.host.attributes[attr];
    switch (attr) {
      // style attributes are handled in the styling context
      case 'style':
        styleBuilder.registerStyleAttr(value);
        break;
      // class attributes are handled in the styling context
      case 'class':
        styleBuilder.registerClassAttr(value);
        break;
      default:
        allOtherAttributes[attr] = value;
        break;
    }
  }

  // e.g. `hostBindings: (rf, ctx, elIndex) => { ... }
  definitionMap.set(
      'hostBindings', createHostBindingsFunction(
                          meta, elVarExp, contextVarExp, allOtherAttributes, styleBuilder,
                          bindingParser, constantPool, hostVarsCount));

  // e.g 'inputs: {a: 'a'}`
  definitionMap.set('inputs', conditionallyCreateMapObjectLiteral(meta.inputs, true));

  // e.g 'outputs: {a: 'a'}`
  definitionMap.set('outputs', conditionallyCreateMapObjectLiteral(meta.outputs));

  if (meta.exportAs !== null) {
    definitionMap.set('exportAs', o.literalArr(meta.exportAs.map(e => o.literal(e))));
  }

  return {definitionMap, statements: result.statements};
}

/**
 * Add features to the definition map.
 */
function addFeatures(
    definitionMap: DefinitionMap, meta: R3DirectiveMetadata | R3ComponentMetadata) {
  const features: o.Expression[] = [];

  const providers = meta.providers;
  const viewProviders = (meta as R3ComponentMetadata).viewProviders;
  if (providers || viewProviders) {
    const args = [providers || new o.LiteralArrayExpr([])];
    if (viewProviders) {
      args.push(viewProviders);
    }
    features.push(o.importExpr(R3.ProvidersFeature).callFn(args));
  }

  if (meta.usesInheritance) {
    features.push(o.importExpr(R3.InheritDefinitionFeature));
  }

  if (features.length) {
    definitionMap.set('features', o.literalArr(features));
  }
}

/**
 * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
 */
export function compileDirectiveFromMetadata(
    meta: R3DirectiveMetadata, constantPool: ConstantPool,
    bindingParser: BindingParser): R3DirectiveDef {
  const {definitionMap, statements} = baseDirectiveFields(meta, constantPool, bindingParser);
  addFeatures(definitionMap, meta);
  const expression = o.importExpr(R3.defineDirective).callFn([definitionMap.toLiteralMap()]);

  if (!meta.selector) {
    throw new Error(`Directive ${meta.name} has no selector, please add it!`);
  }

  const type = createTypeForDef(meta, R3.DirectiveDefWithMeta);
  return {expression, type, statements};
}

export interface R3BaseRefMetaData {
  inputs?: {[key: string]: string | [string, string]};
  outputs?: {[key: string]: string};
}

/**
 * Compile a base definition for the render3 runtime as defined by {@link R3BaseRefMetadata}
 * @param meta the metadata used for compilation.
 */
export function compileBaseDefFromMetadata(meta: R3BaseRefMetaData) {
  const definitionMap = new DefinitionMap();
  if (meta.inputs) {
    const inputs = meta.inputs;
    const inputsMap = Object.keys(inputs).map(key => {
      const v = inputs[key];
      const value = Array.isArray(v) ? o.literalArr(v.map(vx => o.literal(vx))) : o.literal(v);
      return {key, value, quoted: false};
    });
    definitionMap.set('inputs', o.literalMap(inputsMap));
  }
  if (meta.outputs) {
    const outputs = meta.outputs;
    const outputsMap = Object.keys(outputs).map(key => {
      const value = o.literal(outputs[key]);
      return {key, value, quoted: false};
    });
    definitionMap.set('outputs', o.literalMap(outputsMap));
  }

  const expression = o.importExpr(R3.defineBase).callFn([definitionMap.toLiteralMap()]);

  const type = new o.ExpressionType(o.importExpr(R3.BaseDef));

  return {expression, type};
}

/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export function compileComponentFromMetadata(
    meta: R3ComponentMetadata, constantPool: ConstantPool,
    bindingParser: BindingParser): R3ComponentDef {
  const {definitionMap, statements} = baseDirectiveFields(meta, constantPool, bindingParser);
  addFeatures(definitionMap, meta);

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

  if (meta.directives.length > 0) {
    const matcher = new SelectorMatcher();
    for (const {selector, expression} of meta.directives) {
      matcher.addSelectables(CssSelector.parse(selector), expression);
    }
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
  const changeDetection = meta.changeDetection;

  const template = meta.template;
  const templateBuilder = new TemplateDefinitionBuilder(
      constantPool, BindingScope.ROOT_SCOPE, 0, templateTypeName, null, null, templateName,
      directiveMatcher, directivesUsed, meta.pipes, pipesUsed, R3.namespaceHTML,
      meta.relativeContextFilePath, meta.i18nUseExternalIds);

  const templateFunctionExpression = templateBuilder.buildTemplateFunction(template.nodes, []);

  // We need to provide this so that dynamically generated components know what
  // projected content blocks to pass through to the component when it is instantiated.
  const ngContentSelectors = templateBuilder.getNgContentSelectors();
  if (ngContentSelectors) {
    definitionMap.set('ngContentSelectors', ngContentSelectors);
  }

  // e.g. `consts: 2`
  definitionMap.set('consts', o.literal(templateBuilder.getConstCount()));

  // e.g. `vars: 2`
  definitionMap.set('vars', o.literal(templateBuilder.getVarCount()));

  definitionMap.set('template', templateFunctionExpression);

  // e.g. `directives: [MyDirective]`
  if (directivesUsed.size) {
    let directivesExpr: o.Expression = o.literalArr(Array.from(directivesUsed));
    if (meta.wrapDirectivesAndPipesInClosure) {
      directivesExpr = o.fn([], [new o.ReturnStatement(directivesExpr)]);
    }
    definitionMap.set('directives', directivesExpr);
  }

  // e.g. `pipes: [MyPipe]`
  if (pipesUsed.size) {
    let pipesExpr: o.Expression = o.literalArr(Array.from(pipesUsed));
    if (meta.wrapDirectivesAndPipesInClosure) {
      pipesExpr = o.fn([], [new o.ReturnStatement(pipesExpr)]);
    }
    definitionMap.set('pipes', pipesExpr);
  }

  if (meta.encapsulation === null) {
    meta.encapsulation = core.ViewEncapsulation.Emulated;
  }

  // e.g. `styles: [str1, str2]`
  if (meta.styles && meta.styles.length) {
    const styleValues = meta.encapsulation == core.ViewEncapsulation.Emulated ?
        compileStyles(meta.styles, CONTENT_ATTR, HOST_ATTR) :
        meta.styles;
    const strings = styleValues.map(str => o.literal(str));
    definitionMap.set('styles', o.literalArr(strings));
  } else if (meta.encapsulation === core.ViewEncapsulation.Emulated) {
    // If there is no style, don't generate css selectors on elements
    meta.encapsulation = core.ViewEncapsulation.None;
  }

  // Only set view encapsulation if it's not the default value
  if (meta.encapsulation !== core.ViewEncapsulation.Emulated) {
    definitionMap.set('encapsulation', o.literal(meta.encapsulation));
  }

  // e.g. `animation: [trigger('123', [])]`
  if (meta.animations !== null) {
    definitionMap.set(
        'data', o.literalMap([{key: 'animation', value: meta.animations, quoted: false}]));
  }

  // Only set the change detection flag if it's defined and it's not the default.
  if (changeDetection != null && changeDetection !== core.ChangeDetectionStrategy.Default) {
    definitionMap.set('changeDetection', o.literal(changeDetection));
  }

  // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
  // string literal, which must be on one line.
  const selectorForType = (meta.selector || '').replace(/\n/g, '');

  const expression = o.importExpr(R3.defineComponent).callFn([definitionMap.toLiteralMap()]);
  const type = createTypeForDef(meta, R3.ComponentDefWithMeta);

  return {expression, type, statements};
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
    template: {nodes: render3Ast.nodes},
    directives: [],
    pipes: typeMapToExpressionMap(pipeTypeByName, outputCtx),
    viewQueries: queriesFromGlobalMetadata(component.viewQueries, outputCtx),
    wrapDirectivesAndPipesInClosure: false,
    styles: (summary.template && summary.template.styles) || EMPTY_ARRAY,
    encapsulation:
        (summary.template && summary.template.encapsulation) || core.ViewEncapsulation.Emulated,
    interpolation: DEFAULT_INTERPOLATION_CONFIG,
    animations: null,
    viewProviders:
        component.viewProviders.length > 0 ? new o.WrappedNodeExpr(component.viewProviders) : null,
    relativeContextFilePath: '',
    i18nUseExternalIds: true,
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
    host: {
      attributes: directive.hostAttributes,
      listeners: summary.hostListeners,
      properties: summary.hostProperties,
    },
    inputs: directive.inputs,
    outputs: directive.outputs,
    usesInheritance: false,
    exportAs: null,
    providers: directive.providers.length > 0 ? new o.WrappedNodeExpr(directive.providers) : null
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

function prepareQueryParams(query: R3QueryMetadata, constantPool: ConstantPool): o.Expression[] {
  const parameters = [
    getQueryPredicate(query, constantPool),
    o.literal(query.descendants),
  ];
  if (query.read) {
    parameters.push(query.read);
  }
  return parameters;
}

function createQueryDefinition(query: R3QueryMetadata, constantPool: ConstantPool): o.Expression {
  return o.importExpr(R3.query).callFn(prepareQueryParams(query, constantPool));
}

// Turn a directive selector into an R3-compatible selector for directive def
function createDirectiveSelector(selector: string | null): o.Expression {
  return asLiteral(core.parseSelectorToR3Selector(selector));
}

function convertAttributesToExpressions(attributes: any): o.Expression[] {
  const values: o.Expression[] = [];
  for (let key of Object.getOwnPropertyNames(attributes)) {
    const value = attributes[key];
    values.push(o.literal(key), o.literal(value));
  }
  return values;
}

// Return a contentQueries function or null if one is not necessary.
function createContentQueriesFunction(
    meta: R3DirectiveMetadata, constantPool: ConstantPool): o.Expression|null {
  if (meta.queries.length) {
    const statements: o.Statement[] = meta.queries.map((query: R3QueryMetadata) => {
      const queryDefinition = createQueryDefinition(query, constantPool);
      return o.importExpr(R3.registerContentQuery)
          .callFn([queryDefinition, o.variable('dirIndex')])
          .toStmt();
    });
    const typeName = meta.name;
    const parameters = [new o.FnParam('dirIndex', o.NUMBER_TYPE)];
    return o.fn(
        parameters, statements, o.INFERRED_TYPE, null,
        typeName ? `${typeName}_ContentQueries` : null);
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

    // const $instance$ = $r3$.ɵload(dirIndex);
    statements.push(directiveInstanceVar.set(o.importExpr(R3.load).callFn([o.variable('dirIndex')]))
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

function stringAsType(str: string): o.Type {
  return o.expressionType(o.literal(str));
}

function stringMapAsType(map: {[key: string]: string | string[]}): o.Type {
  const mapValues = Object.keys(map).map(key => {
    const value = Array.isArray(map[key]) ? map[key][0] : map[key];
    return {
      key,
      value: o.literal(value),
      quoted: true,
    };
  });
  return o.expressionType(o.literalMap(mapValues));
}

function stringArrayAsType(arr: string[]): o.Type {
  return arr.length > 0 ? o.expressionType(o.literalArr(arr.map(value => o.literal(value)))) :
                          o.NONE_TYPE;
}

function createTypeForDef(meta: R3DirectiveMetadata, typeBase: o.ExternalReference): o.Type {
  // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
  // string literal, which must be on one line.
  const selectorForType = (meta.selector || '').replace(/\n/g, '');

  return o.expressionType(o.importExpr(typeBase, [
    typeWithParameters(meta.type, meta.typeArgumentCount),
    stringAsType(selectorForType),
    meta.exportAs !== null ? stringArrayAsType(meta.exportAs) : o.NONE_TYPE,
    stringMapAsType(meta.inputs),
    stringMapAsType(meta.outputs),
    stringArrayAsType(meta.queries.map(q => q.propertyName)),
  ]));
}

// Define and update any view queries
function createViewQueriesFunction(
    meta: R3ComponentMetadata, constantPool: ConstantPool): o.Expression {
  const createStatements: o.Statement[] = [];
  const updateStatements: o.Statement[] = [];
  const tempAllocator = temporaryAllocator(updateStatements, TEMPORARY_NAME);

  meta.viewQueries.forEach((query: R3QueryMetadata) => {
    // creation, e.g. r3.createViewQuery(somePredicate, true);
    const queryDefinition =
        o.importExpr(R3.createViewQuery).callFn(prepareQueryParams(query, constantPool));
    createStatements.push(queryDefinition.toStmt());

    // update, e.g. (r3.queryRefresh(tmp = r3.loadViewQuery()) && (ctx.someDir = tmp));
    const temporary = tempAllocator();
    const getQueryList = o.importExpr(R3.loadViewQuery).callFn([]);
    const refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
    const updateDirective = o.variable(CONTEXT_NAME)
                                .prop(query.propertyName)
                                .set(query.first ? temporary.prop('first') : temporary);
    updateStatements.push(refresh.and(updateDirective).toStmt());
  });

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
    meta: R3DirectiveMetadata, elVarExp: o.ReadVarExpr, bindingContext: o.ReadVarExpr,
    staticAttributesAndValues: any[], styleBuilder: StylingBuilder, bindingParser: BindingParser,
    constantPool: ConstantPool, hostVarsCount: number): o.Expression|null {
  const createStatements: o.Statement[] = [];
  const updateStatements: o.Statement[] = [];

  let totalHostVarsCount = hostVarsCount;
  const hostBindingSourceSpan = meta.typeSourceSpan;
  const directiveSummary = metadataAsSummary(meta);

  // Calculate host event bindings
  const eventBindings =
      bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
  if (eventBindings && eventBindings.length) {
    const listeners = createHostListeners(bindingContext, eventBindings, meta);
    createStatements.push(...listeners);
  }

  // Calculate the host property bindings
  const bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);

  const bindingFn = (implicit: any, value: AST) => {
    return convertPropertyBinding(
        null, implicit, value, 'b', BindingForm.TrySimple, () => error('Unexpected interpolation'));
  };
  if (bindings) {
    const hostVarsCountFn = (numSlots: number): number => {
      const originalVarsCount = totalHostVarsCount;
      totalHostVarsCount += numSlots;
      return originalVarsCount;
    };
    const valueConverter = new ValueConverter(
        constantPool,
        /* new nodes are illegal here */ () => error('Unexpected node'), hostVarsCountFn,
        /* pipes are illegal here */ () => error('Unexpected pipe'));

    for (const binding of bindings) {
      const name = binding.name;
      const stylePrefix = getStylingPrefix(name);
      if (stylePrefix === 'style') {
        const {propertyName, unit} = parseNamedProperty(name);
        styleBuilder.registerStyleInput(propertyName, binding.expression, unit, binding.sourceSpan);
      } else if (stylePrefix === 'class') {
        styleBuilder.registerClassInput(
            parseNamedProperty(name).propertyName, binding.expression, binding.sourceSpan);
      } else {
        // resolve literal arrays and literal objects
        const value = binding.expression.visit(valueConverter);
        const bindingExpr = bindingFn(bindingContext, value);

        const {bindingName, instruction, isAttribute} = getBindingNameAndInstruction(binding);

        const securityContexts =
            bindingParser
                .calcPossibleSecurityContexts(meta.selector || '', bindingName, isAttribute)
                .filter(context => context !== core.SecurityContext.NONE);

        let sanitizerFn: o.ExternalExpr|null = null;
        if (securityContexts.length) {
          if (securityContexts.length === 2 &&
              securityContexts.indexOf(core.SecurityContext.URL) > -1 &&
              securityContexts.indexOf(core.SecurityContext.RESOURCE_URL) > -1) {
            // Special case for some URL attributes (such as "src" and "href") that may be a part of
            // different security contexts. In this case we use special santitization function and
            // select the actual sanitizer at runtime based on a tag name that is provided while
            // invoking sanitization function.
            sanitizerFn = o.importExpr(R3.sanitizeUrlOrResourceUrl);
          } else {
            sanitizerFn = resolveSanitizationFn(securityContexts[0], isAttribute);
          }
        }

        const instructionParams: o.Expression[] = [
          elVarExp, o.literal(bindingName), o.importExpr(R3.bind).callFn([bindingExpr.currValExpr])
        ];
        if (sanitizerFn) {
          instructionParams.push(sanitizerFn);
        }
        if (!isAttribute) {
          if (!sanitizerFn) {
            // append `null` in front of `nativeOnly` flag if no sanitizer fn defined
            instructionParams.push(o.literal(null));
          }
          // host bindings must have nativeOnly prop set to true
          instructionParams.push(o.literal(true));
        }

        updateStatements.push(...bindingExpr.stmts);
        updateStatements.push(o.importExpr(instruction).callFn(instructionParams).toStmt());
      }
    }

    // since we're dealing with directives/components and both have hostBinding
    // functions, we need to generate a special hostAttrs instruction that deals
    // with both the assignment of styling as well as static attributes to the host
    // element. The instruction below will instruct all initial styling (styling
    // that is inside of a host binding within a directive/component) to be attached
    // to the host element alongside any of the provided host attributes that were
    // collected earlier.
    const hostAttrs = convertAttributesToExpressions(staticAttributesAndValues);
    const hostInstruction = styleBuilder.buildHostAttrsInstruction(null, hostAttrs, constantPool);
    if (hostInstruction) {
      createStatements.push(createStylingStmt(hostInstruction, bindingContext, bindingFn));
    }

    if (styleBuilder.hasBindings) {
      // singular style/class bindings (things like `[style.prop]` and `[class.name]`)
      // MUST be registered on a given element within the component/directive
      // templateFn/hostBindingsFn functions. The instruction below will figure out
      // what all the bindings are and then generate the statements required to register
      // those bindings to the element via `elementStyling`.
      const elementStylingInstruction =
          styleBuilder.buildElementStylingInstruction(null, constantPool);
      if (elementStylingInstruction) {
        createStatements.push(
            createStylingStmt(elementStylingInstruction, bindingContext, bindingFn));
      }

      // finally each binding that was registered in the statement above will need to be added to
      // the update block of a component/directive templateFn/hostBindingsFn so that the bindings
      // are evaluated and updated for the element.
      styleBuilder.buildUpdateLevelInstructions(valueConverter).forEach(instruction => {
        updateStatements.push(createStylingStmt(instruction, bindingContext, bindingFn));
      });
    }
  }

  if (totalHostVarsCount) {
    createStatements.unshift(
        o.importExpr(R3.allocHostVars).callFn([o.literal(totalHostVarsCount)]).toStmt());
  }

  if (createStatements.length > 0 || updateStatements.length > 0) {
    const hostBindingsFnName = meta.name ? `${meta.name}_HostBindings` : null;
    const statements: o.Statement[] = [];
    if (createStatements.length > 0) {
      statements.push(renderFlagCheckIfStmt(core.RenderFlags.Create, createStatements));
    }
    if (updateStatements.length > 0) {
      statements.push(renderFlagCheckIfStmt(core.RenderFlags.Update, updateStatements));
    }
    return o.fn(
        [
          new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null),
          new o.FnParam(elVarExp.name !, o.NUMBER_TYPE)
        ],
        statements, o.INFERRED_TYPE, null, hostBindingsFnName);
  }

  return null;
}

function createStylingStmt(
    instruction: Instruction, bindingContext: any, bindingFn: Function): o.Statement {
  const params = instruction.buildParams(value => bindingFn(bindingContext, value).currValExpr);
  return o.importExpr(instruction.reference, null, instruction.sourceSpan)
      .callFn(params, instruction.sourceSpan)
      .toStmt();
}

function getBindingNameAndInstruction(binding: ParsedProperty):
    {bindingName: string, instruction: o.ExternalReference, isAttribute: boolean} {
  let bindingName = binding.name;
  let instruction !: o.ExternalReference;

  // Check to see if this is an attr binding or a property binding
  const attrMatches = bindingName.match(ATTR_REGEX);
  if (attrMatches) {
    bindingName = attrMatches[1];
    instruction = R3.elementAttribute;
  } else {
    if (binding.isAnimation) {
      bindingName = prepareSyntheticPropertyName(bindingName);
      // host bindings that have a synthetic property (e.g. @foo) should always be rendered
      // in the context of the component and not the parent. Therefore there is a special
      // compatibility instruction available for this purpose.
      instruction = R3.componentHostSyntheticProperty;
    } else {
      instruction = R3.elementProperty;
    }
  }

  return {bindingName, instruction, isAttribute: !!attrMatches};
}

function createHostListeners(
    bindingContext: o.Expression, eventBindings: ParsedEvent[],
    meta: R3DirectiveMetadata): o.Statement[] {
  return eventBindings.map(binding => {
    let bindingName = binding.name && sanitizeIdentifier(binding.name);
    const bindingFnName = binding.type === ParsedEventType.Animation ?
        prepareSyntheticListenerFunctionName(bindingName, binding.targetOrPhase) :
        bindingName;
    const handlerName =
        meta.name && bindingName ? `${meta.name}_${bindingFnName}_HostBindingHandler` : null;
    const params = prepareEventListenerParameters(
        BoundEvent.fromParsedEvent(binding), bindingContext, handlerName);
    const instruction =
        binding.type == ParsedEventType.Animation ? R3.componentHostSyntheticListener : R3.listener;
    return o.importExpr(instruction).callFn(params).toStmt();
  });
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

const HOST_REG_EXP = /^(?:\[([^\]]+)\])|(?:\(([^\)]+)\))$/;
// Represents the groups in the above regex.
const enum HostBindingGroup {
  // group 1: "prop" from "[prop]", or "attr.role" from "[attr.role]", or @anim from [@anim]
  Binding = 1,

  // group 2: "event" from "(event)"
  Event = 2,
}

export function parseHostBindings(host: {[key: string]: string}): {
  attributes: {[key: string]: string},
  listeners: {[key: string]: string},
  properties: {[key: string]: string},
} {
  const attributes: {[key: string]: string} = {};
  const listeners: {[key: string]: string} = {};
  const properties: {[key: string]: string} = {};

  Object.keys(host).forEach(key => {
    const value = host[key];
    const matches = key.match(HOST_REG_EXP);
    if (matches === null) {
      attributes[key] = value;
    } else if (matches[HostBindingGroup.Binding] != null) {
      // synthetic properties (the ones that have a `@` as a prefix)
      // are still treated the same as regular properties. Therefore
      // there is no point in storing them in a separate map.
      properties[matches[HostBindingGroup.Binding]] = value;
    } else if (matches[HostBindingGroup.Event] != null) {
      listeners[matches[HostBindingGroup.Event]] = value;
    }
  });

  return {attributes, listeners, properties};
}

function compileStyles(styles: string[], selector: string, hostSelector: string): string[] {
  const shadowCss = new ShadowCss();
  return styles.map(style => { return shadowCss !.shimCssText(style, selector, hostSelector); });
}

function parseNamedProperty(name: string): {propertyName: string, unit: string} {
  let unit = '';
  let propertyName = '';
  const index = name.indexOf('.');
  if (index > 0) {
    const unitIndex = name.lastIndexOf('.');
    if (unitIndex !== index) {
      unit = name.substring(unitIndex + 1, name.length);
      propertyName = name.substring(index + 1, unitIndex);
    } else {
      propertyName = name.substring(index + 1, name.length);
    }
  }
  return {propertyName, unit};
}
