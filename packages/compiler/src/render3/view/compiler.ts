/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {convertPropertyBinding} from '../../compiler_util/expression_converter';
import {ConstantPool} from '../../constant_pool';
import * as core from '../../core';
import {AST, ParsedEvent, ParsedEventType, ParsedProperty} from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import {ParseError, ParseSourceSpan, sanitizeIdentifier} from '../../parse_util';
import {isIframeSecuritySensitiveAttr} from '../../schema/dom_security_schema';
import {CssSelector} from '../../selector';
import {ShadowCss} from '../../shadow_css';
import {emitTemplateFn, transformTemplate} from '../../template/pipeline/src/emit';
import {ingest} from '../../template/pipeline/src/ingest';
import {USE_TEMPLATE_PIPELINE} from '../../template/pipeline/switch';
import {BindingParser} from '../../template_parser/binding_parser';
import {error} from '../../util';
import {BoundEvent} from '../r3_ast';
import {Identifiers as R3} from '../r3_identifiers';
import {prepareSyntheticListenerFunctionName, prepareSyntheticPropertyName, R3CompiledExpression, typeWithParameters} from '../util';

import {DeclarationListEmitMode, R3ComponentMetadata, R3DirectiveMetadata, R3HostMetadata, R3QueryMetadata, R3TemplateDependency} from './api';
import {MIN_STYLING_BINDING_SLOTS_REQUIRED, StylingBuilder, StylingInstructionCall} from './styling_builder';
import {BindingScope, makeBindingParser, prepareEventListenerParameters, renderFlagCheckIfStmt, resolveSanitizationFn, TemplateDefinitionBuilder, ValueConverter} from './template';
import {asLiteral, conditionallyCreateDirectiveBindingLiteral, CONTEXT_NAME, DefinitionMap, getInstructionStatements, getQueryPredicate, Instruction, RENDER_FLAGS, TEMPORARY_NAME, temporaryAllocator} from './util';


// This regex matches any binding names that contain the "attr." prefix, e.g. "attr.required"
// If there is a match, the first matching group will contain the attribute name to bind.
const ATTR_REGEX = /attr\.([^\]]+)/;


const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

function baseDirectiveFields(
    meta: R3DirectiveMetadata, constantPool: ConstantPool,
    bindingParser: BindingParser): DefinitionMap {
  const definitionMap = new DefinitionMap();
  const selectors = core.parseSelectorToR3Selector(meta.selector);

  // e.g. `type: MyDirective`
  definitionMap.set('type', meta.type.value);

  // e.g. `selectors: [['', 'someDir', '']]`
  if (selectors.length > 0) {
    definitionMap.set('selectors', asLiteral(selectors));
  }

  if (meta.queries.length > 0) {
    // e.g. `contentQueries: (rf, ctx, dirIndex) => { ... }
    definitionMap.set(
        'contentQueries', createContentQueriesFunction(meta.queries, constantPool, meta.name));
  }

  if (meta.viewQueries.length) {
    definitionMap.set(
        'viewQuery', createViewQueriesFunction(meta.viewQueries, constantPool, meta.name));
  }

  // e.g. `hostBindings: (rf, ctx) => { ... }
  definitionMap.set(
      'hostBindings',
      createHostBindingsFunction(
          meta.host, meta.typeSourceSpan, bindingParser, constantPool, meta.selector || '',
          meta.name, definitionMap));

  // e.g 'inputs: {a: 'a'}`
  definitionMap.set('inputs', conditionallyCreateDirectiveBindingLiteral(meta.inputs, true));

  // e.g 'outputs: {a: 'a'}`
  definitionMap.set('outputs', conditionallyCreateDirectiveBindingLiteral(meta.outputs));

  if (meta.exportAs !== null) {
    definitionMap.set('exportAs', o.literalArr(meta.exportAs.map(e => o.literal(e))));
  }

  if (meta.isStandalone) {
    definitionMap.set('standalone', o.literal(true));
  }

  return definitionMap;
}

/**
 * Add features to the definition map.
 */
