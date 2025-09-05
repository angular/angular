/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool} from '../../constant_pool';
import * as core from '../../core';
import * as o from '../../output/output_ast';
import {ParseError, ParseSourceSpan} from '../../parse_util';
import {CssSelector} from '../../directive_matching';
import {ShadowCss} from '../../shadow_css';
import {CompilationJobKind, TemplateCompilationMode} from '../../template/pipeline/src/compilation';
import {emitHostBindingFunction, emitTemplateFn, transform} from '../../template/pipeline/src/emit';
import {ingestComponent, ingestHostBinding} from '../../template/pipeline/src/ingest';
import {BindingParser} from '../../template_parser/binding_parser';
import {Identifiers as R3} from '../r3_identifiers';
import {R3CompiledExpression, typeWithParameters} from '../util';

import {
  DeclarationListEmitMode,
  DeferBlockDepsEmitMode,
  R3ComponentMetadata,
  R3DeferResolverFunctionMetadata,
  R3DirectiveMetadata,
  R3HostMetadata,
  R3TemplateDependency,
} from './api';
import {getTemplateSourceLocationsEnabled} from './config';
import {createContentQueriesFunction, createViewQueriesFunction} from './query_generation';
import {makeBindingParser} from './template';
import {asLiteral, conditionallyCreateDirectiveBindingLiteral, DefinitionMap} from './util';

const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;
const ANIMATE_LEAVE = `animate.leave`;

function baseDirectiveFields(
  meta: R3DirectiveMetadata,
  constantPool: ConstantPool,
  bindingParser: BindingParser,
): DefinitionMap {
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
      'contentQueries',
      createContentQueriesFunction(meta.queries, constantPool, meta.name),
    );
  }

  if (meta.viewQueries.length) {
    definitionMap.set(
      'viewQuery',
      createViewQueriesFunction(meta.viewQueries, constantPool, meta.name),
    );
  }

  // e.g. `hostBindings: (rf, ctx) => { ... }
  definitionMap.set(
    'hostBindings',
    createHostBindingsFunction(
      meta.host,
      meta.typeSourceSpan,
      bindingParser,
      constantPool,
      meta.selector || '',
      meta.name,
      definitionMap,
    ),
  );

  // e.g 'inputs: {a: 'a'}`
  definitionMap.set('inputs', conditionallyCreateDirectiveBindingLiteral(meta.inputs, true));

  // e.g 'outputs: {a: 'a'}`
  definitionMap.set('outputs', conditionallyCreateDirectiveBindingLiteral(meta.outputs));

  if (meta.exportAs !== null) {
    definitionMap.set('exportAs', o.literalArr(meta.exportAs.map((e) => o.literal(e))));
  }

  if (meta.isStandalone === false) {
    definitionMap.set('standalone', o.literal(false));
  }
  if (meta.isSignal) {
    definitionMap.set('signals', o.literal(true));
  }

  return definitionMap;
}

function hasAnimationHostBinding(
  meta: R3DirectiveMetadata | R3ComponentMetadata<R3TemplateDependency>,
): boolean {
  return (
    meta.host.attributes[ANIMATE_LEAVE] !== undefined ||
    meta.host.properties[ANIMATE_LEAVE] !== undefined ||
    meta.host.listeners[ANIMATE_LEAVE] !== undefined
  );
}

/**
 * Add features to the definition map.
 */
