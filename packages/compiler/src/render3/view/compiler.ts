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
import {AST, Interpolation, ParsedEvent, ParsedEventType, ParsedProperty} from '../../expression_parser/ast';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../ml_parser/interpolation_config';
import * as o from '../../output/output_ast';
import {ParseError, ParseSourceSpan, typeSourceSpan} from '../../parse_util';
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

import {R3ComponentDef, R3ComponentMetadata, R3DirectiveDef, R3DirectiveMetadata, R3HostMetadata, R3QueryMetadata} from './api';
import {StylingBuilder, StylingInstruction} from './styling_builder';
import {BindingScope, TemplateDefinitionBuilder, ValueConverter, makeBindingParser, prepareEventListenerParameters, renderFlagCheckIfStmt, resolveSanitizationFn} from './template';
import {CONTEXT_NAME, DefinitionMap, RENDER_FLAGS, TEMPORARY_NAME, asLiteral, chainedInstruction, conditionallyCreateMapObjectLiteral, getQueryPredicate, temporaryAllocator} from './util';

const EMPTY_ARRAY: any[] = [];

// This regex matches any binding names that contain the "attr." prefix, e.g. "attr.required"
// If there is a match, the first matching group will contain the attribute name to bind.
const ATTR_REGEX = /attr\.([^\]]+)/;