function addFeatures(
    definitionMap: DefinitionMap,
    meta: R3DirectiveMetadata|R3ComponentMetadata<R3TemplateDependency>) {
  // e.g. `features: [NgOnChangesFeature]`
  const features: o.Expression[] = [];

  const providers = meta.providers;
  const viewProviders = (meta as R3ComponentMetadata<R3TemplateDependency>).viewProviders;
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
  if (meta.fullInheritance) {
    features.push(o.importExpr(R3.CopyDefinitionFeature));
  }
  if (meta.lifecycle.usesOnChanges) {
    features.push(o.importExpr(R3.NgOnChangesFeature));
  }
  // TODO: better way of differentiating component vs directive metadata.
  if (meta.hasOwnProperty('template') && meta.isStandalone) {
    features.push(o.importExpr(R3.StandaloneFeature));
  }
  if (meta.hostDirectives?.length) {
    features.push(o.importExpr(R3.HostDirectivesFeature).callFn([createHostDirectivesFeatureArg(
        meta.hostDirectives)]));
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
    bindingParser: BindingParser): R3CompiledExpression {
  const definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
  addFeatures(definitionMap, meta);
  const expression =
      o.importExpr(R3.defineDirective).callFn([definitionMap.toLiteralMap()], undefined, true);
  const type = createDirectiveType(meta);

  return {expression, type, statements: []};
}

/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export function compileComponentFromMetadata(
    meta: R3ComponentMetadata<R3TemplateDependency>, constantPool: ConstantPool,
    bindingParser: BindingParser): R3CompiledExpression {
  const definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
  addFeatures(definitionMap, meta);

  const selector = meta.selector && CssSelector.parse(meta.selector);
  const firstSelector = selector && selector[0];

  // e.g. `attr: ["class", ".my.app"]`
  // This is optional an only included if the first selector of a component specifies attributes.
  if (firstSelector) {
    const selectorAttributes = firstSelector.getAttrs();
    if (selectorAttributes.length) {
      definitionMap.set(
          'attrs',
          constantPool.getConstLiteral(
              o.literalArr(selectorAttributes.map(
                  value => value != null ? o.literal(value) : o.literal(undefined))),
              /* forceShared */ true));
    }
  }

  // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
  const templateTypeName = meta.name;
  const templateName = templateTypeName ? `${templateTypeName}_Template` : null;

  const changeDetection = meta.changeDetection;

  // Template compilation is currently conditional as we're in the process of rewriting it.
  if (!USE_TEMPLATE_PIPELINE) {
    // This is the main path currently used in compilation, which compiles the template with the
    // legacy `TemplateDefinitionBuilder`.

    const template = meta.template;
    const templateBuilder = new TemplateDefinitionBuilder(
        constantPool, BindingScope.createRootScope(), 0, templateTypeName, null, null, templateName,
        R3.namespaceHTML, meta.relativeContextFilePath, meta.i18nUseExternalIds);

    const templateFunctionExpression = templateBuilder.buildTemplateFunction(template.nodes, []);

    // We need to provide this so that dynamically generated components know what
    // projected content blocks to pass through to the component when it is
    //     instantiated.
    const ngContentSelectors = templateBuilder.getNgContentSelectors();
    if (ngContentSelectors) {
      definitionMap.set('ngContentSelectors', ngContentSelectors);
    }

    // e.g. `decls: 2`
    // definitionMap.set('decls', o.literal(tpl.root.decls!));
    definitionMap.set('decls', o.literal(templateBuilder.getConstCount()));

    // e.g. `vars: 2`
    // definitionMap.set('vars', o.literal(tpl.root.vars!));
    definitionMap.set('vars', o.literal(templateBuilder.getVarCount()));

    // Generate `consts` section of ComponentDef:
    // - either as an array:
    //   `consts: [['one', 'two'], ['three', 'four']]`
    // - or as a factory function in case additional statements are present (to support i18n):
    //   `consts: function() { var i18n_0; if (ngI18nClosureMode) {...} else {...} return [i18n_0];
    //   }`
    const {constExpressions, prepareStatements} = templateBuilder.getConsts();
    if (constExpressions.length > 0) {
      let constsExpr: o.LiteralArrayExpr|o.FunctionExpr = o.literalArr(constExpressions);
      // Prepare statements are present - turn `consts` into a function.
      if (prepareStatements.length > 0) {
        constsExpr = o.fn([], [...prepareStatements, new o.ReturnStatement(constsExpr)]);
      }
      definitionMap.set('consts', constsExpr);
    }

    definitionMap.set('template', templateFunctionExpression);
  } else {
    // This path compiles the template using the prototype template pipeline. First the template is
    // ingested into IR:
    const tpl = ingest(meta.name, meta.template.nodes);

    // Then the IR is transformed to prepare it for cod egeneration.
    transformTemplate(tpl);

    // Finally we emit the template function:
    const templateFn = emitTemplateFn(tpl, constantPool);
    definitionMap.set('decls', o.literal(tpl.root.decls as number));
    definitionMap.set('vars', o.literal(tpl.root.vars as number));
    if (tpl.consts.length > 0) {
      definitionMap.set('consts', o.literalArr(tpl.consts));
    }
    definitionMap.set('template', templateFn);
  }

  if (meta.declarations.length > 0) {
    definitionMap.set(
        'dependencies',
        compileDeclarationList(
            o.literalArr(meta.declarations.map(decl => decl.type)), meta.declarationListEmitMode));
  }

  if (meta.encapsulation === null) {
    meta.encapsulation = core.ViewEncapsulation.Emulated;
  }

  // e.g. `styles: [str1, str2]`
  if (meta.styles && meta.styles.length) {
    const styleValues = meta.encapsulation == core.ViewEncapsulation.Emulated ?
        compileStyles(meta.styles, CONTENT_ATTR, HOST_ATTR) :
        meta.styles;
    const styleNodes = styleValues.reduce((result, style) => {
      if (style.trim().length > 0) {
        result.push(constantPool.getConstLiteral(o.literal(style)));
      }
      return result;
    }, [] as o.Expression[]);

    if (styleNodes.length > 0) {
      definitionMap.set('styles', o.literalArr(styleNodes));
    }
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

  const expression =
      o.importExpr(R3.defineComponent).callFn([definitionMap.toLiteralMap()], undefined, true);
  const type = createComponentType(meta);

  return {expression, type, statements: []};
}

/**
 * Creates the type specification from the component meta. This type is inserted into .d.ts files
 * to be consumed by upstream compilations.
 */
export function createComponentType(meta: R3ComponentMetadata<R3TemplateDependency>): o.Type {
  const typeParams = createBaseDirectiveTypeParams(meta);
  typeParams.push(stringArrayAsType(meta.template.ngContentSelectors));
  typeParams.push(o.expressionType(o.literal(meta.isStandalone)));
  typeParams.push(createHostDirectivesType(meta));
  return o.expressionType(o.importExpr(R3.ComponentDeclaration, typeParams));
}

/**
 * Compiles the array literal of declarations into an expression according to the provided emit
 * mode.
 */
function compileDeclarationList(
    list: o.LiteralArrayExpr, mode: DeclarationListEmitMode): o.Expression {
  switch (mode) {
    case DeclarationListEmitMode.Direct:
      // directives: [MyDir],
      return list;
    case DeclarationListEmitMode.Closure:
      // directives: function () { return [MyDir]; }
      return o.fn([], [new o.ReturnStatement(list)]);
    case DeclarationListEmitMode.ClosureResolved:
      // directives: function () { return [MyDir].map(ng.resolveForwardRef); }
      const resolvedList = list.prop('map').callFn([o.importExpr(R3.resolveForwardRef)]);
      return o.fn([], [new o.ReturnStatement(resolvedList)]);
  }
}

function prepareQueryParams(query: R3QueryMetadata, constantPool: ConstantPool): o.Expression[] {
  const parameters = [getQueryPredicate(query, constantPool), o.literal(toQueryFlags(query))];
  if (query.read) {
    parameters.push(query.read);
  }
  return parameters;
}

/**
 * A set of flags to be used with Queries.
 *
 * NOTE: Ensure changes here are in sync with `packages/core/src/render3/interfaces/query.ts`
 */
export const enum QueryFlags {
  /**
   * No flags
   */
  none = 0b0000,

  /**
   * Whether or not the query should descend into children.
   */
  descendants = 0b0001,

  /**
   * The query can be computed statically and hence can be assigned eagerly.
   *
   * NOTE: Backwards compatibility with ViewEngine.
   */
  isStatic = 0b0010,

  /**
   * If the `QueryList` should fire change event only if actual change to query was computed (vs old
   * behavior where the change was fired whenever the query was recomputed, even if the recomputed
   * query resulted in the same list.)
   */
  emitDistinctChangesOnly = 0b0100,
}

/**
 * Translates query flags into `TQueryFlags` type in packages/core/src/render3/interfaces/query.ts
 * @param query
 */
function toQueryFlags(query: R3QueryMetadata): number {
  return (query.descendants ? QueryFlags.descendants : QueryFlags.none) |
      (query.static ? QueryFlags.isStatic : QueryFlags.none) |
      (query.emitDistinctChangesOnly ? QueryFlags.emitDistinctChangesOnly : QueryFlags.none);
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
    // creation, e.g. r3.contentQuery(dirIndex, somePredicate, true, null);
    createStatements.push(
        o.importExpr(R3.contentQuery)
            .callFn([o.variable('dirIndex'), ...prepareQueryParams(query, constantPool) as any])
            .toStmt());

    // update, e.g. (r3.queryRefresh(tmp = r3.loadQuery()) && (ctx.someDir = tmp));
    const temporary = tempAllocator();
    const getQueryList = o.importExpr(R3.loadQuery).callFn([]);
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

function stringMapAsLiteralExpression(map: {[key: string]: string|string[]}): o.LiteralMapExpr {
  const mapValues = Object.keys(map).map(key => {
    const value = Array.isArray(map[key]) ? map[key][0] : map[key];
    return {
      key,
      value: o.literal(value),
      quoted: true,
    };
  });

  return o.literalMap(mapValues);
}

function stringArrayAsType(arr: ReadonlyArray<string|null>): o.Type {
  return arr.length > 0 ? o.expressionType(o.literalArr(arr.map(value => o.literal(value)))) :
                          o.NONE_TYPE;
}

function createBaseDirectiveTypeParams(meta: R3DirectiveMetadata): o.Type[] {
  // On the type side, remove newlines from the selector as it will need to fit into a TypeScript
  // string literal, which must be on one line.
  const selectorForType = meta.selector !== null ? meta.selector.replace(/\n/g, '') : null;

  return [
    typeWithParameters(meta.type.type, meta.typeArgumentCount),
    selectorForType !== null ? stringAsType(selectorForType) : o.NONE_TYPE,
    meta.exportAs !== null ? stringArrayAsType(meta.exportAs) : o.NONE_TYPE,
    o.expressionType(getInputsTypeExpression(meta)),
    o.expressionType(stringMapAsLiteralExpression(meta.outputs)),
    stringArrayAsType(meta.queries.map(q => q.propertyName)),
  ];
}

function getInputsTypeExpression(meta: R3DirectiveMetadata): o.Expression {
  return o.literalMap(Object.keys(meta.inputs).map(key => {
    const value = meta.inputs[key];
    return {
      key,
      value: o.literalMap([
        {key: 'alias', value: o.literal(value.bindingPropertyName), quoted: true},
        {key: 'required', value: o.literal(value.required), quoted: true}
      ]),
      quoted: true
    };
  }));
}

/**
 * Creates the type specification from the directive meta. This type is inserted into .d.ts files
 * to be consumed by upstream compilations.
 */
export function createDirectiveType(meta: R3DirectiveMetadata): o.Type {
  const typeParams = createBaseDirectiveTypeParams(meta);
  // Directives have no NgContentSelectors slot, but instead express a `never` type
  // so that future fields align.
  typeParams.push(o.NONE_TYPE);
  typeParams.push(o.expressionType(o.literal(meta.isStandalone)));
  typeParams.push(createHostDirectivesType(meta));
  return o.expressionType(o.importExpr(R3.DirectiveDeclaration, typeParams));
}

// Define and update any view queries
function createViewQueriesFunction(
    viewQueries: R3QueryMetadata[], constantPool: ConstantPool, name?: string): o.Expression {
  const createStatements: o.Statement[] = [];
  const updateStatements: o.Statement[] = [];
  const tempAllocator = temporaryAllocator(updateStatements, TEMPORARY_NAME);

  viewQueries.forEach((query: R3QueryMetadata) => {
    // creation, e.g. r3.viewQuery(somePredicate, true);
    const queryDefinition =
        o.importExpr(R3.viewQuery).callFn(prepareQueryParams(query, constantPool));
    createStatements.push(queryDefinition.toStmt());

    // update, e.g. (r3.queryRefresh(tmp = r3.loadQuery()) && (ctx.someDir = tmp));
    const temporary = tempAllocator();
    const getQueryList = o.importExpr(R3.loadQuery).callFn([]);
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
    bindingParser: BindingParser, constantPool: ConstantPool, selector: string, name: string,
    definitionMap: DefinitionMap): o.Expression|null {
  const bindingContext = o.variable(CONTEXT_NAME);
  const styleBuilder = new StylingBuilder(bindingContext);

  const {styleAttr, classAttr} = hostBindingsMetadata.specialAttributes;
  if (styleAttr !== undefined) {
    styleBuilder.registerStyleAttr(styleAttr);
  }
  if (classAttr !== undefined) {
    styleBuilder.registerClassAttr(classAttr);
  }

  const createInstructions: Instruction[] = [];
  const updateInstructions: Instruction[] = [];
  const updateVariables: o.Statement[] = [];

  const hostBindingSourceSpan = typeSourceSpan;

  // Calculate host event bindings
  const eventBindings = bindingParser.createDirectiveHostEventAsts(
      hostBindingsMetadata.listeners, hostBindingSourceSpan);
  if (eventBindings && eventBindings.length) {
    createInstructions.push(...createHostListeners(eventBindings, name));
  }

  // Calculate the host property bindings
  const bindings = bindingParser.createBoundHostProperties(
      hostBindingsMetadata.properties, hostBindingSourceSpan);
  const allOtherBindings: ParsedProperty[] = [];

  // We need to calculate the total amount of binding slots required by
  // all the instructions together before any value conversions happen.
  // Value conversions may require additional slots for interpolation and
  // bindings with pipes. These calculates happen after this block.
  let totalHostVarsCount = 0;
  bindings && bindings.forEach((binding: ParsedProperty) => {
    const stylingInputWasSet = styleBuilder.registerInputBasedOnName(
        binding.name, binding.expression, hostBindingSourceSpan);
    if (stylingInputWasSet) {
      totalHostVarsCount += MIN_STYLING_BINDING_SLOTS_REQUIRED;
    } else {
      allOtherBindings.push(binding);
      totalHostVarsCount++;
    }
  });

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

  const propertyBindings: o.Expression[][] = [];
  const attributeBindings: o.Expression[][] = [];
  const syntheticHostBindings: o.Expression[][] = [];

  for (const binding of allOtherBindings) {
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
        // of different security contexts. In this case we use special sanitization function and
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
    } else {
      // If there was no sanitization function found based on the security context
      // of an attribute/property binding - check whether this attribute/property is
      // one of the security-sensitive <iframe> attributes.
      // Note: for host bindings defined on a directive, we do not try to find all
      // possible places where it can be matched, so we can not determine whether
      // the host element is an <iframe>. In this case, if an attribute/binding
      // name is in the `IFRAME_SECURITY_SENSITIVE_ATTRS` set - append a validation
      // function, which would be invoked at runtime and would have access to the
      // underlying DOM element, check if it's an <iframe> and if so - runs extra checks.
      if (isIframeSecuritySensitiveAttr(bindingName)) {
        instructionParams.push(o.importExpr(R3.validateIframeAttribute));
      }
    }

    updateVariables.push(...bindingExpr.stmts);

    if (instruction === R3.hostProperty) {
      propertyBindings.push(instructionParams);
    } else if (instruction === R3.attribute) {
      attributeBindings.push(instructionParams);
    } else if (instruction === R3.syntheticHostProperty) {
      syntheticHostBindings.push(instructionParams);
    } else {
      updateInstructions.push({reference: instruction, paramsOrFn: instructionParams, span: null});
    }
  }

  for (const bindingParams of propertyBindings) {
    updateInstructions.push({reference: R3.hostProperty, paramsOrFn: bindingParams, span: null});
  }

  for (const bindingParams of attributeBindings) {
    updateInstructions.push({reference: R3.attribute, paramsOrFn: bindingParams, span: null});
  }

  for (const bindingParams of syntheticHostBindings) {
    updateInstructions.push(
        {reference: R3.syntheticHostProperty, paramsOrFn: bindingParams, span: null});
  }

  // since we're dealing with directives/components and both have hostBinding
  // functions, we need to generate a special hostAttrs instruction that deals
  // with both the assignment of styling as well as static attributes to the host
  // element. The instruction below will instruct all initial styling (styling
  // that is inside of a host binding within a directive/component) to be attached
  // to the host element alongside any of the provided host attributes that were
  // collected earlier.
  const hostAttrs = convertAttributesToExpressions(hostBindingsMetadata.attributes);
  styleBuilder.assignHostAttrs(hostAttrs, definitionMap);

  if (styleBuilder.hasBindings) {
    // finally each binding that was registered in the statement above will need to be added to
    // the update block of a component/directive templateFn/hostBindingsFn so that the bindings
    // are evaluated and updated for the element.
    styleBuilder.buildUpdateLevelInstructions(getValueConverter()).forEach(instruction => {
      for (const call of instruction.calls) {
        // we subtract a value of `1` here because the binding slot was already allocated
        // at the top of this method when all the input bindings were counted.
        totalHostVarsCount +=
            Math.max(call.allocateBindingSlots - MIN_STYLING_BINDING_SLOTS_REQUIRED, 0);

        updateInstructions.push({
          reference: instruction.reference,
          paramsOrFn: convertStylingCall(call, bindingContext, bindingFn),
          span: null
        });
      }
    });
  }

  if (totalHostVarsCount) {
    definitionMap.set('hostVars', o.literal(totalHostVarsCount));
  }

  if (createInstructions.length > 0 || updateInstructions.length > 0) {
    const hostBindingsFnName = name ? `${name}_HostBindings` : null;
    const statements: o.Statement[] = [];
    if (createInstructions.length > 0) {
      statements.push(renderFlagCheckIfStmt(
          core.RenderFlags.Create, getInstructionStatements(createInstructions)));
    }
    if (updateInstructions.length > 0) {
      statements.push(renderFlagCheckIfStmt(
          core.RenderFlags.Update,
          updateVariables.concat(getInstructionStatements(updateInstructions))));
    }
    return o.fn(
        [new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(CONTEXT_NAME, null)], statements,
        o.INFERRED_TYPE, null, hostBindingsFnName);
  }

  return null;
}

function bindingFn(implicit: any, value: AST) {
  return convertPropertyBinding(null, implicit, value, 'b');
}

function convertStylingCall(
    call: StylingInstructionCall, bindingContext: any, bindingFn: Function) {
  return call.params(value => bindingFn(bindingContext, value).currValExpr);
}

function getBindingNameAndInstruction(binding: ParsedProperty):
    {bindingName: string, instruction: o.ExternalReference, isAttribute: boolean} {
  let bindingName = binding.name;
  let instruction!: o.ExternalReference;

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
      instruction = R3.syntheticHostProperty;
    } else {
      instruction = R3.hostProperty;
    }
  }

  return {bindingName, instruction, isAttribute: !!attrMatches};
}

function createHostListeners(eventBindings: ParsedEvent[], name?: string): Instruction[] {
  const listenerParams: o.Expression[][] = [];
  const syntheticListenerParams: o.Expression[][] = [];
  const instructions: Instruction[] = [];

  for (const binding of eventBindings) {
    let bindingName = binding.name && sanitizeIdentifier(binding.name);
    const bindingFnName = binding.type === ParsedEventType.Animation ?
        prepareSyntheticListenerFunctionName(bindingName, binding.targetOrPhase) :
        bindingName;
    const handlerName = name && bindingName ? `${name}_${bindingFnName}_HostBindingHandler` : null;
    const params = prepareEventListenerParameters(BoundEvent.fromParsedEvent(binding), handlerName);

    if (binding.type == ParsedEventType.Animation) {
      syntheticListenerParams.push(params);
    } else {
      listenerParams.push(params);
    }
  }

  for (const params of syntheticListenerParams) {
    instructions.push({reference: R3.syntheticHostListener, paramsOrFn: params, span: null});
  }

  for (const params of listenerParams) {
    instructions.push({reference: R3.listener, paramsOrFn: params, span: null});
  }

  return instructions;
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

export function parseHostBindings(host: {[key: string]: string|o.Expression}): ParsedHostBindings {
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
  // TODO: abstract out host bindings verification logic and use it instead of
  // creating events and properties ASTs to detect errors (FW-996)
  const bindingParser = makeBindingParser();
  bindingParser.createDirectiveHostEventAsts(bindings.listeners, sourceSpan);
  bindingParser.createBoundHostProperties(bindings.properties, sourceSpan);
  return bindingParser.errors;
}

function compileStyles(styles: string[], selector: string, hostSelector: string): string[] {
  const shadowCss = new ShadowCss();
  return styles.map(style => {
    return shadowCss!.shimCssText(style, selector, hostSelector);
  });
}

function createHostDirectivesType(meta: R3DirectiveMetadata): o.Type {
  if (!meta.hostDirectives?.length) {
    return o.NONE_TYPE;
  }

  return o.expressionType(o.literalArr(meta.hostDirectives.map(hostMeta => o.literalMap([
    {key: 'directive', value: o.typeofExpr(hostMeta.directive.type), quoted: false},
    {key: 'inputs', value: stringMapAsLiteralExpression(hostMeta.inputs || {}), quoted: false},
    {key: 'outputs', value: stringMapAsLiteralExpression(hostMeta.outputs || {}), quoted: false},
  ]))));
}

function createHostDirectivesFeatureArg(
    hostDirectives: NonNullable<R3DirectiveMetadata['hostDirectives']>): o.Expression {
  const expressions: o.Expression[] = [];
  let hasForwardRef = false;

  for (const current of hostDirectives) {
    // Use a shorthand if there are no inputs or outputs.
    if (!current.inputs && !current.outputs) {
      expressions.push(current.directive.type);
    } else {
      const keys = [{key: 'directive', value: current.directive.type, quoted: false}];

      if (current.inputs) {
        const inputsLiteral = createHostDirectivesMappingArray(current.inputs);
        if (inputsLiteral) {
          keys.push({key: 'inputs', value: inputsLiteral, quoted: false});
        }
      }

      if (current.outputs) {
        const outputsLiteral = createHostDirectivesMappingArray(current.outputs);
        if (outputsLiteral) {
          keys.push({key: 'outputs', value: outputsLiteral, quoted: false});
        }
      }

      expressions.push(o.literalMap(keys));
    }

    if (current.isForwardReference) {
      hasForwardRef = true;
    }
  }

  // If there's a forward reference, we generate a `function() { return [HostDir] }`,
  // otherwise we can save some bytes by using a plain array, e.g. `[HostDir]`.
  return hasForwardRef ?
      new o.FunctionExpr([], [new o.ReturnStatement(o.literalArr(expressions))]) :
      o.literalArr(expressions);
}

/**
 * Converts an input/output mapping object literal into an array where the even keys are the
 * public name of the binding and the odd ones are the name it was aliased to. E.g.
 * `{inputOne: 'aliasOne', inputTwo: 'aliasTwo'}` will become
 * `['inputOne', 'aliasOne', 'inputTwo', 'aliasTwo']`.
 *
 * This conversion is necessary, because hosts bind to the public name of the host directive and
 * keeping the mapping in an object literal will break for apps using property renaming.
 */
export function createHostDirectivesMappingArray(mapping: Record<string, string>):
    o.LiteralArrayExpr|null {
  const elements: o.LiteralExpr[] = [];

  for (const publicName in mapping) {
    if (mapping.hasOwnProperty(publicName)) {
      elements.push(o.literal(publicName), o.literal(mapping[publicName]));
    }
  }

  return elements.length > 0 ? o.literalArr(elements) : null;
}