function addFeatures(
  definitionMap: DefinitionMap,
  meta: R3DirectiveMetadata | R3ComponentMetadata<R3TemplateDependency>,
) {
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
  // Note: host directives feature needs to be inserted before the
  // inheritance feature to ensure the correct execution order.
  if (meta.hostDirectives?.length) {
    features.push(
      o
        .importExpr(R3.HostDirectivesFeature)
        .callFn([createHostDirectivesFeatureArg(meta.hostDirectives)]),
    );
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
  if ('externalStyles' in meta && meta.externalStyles?.length) {
    const externalStyleNodes = meta.externalStyles.map((externalStyle) => o.literal(externalStyle));
    features.push(
      o.importExpr(R3.ExternalStylesFeature).callFn([o.literalArr(externalStyleNodes)]),
    );
  }

  if (features.length) {
    definitionMap.set('features', o.literalArr(features));
  }
}

/**
 * Compile a directive for the render3 runtime as defined by the `R3DirectiveMetadata`.
 */
export function compileDirectiveFromMetadata(
  meta: R3DirectiveMetadata,
  constantPool: ConstantPool,
  bindingParser: BindingParser,
): R3CompiledExpression {
  const definitionMap = baseDirectiveFields(meta, constantPool, bindingParser);
  addFeatures(definitionMap, meta);
  const expression = o
    .importExpr(R3.defineDirective)
    .callFn([definitionMap.toLiteralMap()], undefined, true);
  const type = createDirectiveType(meta);

  return {expression, type, statements: []};
}

/**
 * Compile a component for the render3 runtime as defined by the `R3ComponentMetadata`.
 */
export function compileComponentFromMetadata(
  meta: R3ComponentMetadata<R3TemplateDependency>,
  constantPool: ConstantPool,
  bindingParser: BindingParser,
): R3CompiledExpression {
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
          o.literalArr(
            selectorAttributes.map((value) =>
              value != null ? o.literal(value) : o.literal(undefined),
            ),
          ),
          /* forceShared */ true,
        ),
      );
    }
  }

  // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
  const templateTypeName = meta.name;

  let allDeferrableDepsFn: o.ReadVarExpr | null = null;
  if (
    meta.defer.mode === DeferBlockDepsEmitMode.PerComponent &&
    meta.defer.dependenciesFn !== null
  ) {
    const fnName = `${templateTypeName}_DeferFn`;
    constantPool.statements.push(
      new o.DeclareVarStmt(fnName, meta.defer.dependenciesFn, undefined, o.StmtModifier.Final),
    );
    allDeferrableDepsFn = o.variable(fnName);
  }

  const compilationMode =
    meta.isStandalone && !meta.hasDirectiveDependencies
      ? TemplateCompilationMode.DomOnly
      : TemplateCompilationMode.Full;

  // First the template is ingested into IR:
  const tpl = ingestComponent(
    meta.name,
    meta.template.nodes,
    constantPool,
    compilationMode,
    meta.relativeContextFilePath,
    meta.i18nUseExternalIds,
    meta.defer,
    allDeferrableDepsFn,
    meta.relativeTemplatePath,
    getTemplateSourceLocationsEnabled(),
  );

  // Then the IR is transformed to prepare it for cod egeneration.
  transform(tpl, CompilationJobKind.Tmpl);

  // Finally we emit the template function:
  const templateFn = emitTemplateFn(tpl, constantPool);

  if (tpl.contentSelectors !== null) {
    definitionMap.set('ngContentSelectors', tpl.contentSelectors);
  }

  definitionMap.set('decls', o.literal(tpl.root.decls as number));
  definitionMap.set('vars', o.literal(tpl.root.vars as number));
  if (tpl.consts.length > 0) {
    if (tpl.constsInitializers.length > 0) {
      definitionMap.set(
        'consts',
        o.arrowFn([], [...tpl.constsInitializers, new o.ReturnStatement(o.literalArr(tpl.consts))]),
      );
    } else {
      definitionMap.set('consts', o.literalArr(tpl.consts));
    }
  }
  definitionMap.set('template', templateFn);

  if (
    meta.declarationListEmitMode !== DeclarationListEmitMode.RuntimeResolved &&
    meta.declarations.length > 0
  ) {
    definitionMap.set(
      'dependencies',
      compileDeclarationList(
        o.literalArr(meta.declarations.map((decl) => decl.type)),
        meta.declarationListEmitMode,
      ),
    );
  } else if (meta.declarationListEmitMode === DeclarationListEmitMode.RuntimeResolved) {
    const args = [meta.type.value];
    if (meta.rawImports) {
      args.push(meta.rawImports);
    }
    definitionMap.set('dependencies', o.importExpr(R3.getComponentDepsFactory).callFn(args));
  }

  if (meta.encapsulation === null) {
    meta.encapsulation = core.ViewEncapsulation.Emulated;
  }

  let hasStyles = !!meta.externalStyles?.length;
  // e.g. `styles: [str1, str2]`
  if (meta.styles && meta.styles.length) {
    const styleValues =
      meta.encapsulation == core.ViewEncapsulation.Emulated
        ? compileStyles(meta.styles, CONTENT_ATTR, HOST_ATTR)
        : meta.styles;
    const styleNodes = styleValues.reduce((result, style) => {
      if (style.trim().length > 0) {
        result.push(constantPool.getConstLiteral(o.literal(style)));
      }
      return result;
    }, [] as o.Expression[]);

    if (styleNodes.length > 0) {
      hasStyles = true;
      definitionMap.set('styles', o.literalArr(styleNodes));
    }
  }

  if (!hasStyles && meta.encapsulation === core.ViewEncapsulation.Emulated) {
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
      'data',
      o.literalMap([{key: 'animation', value: meta.animations, quoted: false}]),
    );
  }

  // Setting change detection flag
  if (meta.changeDetection !== null) {
    if (
      typeof meta.changeDetection === 'number' &&
      meta.changeDetection !== core.ChangeDetectionStrategy.Default
    ) {
      // changeDetection is resolved during analysis. Only set it if not the default.
      definitionMap.set('changeDetection', o.literal(meta.changeDetection));
    } else if (typeof meta.changeDetection === 'object') {
      // changeDetection is not resolved during analysis (e.g., we are in local compilation mode).
      // So place it as is.
      definitionMap.set('changeDetection', meta.changeDetection);
    }
  }

  const expression = o
    .importExpr(R3.defineComponent)
    .callFn([definitionMap.toLiteralMap()], undefined, true);
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
  // TODO(signals): Always include this metadata starting with v17. Right
  // now Angular v16.0.x does not support this field and library distributions
  // would then be incompatible with v16.0.x framework users.
  if (meta.isSignal) {
    typeParams.push(o.expressionType(o.literal(meta.isSignal)));
  }
  return o.expressionType(o.importExpr(R3.ComponentDeclaration, typeParams));
}