function getStylingPrefix(name: string): string {
  return name.substring(0, 5);  // style or class
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

  if (meta.queries.length > 0) {
    // e.g. `contentQueries: (rf, ctx, dirIndex) => { ... }
    definitionMap.set(
        'contentQueries', createContentQueriesFunction(meta.queries, constantPool, meta.name));
  }

  if (meta.viewQueries.length) {
    definitionMap.set(
        'viewQuery', createViewQueriesFunction(meta.viewQueries, constantPool, meta.name));
  }

  // e.g. `hostBindings: (rf, ctx, elIndex) => { ... }
  definitionMap.set(
      'hostBindings', createHostBindingsFunction(
                          meta.host, meta.typeSourceSpan, bindingParser, constantPool,
                          meta.selector || '', meta.name));

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
  // e.g. `features: [NgOnChangesFeature()]`
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
  if (meta.lifecycle.usesOnChanges) {
    features.push(o.importExpr(R3.NgOnChangesFeature).callFn(EMPTY_ARRAY));
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
  name: string;
  type: o.Expression;
  typeSourceSpan: ParseSourceSpan;
  inputs?: {[key: string]: string | [string, string]};
  outputs?: {[key: string]: string};
  viewQueries?: R3QueryMetadata[];
  queries?: R3QueryMetadata[];
  host?: R3HostMetadata;
}

/**
 * Compile a base definition for the render3 runtime as defined by {@link R3BaseRefMetadata}
 * @param meta the metadata used for compilation.
 */
export function compileBaseDefFromMetadata(
    meta: R3BaseRefMetaData, constantPool: ConstantPool, bindingParser: BindingParser) {
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
  if (meta.viewQueries && meta.viewQueries.length > 0) {
    definitionMap.set('viewQuery', createViewQueriesFunction(meta.viewQueries, constantPool));
  }
  if (meta.queries && meta.queries.length > 0) {
    definitionMap.set('contentQueries', createContentQueriesFunction(meta.queries, constantPool));
  }
  if (meta.host) {
    definitionMap.set(
        'hostBindings',
        createHostBindingsFunction(
            meta.host, meta.typeSourceSpan, bindingParser, constantPool, meta.name));
  }

  const expression = o.importExpr(R3.defineBase).callFn([definitionMap.toLiteralMap()]);
  const type = new o.ExpressionType(
      o.importExpr(R3.BaseDef), /* modifiers */ null, [o.expressionType(meta.type)]);

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
  // The global-analysis based Ivy mode in ngc is no longer utilized/supported.
  throw new Error('unsupported');
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
      static: !!query.static
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
  const parameters = [getQueryPredicate(query, constantPool), o.literal(query.descendants)];
  if (query.read) {
    parameters.push(query.read);
  }
  return parameters;
}

// Turn a directive selector into an R3-compatible selector for directive def
function createDirectiveSelector(selector: string | null): o.Expression {
  return asLiteral(core.parseSelectorToR3Selector(selector));
}

function convertAttributesToExpressions(attributes: {[name: string]: o.Expression}):
    o.Expression[] {
  const values: o.Expression[] = [];
  for (let key of Object.getOwnPropertyNames(attributes)) {
    const value = attributes[key];
    values.push(o.literal(key), value);
  }
  return values;
}

// Define and update any content queries
function createContentQueriesFunction(
    queries: R3QueryMetadata[], constantPool: ConstantPool, name?: string): o.Expression {
  const createStatements: o.Statement[] = [];
  const updateStatements: o.Statement[] = [];
  const tempAllocator = temporaryAllocator(updateStatements, TEMPORARY_NAME);

  for (const query of queries) {
    const queryInstruction = query.static ? R3.staticContentQuery : R3.contentQuery;

    // creation, e.g. r3.contentQuery(dirIndex, somePredicate, true, null);
    createStatements.push(
        o.importExpr(queryInstruction)
            .callFn([o.variable('dirIndex'), ...prepareQueryParams(query, constantPool) as any])
            .toStmt());

    // update, e.g. (r3.queryRefresh(tmp = r3.loadContentQuery()) && (ctx.someDir = tmp));
    const temporary = tempAllocator();
    const getQueryList = o.importExpr(R3.loadContentQuery).callFn([]);
    const refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
    const updateDirective = o.variable(CONTEXT_NAME)
                                .prop(query.propertyName)
                                .set(query.first ? temporary.prop('first') : temporary);
    updateStatements.push(refresh.and(updateDirective).toStmt());
  }

  const contentQueriesFnName = name ? `${name}_ContentQueries` : null;
  return o.fn(
      [
        new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null),
        new o.FnParam('dirIndex', null)
      ],
      [
        renderFlagCheckIfStmt(core.RenderFlags.Create, createStatements),
        renderFlagCheckIfStmt(core.RenderFlags.Update, updateStatements)
      ],
      o.INFERRED_TYPE, null, contentQueriesFnName);
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
    viewQueries: R3QueryMetadata[], constantPool: ConstantPool, name?: string): o.Expression {
  const createStatements: o.Statement[] = [];
  const updateStatements: o.Statement[] = [];
  const tempAllocator = temporaryAllocator(updateStatements, TEMPORARY_NAME);

  viewQueries.forEach((query: R3QueryMetadata) => {
    const queryInstruction = query.static ? R3.staticViewQuery : R3.viewQuery;

    // creation, e.g. r3.viewQuery(somePredicate, true);
    const queryDefinition =
        o.importExpr(queryInstruction).callFn(prepareQueryParams(query, constantPool));
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

  const viewQueryFnName = name ? `${name}_Query` : null;
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
    hostBindingsMetadata: R3HostMetadata, typeSourceSpan: ParseSourceSpan,
    bindingParser: BindingParser, constantPool: ConstantPool, selector: string,
    name?: string): o.Expression|null {
  // Initialize hostVarsCount to number of bound host properties (interpolations illegal)
  const hostVarsCount = Object.keys(hostBindingsMetadata.properties).length;
  const elVarExp = o.variable('elIndex');
  const bindingContext = o.variable(CONTEXT_NAME);
  const styleBuilder = new StylingBuilder(elVarExp, bindingContext);

  const {styleAttr, classAttr} = hostBindingsMetadata.specialAttributes;
  if (styleAttr !== undefined) {
    styleBuilder.registerStyleAttr(styleAttr);
  }
  if (classAttr !== undefined) {
    styleBuilder.registerClassAttr(classAttr);
  }

  const createStatements: o.Statement[] = [];
  const updateStatements: o.Statement[] = [];

  let totalHostVarsCount = hostVarsCount;
  const hostBindingSourceSpan = typeSourceSpan;
  const directiveSummary = metadataAsSummary(hostBindingsMetadata);

  let valueConverter: ValueConverter;
  const getValueConverter = () => {
    if (!valueConverter) {
      const hostVarsCountFn = (numSlots: number): number => {
        const originalVarsCount = totalHostVarsCount;
        totalHostVarsCount += numSlots;
        return originalVarsCount;
      };
      valueConverter = new ValueConverter(
          constantPool,
          () => error('Unexpected node'),  // new nodes are illegal here
          hostVarsCountFn,
          () => error('Unexpected pipe'));  // pipes are illegal here
    }
    return valueConverter;
  };

  // Calculate host event bindings
  const eventBindings =
      bindingParser.createDirectiveHostEventAsts(directiveSummary, hostBindingSourceSpan);
  if (eventBindings && eventBindings.length) {
    const listeners = createHostListeners(eventBindings, name);
    createStatements.push(...listeners);
  }

  // Calculate the host property bindings
  const bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
  const propertyBindings: o.Expression[][] = [];
  const attributeBindings: o.Expression[][] = [];
  const syntheticHostBindings: o.Expression[][] = [];

  bindings && bindings.forEach((binding: ParsedProperty) => {
    const name = binding.name;
    const stylingInputWasSet =
        styleBuilder.registerInputBasedOnName(name, binding.expression, binding.sourceSpan);
    if (!stylingInputWasSet) {
      // resolve literal arrays and literal objects
      const value = binding.expression.visit(getValueConverter());
      const bindingExpr = bindingFn(bindingContext, value);

      const {bindingName, instruction, isAttribute} = getBindingNameAndInstruction(binding);

      const securityContexts =
          bindingParser.calcPossibleSecurityContexts(selector, bindingName, isAttribute)
              .filter(context => context !== core.SecurityContext.NONE);

      let sanitizerFn: o.ExternalExpr|null = null;
      if (securityContexts.length) {
        if (securityContexts.length === 2 &&
            securityContexts.indexOf(core.SecurityContext.URL) > -1 &&
            securityContexts.indexOf(core.SecurityContext.RESOURCE_URL) > -1) {
          // Special case for some URL attributes (such as "src" and "href") that may be a part
          // of different security contexts. In this case we use special santitization function and
          // select the actual sanitizer at runtime based on a tag name that is provided while
          // invoking sanitization function.
          sanitizerFn = o.importExpr(R3.sanitizeUrlOrResourceUrl);
        } else {
          sanitizerFn = resolveSanitizationFn(securityContexts[0], isAttribute);
        }
      }
      const instructionParams = [o.literal(bindingName), bindingExpr.currValExpr];
      if (sanitizerFn) {
        instructionParams.push(sanitizerFn);
      }

      updateStatements.push(...bindingExpr.stmts);

      if (instruction === R3.hostProperty) {
        propertyBindings.push(instructionParams);
      } else if (instruction === R3.attribute) {
        attributeBindings.push(instructionParams);
      } else if (instruction === R3.updateSyntheticHostBinding) {
        syntheticHostBindings.push(instructionParams);
      } else {
        updateStatements.push(o.importExpr(instruction).callFn(instructionParams).toStmt());
      }
    }
  });

  if (propertyBindings.length > 0) {
    updateStatements.push(chainedInstruction(R3.hostProperty, propertyBindings).toStmt());
  }

  if (attributeBindings.length > 0) {
    updateStatements.push(chainedInstruction(R3.attribute, attributeBindings).toStmt());
  }

  if (syntheticHostBindings.length > 0) {
    updateStatements.push(
        chainedInstruction(R3.updateSyntheticHostBinding, syntheticHostBindings).toStmt());
  }

  // since we're dealing with directives/components and both have hostBinding
  // functions, we need to generate a special hostAttrs instruction that deals
  // with both the assignment of styling as well as static attributes to the host
  // element. The instruction below will instruct all initial styling (styling
  // that is inside of a host binding within a directive/component) to be attached
  // to the host element alongside any of the provided host attributes that were
  // collected earlier.
  const hostAttrs = convertAttributesToExpressions(hostBindingsMetadata.attributes);
  const hostInstruction = styleBuilder.buildHostAttrsInstruction(null, hostAttrs, constantPool);
  if (hostInstruction) {
    createStatements.push(createStylingStmt(hostInstruction, bindingContext, bindingFn));
  }

  if (styleBuilder.hasBindings) {
    // singular style/class bindings (things like `[style.prop]` and `[class.name]`)
    // MUST be registered on a given element within the component/directive
    // templateFn/hostBindingsFn functions. The instruction below will figure out
    // what all the bindings are and then generate the statements required to register
    // those bindings to the element via `styling`.
    const stylingInstruction = styleBuilder.buildStylingInstruction(null, constantPool);
    if (stylingInstruction) {
      createStatements.push(createStylingStmt(stylingInstruction, bindingContext, bindingFn));
    }

    // finally each binding that was registered in the statement above will need to be added to
    // the update block of a component/directive templateFn/hostBindingsFn so that the bindings
    // are evaluated and updated for the element.
    styleBuilder.buildUpdateLevelInstructions(getValueConverter()).forEach(instruction => {
      // we subtract a value of `1` here because the binding slot was already
      // allocated at the top of this method when all the input bindings were
      // counted.
      totalHostVarsCount += Math.max(instruction.allocateBindingSlots - 1, 0);
      updateStatements.push(createStylingStmt(instruction, bindingContext, bindingFn));
    });
  }

  if (totalHostVarsCount) {
    createStatements.unshift(
        o.importExpr(R3.allocHostVars).callFn([o.literal(totalHostVarsCount)]).toStmt());
  }

  if (createStatements.length > 0 || updateStatements.length > 0) {
    const hostBindingsFnName = name ? `${name}_HostBindings` : null;
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

function bindingFn(implicit: any, value: AST) {
  return convertPropertyBinding(
      null, implicit, value, 'b', BindingForm.TrySimple, () => error('Unexpected interpolation'));
}

function createStylingStmt(
    instruction: StylingInstruction, bindingContext: any, bindingFn: Function): o.Statement {
  const params = instruction.params(value => bindingFn(bindingContext, value).currValExpr);
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
    instruction = R3.attribute;
  } else {
    if (binding.isAnimation) {
      bindingName = prepareSyntheticPropertyName(bindingName);
      // host bindings that have a synthetic property (e.g. @foo) should always be rendered
      // in the context of the component and not the parent. Therefore there is a special
      // compatibility instruction available for this purpose.
      instruction = R3.updateSyntheticHostBinding;
    } else {
      instruction = R3.hostProperty;
    }
  }

  return {bindingName, instruction, isAttribute: !!attrMatches};
}

function createHostListeners(eventBindings: ParsedEvent[], name?: string): o.Statement[] {
  return eventBindings.map(binding => {
    let bindingName = binding.name && sanitizeIdentifier(binding.name);
    const bindingFnName = binding.type === ParsedEventType.Animation ?
        prepareSyntheticListenerFunctionName(bindingName, binding.targetOrPhase) :
        bindingName;
    const handlerName = name && bindingName ? `${name}_${bindingFnName}_HostBindingHandler` : null;
    const params = prepareEventListenerParameters(BoundEvent.fromParsedEvent(binding), handlerName);
    const instruction =
        binding.type == ParsedEventType.Animation ? R3.componentHostSyntheticListener : R3.listener;
    return o.importExpr(instruction).callFn(params).toStmt();
  });
}

function metadataAsSummary(meta: R3HostMetadata): CompileDirectiveSummary {
  // clang-format off
  return {
    // This is used by the BindingParser, which only deals with listeners and properties. There's no
    // need to pass attributes to it.
    hostAttributes: {},
    hostListeners: meta.listeners,
    hostProperties: meta.properties,
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

// Defines Host Bindings structure that contains attributes, listeners, and properties,
// parsed from the `host` object defined for a Type.
export interface ParsedHostBindings {
  attributes: {[key: string]: o.Expression};
  listeners: {[key: string]: string};
  properties: {[key: string]: string};
  specialAttributes: {styleAttr?: string; classAttr?: string;};
}

export function parseHostBindings(host: {[key: string]: string | o.Expression}):
    ParsedHostBindings {
  const attributes: {[key: string]: o.Expression} = {};
  const listeners: {[key: string]: string} = {};
  const properties: {[key: string]: string} = {};
  const specialAttributes: {styleAttr?: string; classAttr?: string;} = {};

  for (const key of Object.keys(host)) {
    const value = host[key];
    const matches = key.match(HOST_REG_EXP);

    if (matches === null) {
      switch (key) {
        case 'class':
          if (typeof value !== 'string') {
            // TODO(alxhub): make this a diagnostic.
            throw new Error(`Class binding must be string`);
          }
          specialAttributes.classAttr = value;
          break;
        case 'style':
          if (typeof value !== 'string') {
            // TODO(alxhub): make this a diagnostic.
            throw new Error(`Style binding must be string`);
          }
          specialAttributes.styleAttr = value;
          break;
        default:
          if (typeof value === 'string') {
            attributes[key] = o.literal(value);
          } else {
            attributes[key] = value;
          }
      }
    } else if (matches[HostBindingGroup.Binding] != null) {
      if (typeof value !== 'string') {
        // TODO(alxhub): make this a diagnostic.
        throw new Error(`Property binding must be string`);
      }
      // synthetic properties (the ones that have a `@` as a prefix)
      // are still treated the same as regular properties. Therefore
      // there is no point in storing them in a separate map.
      properties[matches[HostBindingGroup.Binding]] = value;
    } else if (matches[HostBindingGroup.Event] != null) {
      if (typeof value !== 'string') {
        // TODO(alxhub): make this a diagnostic.
        throw new Error(`Event binding must be string`);
      }
      listeners[matches[HostBindingGroup.Event]] = value;
    }
  }

  return {attributes, listeners, properties, specialAttributes};
}

/**
 * Verifies host bindings and returns the list of errors (if any). Empty array indicates that a
 * given set of host bindings has no errors.
 *
 * @param bindings set of host bindings to verify.
 * @param sourceSpan source span where host bindings were defined.
 * @returns array of errors associated with a given set of host bindings.
 */
export function verifyHostBindings(
    bindings: ParsedHostBindings, sourceSpan: ParseSourceSpan): ParseError[] {
  const summary = metadataAsSummary(bindings);
  // TODO: abstract out host bindings verification logic and use it instead of
  // creating events and properties ASTs to detect errors (FW-996)
  const bindingParser = makeBindingParser();
  bindingParser.createDirectiveHostEventAsts(summary, sourceSpan);
  bindingParser.createBoundHostProperties(summary, sourceSpan);
  return bindingParser.errors;
}

function compileStyles(styles: string[], selector: string, hostSelector: string): string[] {
  const shadowCss = new ShadowCss();
  return styles.map(style => { return shadowCss !.shimCssText(style, selector, hostSelector); });
}