/**
 * Compiles the array literal of declarations into an expression according to the provided emit
 * mode.
 */
function compileDeclarationList(
  list: o.LiteralArrayExpr,
  mode: DeclarationListEmitMode,
): o.Expression {
  switch (mode) {
    case DeclarationListEmitMode.Direct:
      // directives: [MyDir],
      return list;
    case DeclarationListEmitMode.Closure:
      // directives: function () { return [MyDir]; }
      return o.arrowFn([], list);
    case DeclarationListEmitMode.ClosureResolved:
      // directives: function () { return [MyDir].map(ng.resolveForwardRef); }
      const resolvedList = list.prop('map').callFn([o.importExpr(R3.resolveForwardRef)]);
      return o.arrowFn([], resolvedList);
    case DeclarationListEmitMode.RuntimeResolved:
      throw new Error(`Unsupported with an array of pre-resolved dependencies`);
  }
}

function stringAsType(str: string): o.Type {
  return o.expressionType(o.literal(str));
}

function stringMapAsLiteralExpression(map: {[key: string]: string | string[]}): o.LiteralMapExpr {
  const mapValues = Object.keys(map).map((key) => {
    const value = Array.isArray(map[key]) ? map[key][0] : map[key];
    return {
      key,
      value: o.literal(value),
      quoted: true,
    };
  });

  return o.literalMap(mapValues);
}

function stringArrayAsType(arr: ReadonlyArray<string | null>): o.Type {
  return arr.length > 0
    ? o.expressionType(o.literalArr(arr.map((value) => o.literal(value))))
    : o.NONE_TYPE;
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
    stringArrayAsType(meta.queries.map((q) => q.propertyName)),
  ];
}

function getInputsTypeExpression(meta: R3DirectiveMetadata): o.Expression {
  return o.literalMap(
    Object.keys(meta.inputs).map((key) => {
      const value = meta.inputs[key];
      const values = [
        {key: 'alias', value: o.literal(value.bindingPropertyName), quoted: true},
        {key: 'required', value: o.literal(value.required), quoted: true},
      ];

      // TODO(legacy-partial-output-inputs): Consider always emitting this information,
      // or leaving it as is.
      if (value.isSignal) {
        values.push({key: 'isSignal', value: o.literal(value.isSignal), quoted: true});
      }

      return {key, value: o.literalMap(values), quoted: true};
    }),
  );
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
  // TODO(signals): Always include this metadata starting with v17. Right
  // now Angular v16.0.x does not support this field and library distributions
  // would then be incompatible with v16.0.x framework users.
  if (meta.isSignal) {
    typeParams.push(o.expressionType(o.literal(meta.isSignal)));
  }
  return o.expressionType(o.importExpr(R3.DirectiveDeclaration, typeParams));
}

// Return a host binding function or null if one is not necessary.
function createHostBindingsFunction(
  hostBindingsMetadata: R3HostMetadata,
  typeSourceSpan: ParseSourceSpan,
  bindingParser: BindingParser,
  constantPool: ConstantPool,
  selector: string,
  name: string,
  definitionMap: DefinitionMap,
): o.Expression | null {
  const bindings = bindingParser.createBoundHostProperties(
    hostBindingsMetadata.properties,
    typeSourceSpan,
  );

  // Calculate host event bindings
  const eventBindings = bindingParser.createDirectiveHostEventAsts(
    hostBindingsMetadata.listeners,
    typeSourceSpan,
  );

  // The parser for host bindings treats class and style attributes specially -- they are
  // extracted into these separate fields. This is not the case for templates, so the compiler can
  // actually already handle these special attributes internally. Therefore, we just drop them
  // into the attributes map.
  if (hostBindingsMetadata.specialAttributes.styleAttr) {
    hostBindingsMetadata.attributes['style'] = o.literal(
      hostBindingsMetadata.specialAttributes.styleAttr,
    );
  }
  if (hostBindingsMetadata.specialAttributes.classAttr) {
    hostBindingsMetadata.attributes['class'] = o.literal(
      hostBindingsMetadata.specialAttributes.classAttr,
    );
  }

  const hostJob = ingestHostBinding(
    {
      componentName: name,
      componentSelector: selector,
      properties: bindings,
      events: eventBindings,
      attributes: hostBindingsMetadata.attributes,
    },
    bindingParser,
    constantPool,
  );
  transform(hostJob, CompilationJobKind.Host);

  definitionMap.set('hostAttrs', hostJob.root.attributes);

  const varCount = hostJob.root.vars;
  if (varCount !== null && varCount > 0) {
    definitionMap.set('hostVars', o.literal(varCount));
  }

  return emitHostBindingFunction(hostJob);
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
  specialAttributes: {styleAttr?: string; classAttr?: string};
}

export function parseHostBindings(host: {
  [key: string]: string | o.Expression;
}): ParsedHostBindings {
  const attributes: {[key: string]: o.Expression} = {};
  const listeners: {[key: string]: string} = {};
  const properties: {[key: string]: string} = {};
  const specialAttributes: {styleAttr?: string; classAttr?: string} = {};

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
  bindings: ParsedHostBindings,
  sourceSpan: ParseSourceSpan,
): ParseError[] {
  // TODO: abstract out host bindings verification logic and use it instead of
  // creating events and properties ASTs to detect errors (FW-996)
  const bindingParser = makeBindingParser();
  bindingParser.createDirectiveHostEventAsts(bindings.listeners, sourceSpan);
  bindingParser.createBoundHostProperties(bindings.properties, sourceSpan);
  return bindingParser.errors;
}

function compileStyles(styles: string[], selector: string, hostSelector: string): string[] {
  const shadowCss = new ShadowCss();
  return styles.map((style) => {
    return shadowCss!.shimCssText(style, selector, hostSelector);
  });
}

/**
 * Encapsulates a CSS stylesheet with emulated view encapsulation.
 * This allows a stylesheet to be used with an Angular component that
 * is using the `ViewEncapsulation.Emulated` mode.
 *
 * @param style The content of a CSS stylesheet.
 * @param componentIdentifier The identifier to use within the CSS rules.
 * @returns The encapsulated content for the style.
 */
export function encapsulateStyle(style: string, componentIdentifier?: string): string {
  const shadowCss = new ShadowCss();
  const selector = componentIdentifier
    ? CONTENT_ATTR.replace(COMPONENT_VARIABLE, componentIdentifier)
    : CONTENT_ATTR;
  const hostSelector = componentIdentifier
    ? HOST_ATTR.replace(COMPONENT_VARIABLE, componentIdentifier)
    : HOST_ATTR;
  return shadowCss.shimCssText(style, selector, hostSelector);
}

function createHostDirectivesType(meta: R3DirectiveMetadata): o.Type {
  if (!meta.hostDirectives?.length) {
    return o.NONE_TYPE;
  }

  return o.expressionType(
    o.literalArr(
      meta.hostDirectives.map((hostMeta) =>
        o.literalMap([
          {key: 'directive', value: o.typeofExpr(hostMeta.directive.type), quoted: false},
          {
            key: 'inputs',
            value: stringMapAsLiteralExpression(hostMeta.inputs || {}),
            quoted: false,
          },
          {
            key: 'outputs',
            value: stringMapAsLiteralExpression(hostMeta.outputs || {}),
            quoted: false,
          },
        ]),
      ),
    ),
  );
}

function createHostDirectivesFeatureArg(
  hostDirectives: NonNullable<R3DirectiveMetadata['hostDirectives']>,
): o.Expression {
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
  return hasForwardRef
    ? new o.FunctionExpr([], [new o.ReturnStatement(o.literalArr(expressions))])
    : o.literalArr(expressions);
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
export function createHostDirectivesMappingArray(
  mapping: Record<string, string>,
): o.LiteralArrayExpr | null {
  const elements: o.LiteralExpr[] = [];

  for (const publicName in mapping) {
    if (mapping.hasOwnProperty(publicName)) {
      elements.push(o.literal(publicName), o.literal(mapping[publicName]));
    }
  }

  return elements.length > 0 ? o.literalArr(elements) : null;
}

/**
 * Compiles the dependency resolver function for a defer block.
 */
export function compileDeferResolverFunction(
  meta: R3DeferResolverFunctionMetadata,
): o.ArrowFunctionExpr {
  const depExpressions: o.Expression[] = [];

  if (meta.mode === DeferBlockDepsEmitMode.PerBlock) {
    for (const dep of meta.dependencies) {
      if (dep.isDeferrable) {
        // Callback function, e.g. `m () => m.MyCmp;`.
        const innerFn = o.arrowFn(
          // Default imports are always accessed through the `default` property.
          [new o.FnParam('m', o.DYNAMIC_TYPE)],
          o.variable('m').prop(dep.isDefaultImport ? 'default' : dep.symbolName),
        );

        // Dynamic import, e.g. `import('./a').then(...)`.
        const importExpr = new o.DynamicImportExpr(dep.importPath!).prop('then').callFn([innerFn]);
        depExpressions.push(importExpr);
      } else {
        // Non-deferrable symbol, just use a reference to the type. Note that it's important to
        // go through `typeReference`, rather than `symbolName` in order to preserve the
        // original reference within the source file.
        depExpressions.push(dep.typeReference);
      }
    }
  } else {
    for (const {symbolName, importPath, isDefaultImport} of meta.dependencies) {
      // Callback function, e.g. `m () => m.MyCmp;`.
      const innerFn = o.arrowFn(
        [new o.FnParam('m', o.DYNAMIC_TYPE)],
        o.variable('m').prop(isDefaultImport ? 'default' : symbolName),
      );

      // Dynamic import, e.g. `import('./a').then(...)`.
      const importExpr = new o.DynamicImportExpr(importPath).prop('then').callFn([innerFn]);
      depExpressions.push(importExpr);
    }
  }

  return o.arrowFn([], o.literalArr(depExpressions));
}
