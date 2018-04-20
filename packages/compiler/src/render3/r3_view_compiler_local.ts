/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileQueryMetadata, CompileTypeMetadata, flatten, identifierName, sanitizeIdentifier, tokenReference} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {BindingForm, BuiltinFunctionCall, LocalResolver, convertActionBinding, convertPropertyBinding} from '../compiler_util/expression_converter';
import {ConstantPool, DefinitionKind} from '../constant_pool';
import * as core from '../core';
import {AST, AstMemoryEfficientTransformer, BindingPipe, FunctionCall, ImplicitReceiver, LiteralArray, LiteralMap, LiteralPrimitive, PropertyRead} from '../expression_parser/ast';
import {BoundElementBindingType} from '../expression_parser/ast';
import {Identifiers} from '../identifiers';
import {LifecycleHooks} from '../lifecycle_reflector';
import * as o from '../output/output_ast';
import {ParseSourceSpan, typeSourceSpan} from '../parse_util';
import {CssSelector, SelectorMatcher} from '../selector';
import {BindingParser} from '../template_parser/binding_parser';
import {OutputContext, error} from '../util';

import * as t from './r3_ast';
import {Identifiers as R3} from './r3_identifiers';



/** Name of the context parameter passed into a template function */
const CONTEXT_NAME = 'ctx';

/** Name of the RenderFlag passed into a template function */
const RENDER_FLAGS = 'rf';

/** Name of the temporary to use during data binding */
const TEMPORARY_NAME = '_t';

/** The prefix reference variables */
const REFERENCE_PREFIX = '_r';

/** The name of the implicit context reference */
const IMPLICIT_REFERENCE = '$implicit';

/** Name of the i18n attributes **/
const I18N_ATTR = 'i18n';
const I18N_ATTR_PREFIX = 'i18n-';

/** I18n separators for metadata **/
const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';

export function compileDirective(
    outputCtx: OutputContext, directive: CompileDirectiveMetadata, reflector: CompileReflector,
    bindingParser: BindingParser) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  const field = (key: string, value: o.Expression | null) => {
    if (value) {
      definitionMapValues.push({key, value, quoted: false});
    }
  };

  // e.g. `type: MyDirective`
  field('type', outputCtx.importExpr(directive.type.reference));

  // e.g. `selectors: [['', 'someDir', '']]`
  field('selectors', createDirectiveSelector(directive.selector !));

  // e.g. `factory: () => new MyApp(injectElementRef())`
  field('factory', createFactory(directive.type, outputCtx, reflector, directive.queries));

  // e.g. `hostBindings: (dirIndex, elIndex) => { ... }
  field('hostBindings', createHostBindingsFunction(directive, outputCtx, bindingParser));

  // e.g. `attributes: ['role', 'listbox']`
  field('attributes', createHostAttributesArray(directive, outputCtx));

  // e.g 'inputs: {a: 'a'}`
  field('inputs', conditionallyCreateMapObjectLiteral(directive.inputs));

  // e.g 'outputs: {a: 'a'}`
  field('outputs', conditionallyCreateMapObjectLiteral(directive.outputs));

  const className = identifierName(directive.type) !;
  className || error(`Cannot resolver the name of ${directive.type}`);

  const definitionField = outputCtx.constantPool.propertyNameOf(DefinitionKind.Directive);
  const definitionFunction =
      o.importExpr(R3.defineDirective).callFn([o.literalMap(definitionMapValues)]);

  // Create the partial class to be merged with the actual class.
  outputCtx.statements.push(new o.ClassStmt(
      className, null,
      [new o.ClassField(
          definitionField, o.INFERRED_TYPE, [o.StmtModifier.Static], definitionFunction)],
      [], new o.ClassMethod(null, [], []), []));
}

export function compileComponent(
    outputCtx: OutputContext, component: CompileDirectiveMetadata, nodes: t.Node[],
    hasNgContent: boolean, ngContentSelectors: string[], reflector: CompileReflector,
    bindingParser: BindingParser, directiveTypeBySel: Map<string, any>,
    pipeTypeByName: Map<string, any>) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  const field = (key: string, value: o.Expression | null) => {
    if (value) {
      definitionMapValues.push({key, value, quoted: false});
    }
  };

  // Generate the CSS matcher that recognize directive
  let directiveMatcher: SelectorMatcher|null = null;

  if (directiveTypeBySel.size) {
    const matcher = new SelectorMatcher();
    directiveTypeBySel.forEach((staticType: any, selector: string) => {
      matcher.addSelectables(CssSelector.parse(selector), staticType);
    });
    directiveMatcher = matcher;
  }

  // Directives and Pipes used from the template
  const directives = new Set<any>();
  const pipes = new Set<any>();

  // e.g. `type: MyApp`
  field('type', outputCtx.importExpr(component.type.reference));

  // e.g. `selectors: [['my-app']]`
  field('selectors', createDirectiveSelector(component.selector !));

  const selector = component.selector && CssSelector.parse(component.selector);
  const firstSelector = selector && selector[0];

  // e.g. `attr: ["class", ".my.app"]`
  // This is optional an only included if the first selector of a component specifies attributes.
  if (firstSelector) {
    const selectorAttributes = firstSelector.getAttrs();
    if (selectorAttributes.length) {
      field(
          'attrs', outputCtx.constantPool.getConstLiteral(
                       o.literalArr(selectorAttributes.map(
                           value => value != null ? o.literal(value) : o.literal(undefined))),
                       /* forceShared */ true));
    }
  }

  // e.g. `factory: function MyApp_Factory() { return new MyApp(injectElementRef()); }`
  field('factory', createFactory(component.type, outputCtx, reflector, component.queries));

  // e.g `hostBindings: function MyApp_HostBindings { ... }
  field('hostBindings', createHostBindingsFunction(component, outputCtx, bindingParser));

  // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
  const templateTypeName = component.type.reference.name;
  const templateName = templateTypeName ? `${templateTypeName}_Template` : null;

  const templateFunctionExpression =
      new TemplateDefinitionBuilder(
          outputCtx, outputCtx.constantPool, reflector, CONTEXT_NAME, BindingScope.ROOT_SCOPE, 0,
          templateTypeName, templateName, component.viewQueries, directiveMatcher, directives,
          pipeTypeByName, pipes)
          .buildTemplateFunction(nodes, [], hasNgContent, ngContentSelectors);

  field('template', templateFunctionExpression);

  // e.g. `directives: [MyDirective]`
  if (directives.size) {
    const expressions = Array.from(directives).map(d => outputCtx.importExpr(d));
    field('directives', o.literalArr(expressions));
  }

  // e.g. `pipes: [MyPipe]`
  if (pipes.size) {
    const expressions = Array.from(pipes).map(d => outputCtx.importExpr(d));
    field('pipes', o.literalArr(expressions));
  }

  // e.g `inputs: {a: 'a'}`
  field('inputs', conditionallyCreateMapObjectLiteral(component.inputs));

  // e.g 'outputs: {a: 'a'}`
  field('outputs', conditionallyCreateMapObjectLiteral(component.outputs));

  // e.g. `features: [NgOnChangesFeature(MyComponent)]`
  const features: o.Expression[] = [];
  if (component.type.lifecycleHooks.some(lifecycle => lifecycle == LifecycleHooks.OnChanges)) {
    features.push(o.importExpr(R3.NgOnChangesFeature, null, null).callFn([outputCtx.importExpr(
        component.type.reference)]));
  }
  if (features.length) {
    field('features', o.literalArr(features));
  }

  const definitionField = outputCtx.constantPool.propertyNameOf(DefinitionKind.Component);
  const definitionFunction =
      o.importExpr(R3.defineComponent).callFn([o.literalMap(definitionMapValues)]);
  const className = identifierName(component.type) !;
  className || error(`Cannot resolver the name of ${component.type}`);

  // Create the partial class to be merged with the actual class.
  outputCtx.statements.push(new o.ClassStmt(
      className, null,
      [new o.ClassField(
          definitionField, o.INFERRED_TYPE, [o.StmtModifier.Static], definitionFunction)],
      [], new o.ClassMethod(null, [], []), []));
}

function unsupported(feature: string): never {
  if (this) {
    throw new Error(`Builder ${this.constructor.name} doesn't support ${feature} yet`);
  }
  throw new Error(`Feature ${feature} is not supported yet`);
}

const BINDING_INSTRUCTION_MAP: {[type: number]: o.ExternalReference} = {
  [BoundElementBindingType.Property]: R3.elementProperty,
  [BoundElementBindingType.Attribute]: R3.elementAttribute,
  [BoundElementBindingType.Class]: R3.elementClassNamed,
  [BoundElementBindingType.Style]: R3.elementStyleNamed,
};

function interpolate(args: o.Expression[]): o.Expression {
  args = args.slice(1);  // Ignore the length prefix added for render2
  switch (args.length) {
    case 3:
      return o.importExpr(R3.interpolation1).callFn(args);
    case 5:
      return o.importExpr(R3.interpolation2).callFn(args);
    case 7:
      return o.importExpr(R3.interpolation3).callFn(args);
    case 9:
      return o.importExpr(R3.interpolation4).callFn(args);
    case 11:
      return o.importExpr(R3.interpolation5).callFn(args);
    case 13:
      return o.importExpr(R3.interpolation6).callFn(args);
    case 15:
      return o.importExpr(R3.interpolation7).callFn(args);
    case 17:
      return o.importExpr(R3.interpolation8).callFn(args);
  }
  (args.length >= 19 && args.length % 2 == 1) ||
      error(`Invalid interpolation argument length ${args.length}`);
  return o.importExpr(R3.interpolationV).callFn([o.literalArr(args)]);
}

// Pipes always have at least one parameter, the value they operate on
const pipeBindingIdentifiers = [R3.pipeBind1, R3.pipeBind2, R3.pipeBind3, R3.pipeBind4];

function pipeBinding(args: o.Expression[]): o.ExternalReference {
  return pipeBindingIdentifiers[args.length] || R3.pipeBindV;
}

const pureFunctionIdentifiers = [
  R3.pureFunction0, R3.pureFunction1, R3.pureFunction2, R3.pureFunction3, R3.pureFunction4,
  R3.pureFunction5, R3.pureFunction6, R3.pureFunction7, R3.pureFunction8
];
function getLiteralFactory(
    outputContext: OutputContext, literal: o.LiteralArrayExpr | o.LiteralMapExpr): o.Expression {
  const {literalFactory, literalFactoryArguments} =
      outputContext.constantPool.getLiteralFactory(literal);
  literalFactoryArguments.length > 0 || error(`Expected arguments to a literal factory function`);
  let pureFunctionIdent =
      pureFunctionIdentifiers[literalFactoryArguments.length] || R3.pureFunctionV;

  // Literal factories are pure functions that only need to be re-invoked when the parameters
  // change.
  return o.importExpr(pureFunctionIdent).callFn([literalFactory, ...literalFactoryArguments]);
}

function noop() {}

/**
 * Function which is executed whenever a variable is referenced for the first time in a given
 * scope.
 *
 * It is expected that the function creates the `const localName = expression`; statement.
 */
type DeclareLocalVarCallback = (lhsVar: o.ReadVarExpr, rhsExpression: o.Expression) => void;

class BindingScope implements LocalResolver {
  /**
   * Keeps a map from local variables to their expressions.
   *
   * This is used when one refers to variable such as: 'let abc = a.b.c`.
   * - key to the map is the string literal `"abc"`.
   * - value `lhs` is the left hand side which is an AST representing `abc`.
   * - value `rhs` is the right hand side which is an AST representing `a.b.c`.
   * - value `declared` is true if the `declareLocalVarCallback` has been called for this scope
   * already.
   */
  private map = new Map < string, {
    lhs: o.ReadVarExpr;
    rhs: o.Expression|undefined;
    declared: boolean;
  }
  > ();
  private referenceNameIndex = 0;

  static ROOT_SCOPE = new BindingScope().set('$event', o.variable('$event'));

  private constructor(
      private parent: BindingScope|null = null,
      private declareLocalVarCallback: DeclareLocalVarCallback = noop) {}

  get(name: string): o.Expression|null {
    let current: BindingScope|null = this;
    while (current) {
      let value = current.map.get(name);
      if (value != null) {
        if (current !== this) {
          // make a local copy and reset the `declared` state.
          value = {lhs: value.lhs, rhs: value.rhs, declared: false};
          // Cache the value locally.
          this.map.set(name, value);
        }
        if (value.rhs && !value.declared) {
          // if it is first time we are referencing the variable in the scope
          // than invoke the callback to insert variable declaration.
          this.declareLocalVarCallback(value.lhs, value.rhs);
          value.declared = true;
        }
        return value.lhs;
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Create a local variable for later reference.
   *
   * @param name Name of the variable.
   * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
   * @param rhs AST representing the right hand side of the `let lhs = rhs;`. The `rhs` can be
   * `undefined` for variable that are ambient such as `$event` and which don't have `rhs`
   * declaration.
   */
  set(name: string, lhs: o.ReadVarExpr, rhs?: o.Expression): BindingScope {
    !this.map.has(name) ||
        error(`The name ${name} is already defined in scope to be ${this.map.get(name)}`);
    this.map.set(name, {lhs: lhs, rhs: rhs, declared: false});
    return this;
  }

  getLocal(name: string): (o.Expression|null) { return this.get(name); }

  nestedScope(declareCallback: DeclareLocalVarCallback): BindingScope {
    return new BindingScope(this, declareCallback);
  }

  freshReferenceName(): string {
    let current: BindingScope = this;
    // Find the top scope as it maintains the global reference count
    while (current.parent) current = current.parent;
    const ref = `${REFERENCE_PREFIX}${current.referenceNameIndex++}`;
    return ref;
  }
}

// Pasted from render3/interfaces/definition since it cannot be referenced directly
/**
 * Flags passed into template functions to determine which blocks (i.e. creation, update)
 * should be executed.
 *
 * Typically, a template runs both the creation block and the update block on initialization and
 * subsequent runs only execute the update block. However, dynamically created views require that
 * the creation block be executed separately from the update block (for backwards compat).
 */
// TODO(vicb): move to ../core
export const enum RenderFlags {
  /* Whether to run the creation block (e.g. create elements and directives) */
  Create = 0b01,

  /* Whether to run the update block (e.g. refresh bindings) */
  Update = 0b10
}

class TemplateDefinitionBuilder implements t.Visitor<void>, LocalResolver {
  private _dataIndex = 0;
  private _bindingContext = 0;
  private _prefixCode: o.Statement[] = [];
  private _creationCode: o.Statement[] = [];
  private _variableCode: o.Statement[] = [];
  private _bindingCode: o.Statement[] = [];
  private _postfixCode: o.Statement[] = [];
  private _temporary = temporaryAllocator(this._prefixCode, TEMPORARY_NAME);
  private _projectionDefinitionIndex = -1;
  private _valueConverter: ValueConverter;
  private _unsupported = unsupported;
  private _bindingScope: BindingScope;

  // Whether we are inside a translatable element (`<p i18n>... somewhere here ... </p>)
  private _inI18nSection: boolean = false;
  private _i18nSectionIndex = -1;
  // Maps of placeholder to node indexes for each of the i18n section
  private _phToNodeIdxes: {[phName: string]: number[]}[] = [{}];

  constructor(
      private outputCtx: OutputContext, private constantPool: ConstantPool,
      private reflector: CompileReflector, private contextParameter: string,
      parentBindingScope: BindingScope, private level = 0, private contextName: string|null,
      private templateName: string|null, private viewQueries: CompileQueryMetadata[],
      private directiveMatcher: SelectorMatcher|null, private directives: Set<any>,
      private pipeTypeByName: Map<string, any>, private pipes: Set<any>) {
    this._bindingScope =
        parentBindingScope.nestedScope((lhsVar: o.ReadVarExpr, expression: o.Expression) => {
          this._bindingCode.push(
              lhsVar.set(expression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
        });
    this._valueConverter = new ValueConverter(
        outputCtx, () => this.allocateDataSlot(), (name, localName, slot, value: o.ReadVarExpr) => {
          const pipeType = pipeTypeByName.get(name);
          if (pipeType) {
            this.pipes.add(pipeType);
          }
          this._bindingScope.set(localName, value);
          this._creationCode.push(
              o.importExpr(R3.pipe).callFn([o.literal(slot), o.literal(name)]).toStmt());
        });
  }

  buildTemplateFunction(
      nodes: t.Node[], variables: t.Variable[], hasNgContent: boolean = false,
      ngContentSelectors: string[] = []): o.FunctionExpr {
    // Create variable bindings
    for (const variable of variables) {
      const variableName = variable.name;
      const expression =
          o.variable(this.contextParameter).prop(variable.value || IMPLICIT_REFERENCE);
      const scopedName = this._bindingScope.freshReferenceName();
      // Add the reference to the local scope.
      this._bindingScope.set(variableName, o.variable(variableName + scopedName), expression);
    }

    // Output a `ProjectionDef` instruction when some `<ng-content>` are present
    if (hasNgContent) {
      this._projectionDefinitionIndex = this.allocateDataSlot();
      const parameters: o.Expression[] = [o.literal(this._projectionDefinitionIndex)];

      // Only selectors with a non-default value are generated
      if (ngContentSelectors.length > 1) {
        const r3Selectors = ngContentSelectors.map(s => core.parseSelectorToR3Selector(s));
        // `projectionDef` needs both the parsed and raw value of the selectors
        const parsed = this.outputCtx.constantPool.getConstLiteral(asLiteral(r3Selectors), true);
        const unParsed =
            this.outputCtx.constantPool.getConstLiteral(asLiteral(ngContentSelectors), true);
        parameters.push(parsed, unParsed);
      }

      this.instruction(this._creationCode, null, R3.projectionDef, ...parameters);
    }

    // Define and update any view queries
    for (let query of this.viewQueries) {
      // e.g. r3.Q(0, somePredicate, true);
      const querySlot = this.allocateDataSlot();
      const predicate = getQueryPredicate(query, this.outputCtx);
      const args = [
        o.literal(querySlot, o.INFERRED_TYPE),
        predicate,
        o.literal(query.descendants, o.INFERRED_TYPE),
      ];

      if (query.read) {
        args.push(this.outputCtx.importExpr(query.read.identifier !.reference));
      }
      this.instruction(this._creationCode, null, R3.query, ...args);

      // (r3.qR(tmp = r3.ɵld(0)) && (ctx.someDir = tmp));
      const temporary = this._temporary();
      const getQueryList = o.importExpr(R3.load).callFn([o.literal(querySlot)]);
      const refresh = o.importExpr(R3.queryRefresh).callFn([temporary.set(getQueryList)]);
      const updateDirective = o.variable(CONTEXT_NAME)
                                  .prop(query.propertyName)
                                  .set(query.first ? temporary.prop('first') : temporary);
      this._bindingCode.push(refresh.and(updateDirective).toStmt());
    }

    t.visitAll(this, nodes);

    const creationCode = this._creationCode.length > 0 ?
        [o.ifStmt(
            o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(RenderFlags.Create), null, false),
            this._creationCode)] :
        [];

    const updateCode = this._bindingCode.length > 0 ?
        [o.ifStmt(
            o.variable(RENDER_FLAGS).bitwiseAnd(o.literal(RenderFlags.Update), null, false),
            this._bindingCode)] :
        [];

    // Generate maps of placeholder name to node indexes
    // TODO(vicb): This is a WIP, not fully supported yet
    for (const phToNodeIdx of this._phToNodeIdxes) {
      if (Object.keys(phToNodeIdx).length > 0) {
        const scopedName = this._bindingScope.freshReferenceName();
        const phMap = o.variable(scopedName)
                          .set(mapToExpression(phToNodeIdx, true))
                          .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]);

        this._prefixCode.push(phMap);
      }
    }

    return o.fn(
        [new o.FnParam(RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(this.contextParameter, null)],
        [
          // Temporary variable declarations for query refresh (i.e. let _t: any;)
          ...this._prefixCode,
          // Creating mode (i.e. if (rf & RenderFlags.Create) { ... })
          ...creationCode,
          // Temporary variable declarations for local refs (i.e. const tmp = ld(1) as any)
          ...this._variableCode,
          // Binding and refresh mode (i.e. if (rf & RenderFlags.Update) {...})
          ...updateCode,
          // Nested templates (i.e. function CompTemplate() {})
          ...this._postfixCode
        ],
        o.INFERRED_TYPE, null, this.templateName);
  }

  // LocalResolver
  getLocal(name: string): o.Expression|null { return this._bindingScope.get(name); }

  visitContent(ngContent: t.Content) {
    const slot = this.allocateDataSlot();
    const selectorIndex = ngContent.selectorIndex;
    const parameters: o.Expression[] = [
      o.literal(slot),
      o.literal(this._projectionDefinitionIndex),
    ];

    const attributeAsList: string[] = [];

    ngContent.attributes.forEach((attribute) => {
      const name = attribute.name;
      if (name !== 'select') {
        attributeAsList.push(name, attribute.value);
      }
    });

    if (attributeAsList.length > 0) {
      parameters.push(o.literal(selectorIndex), asLiteral(attributeAsList));
    } else if (selectorIndex !== 0) {
      parameters.push(o.literal(selectorIndex));
    }

    this.instruction(this._creationCode, ngContent.sourceSpan, R3.projection, ...parameters);
  }

  visitElement(element: t.Element) {
    const elementIndex = this.allocateDataSlot();
    const referenceDataSlots = new Map<string, number>();
    const wasInI18nSection = this._inI18nSection;

    const outputAttrs: {[name: string]: string} = {};
    const attrI18nMetas: {[name: string]: string} = {};
    let i18nMeta: string = '';

    // Elements inside i18n sections are replaced with placeholders
    // TODO(vicb): nested elements are a WIP in this phase
    if (this._inI18nSection) {
      const phName = element.name.toLowerCase();
      if (!this._phToNodeIdxes[this._i18nSectionIndex][phName]) {
        this._phToNodeIdxes[this._i18nSectionIndex][phName] = [];
      }
      this._phToNodeIdxes[this._i18nSectionIndex][phName].push(elementIndex);
    }

    // Handle i18n attributes
    for (const attr of element.attributes) {
      const name = attr.name;
      const value = attr.value;
      if (name === I18N_ATTR) {
        if (this._inI18nSection) {
          throw new Error(
              `Could not mark an element as translatable inside of a translatable section`);
        }
        this._inI18nSection = true;
        this._i18nSectionIndex++;
        this._phToNodeIdxes[this._i18nSectionIndex] = {};
        i18nMeta = value;
      } else if (name.startsWith(I18N_ATTR_PREFIX)) {
        attrI18nMetas[name.slice(I18N_ATTR_PREFIX.length)] = value;
      } else {
        outputAttrs[name] = value;
      }
    }

    // Match directives on non i18n attributes
    if (this.directiveMatcher) {
      const selector = createCssSelector(element.name, outputAttrs);
      this.directiveMatcher.match(
          selector, (sel: CssSelector, staticType: any) => { this.directives.add(staticType); });
    }

    // Element creation mode
    const parameters: o.Expression[] = [
      o.literal(elementIndex),
      o.literal(element.name),
    ];

    // Add the attributes
    const i18nMessages: o.Statement[] = [];
    const attributes: o.Expression[] = [];
    let hasI18nAttr = false;

    Object.getOwnPropertyNames(outputAttrs).forEach(name => {
      const value = outputAttrs[name];
      attributes.push(o.literal(name));
      if (attrI18nMetas.hasOwnProperty(name)) {
        hasI18nAttr = true;
        const meta = parseI18nMeta(attrI18nMetas[name]);
        const variable = this.constantPool.getTranslation(value, meta);
        attributes.push(variable);
      } else {
        attributes.push(o.literal(value));
      }
    });

    let attrArg: o.Expression = o.TYPED_NULL_EXPR;

    if (attributes.length > 0) {
      attrArg = hasI18nAttr ? getLiteralFactory(this.outputCtx, o.literalArr(attributes)) :
                              this.constantPool.getConstLiteral(o.literalArr(attributes), true);
    }

    parameters.push(attrArg);

    if (element.references && element.references.length > 0) {
      const references = flatten(element.references.map(reference => {
        const slot = this.allocateDataSlot();
        referenceDataSlots.set(reference.name, slot);
        // Generate the update temporary.
        const variableName = this._bindingScope.freshReferenceName();
        this._variableCode.push(o.variable(variableName, o.INFERRED_TYPE)
                                    .set(o.importExpr(R3.load).callFn([o.literal(slot)]))
                                    .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
        this._bindingScope.set(reference.name, o.variable(variableName));
        return [reference.name, reference.value];
      }));
      parameters.push(this.constantPool.getConstLiteral(asLiteral(references), true));
    } else {
      parameters.push(o.TYPED_NULL_EXPR);
    }

    // Generate the instruction create element instruction
    if (i18nMessages.length > 0) {
      this._creationCode.push(...i18nMessages);
    }
    this.instruction(
        this._creationCode, element.sourceSpan, R3.createElement, ...trimTrailingNulls(parameters));

    const implicit = o.variable(CONTEXT_NAME);

    // Generate Listeners (outputs)
    element.outputs.forEach((outputAst: t.BoundEvent) => {
      const elName = sanitizeIdentifier(element.name);
      const evName = sanitizeIdentifier(outputAst.name);
      const functionName = `${this.templateName}_${elName}_${evName}_listener`;
      const localVars: o.Statement[] = [];
      const bindingScope =
          this._bindingScope.nestedScope((lhsVar: o.ReadVarExpr, rhsExpression: o.Expression) => {
            localVars.push(
                lhsVar.set(rhsExpression).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
          });
      const bindingExpr = convertActionBinding(
          bindingScope, implicit, outputAst.handler, 'b', () => error('Unexpected interpolation'));
      const handler = o.fn(
          [new o.FnParam('$event', o.DYNAMIC_TYPE)], [...localVars, ...bindingExpr.render3Stmts],
          o.INFERRED_TYPE, null, functionName);
      this.instruction(
          this._creationCode, outputAst.sourceSpan, R3.listener, o.literal(outputAst.name),
          handler);
    });


    // Generate element input bindings
    element.inputs.forEach((input: t.BoundAttribute) => {
      if (input.type === BoundElementBindingType.Animation) {
        this._unsupported('animations');
      }
      const convertedBinding = this.convertPropertyBinding(implicit, input.value);
      const instruction = BINDING_INSTRUCTION_MAP[input.type];
      if (instruction) {
        // TODO(chuckj): runtime: security context?
        const value = o.importExpr(R3.bind).callFn([convertedBinding]);
        this.instruction(
            this._bindingCode, input.sourceSpan, instruction, o.literal(elementIndex),
            o.literal(input.name), value);
      } else {
        this._unsupported(`binding type ${input.type}`);
      }
    });

    // Traverse element child nodes
    if (this._inI18nSection && element.children.length == 1 &&
        element.children[0] instanceof t.Text) {
      const text = element.children[0] as t.Text;
      this.visitSingleI18nTextChild(text, i18nMeta);
    } else {
      t.visitAll(this, element.children);
    }

    // Finish element construction mode.
    this.instruction(
        this._creationCode, element.endSourceSpan || element.sourceSpan, R3.elementEnd);

    // Restore the state before exiting this node
    this._inI18nSection = wasInI18nSection;
  }

  visitTemplate(template: t.Template) {
    const templateIndex = this.allocateDataSlot();

    let elName = '';
    if (template.children.length === 1 && template.children[0] instanceof t.Element) {
      // When the template as a single child, derive the context name from the tag
      elName = sanitizeIdentifier((template.children[0] as t.Element).name);
    }

    const contextName = elName ? `${this.contextName}_${elName}` : '';

    const templateName =
        contextName ? `${contextName}_Template_${templateIndex}` : `Template_${templateIndex}`;

    const templateContext = `ctx${this.level}`;

    const parameters: o.Expression[] = [
      o.literal(templateIndex),
      o.variable(templateName),
      o.TYPED_NULL_EXPR,
    ];

    const attributeNames: o.Expression[] = [];
    const attributeMap: {[name: string]: string} = {};

    template.attributes.forEach(a => {
      attributeNames.push(asLiteral(a.name), asLiteral(''));
      attributeMap[a.name] = a.value;
    });

    // Match directives on template attributes
    if (this.directiveMatcher) {
      const selector = createCssSelector('ng-template', attributeMap);
      this.directiveMatcher.match(
          selector, (cssSelector, staticType) => { this.directives.add(staticType); });
    }

    if (attributeNames.length) {
      parameters.push(this.constantPool.getConstLiteral(o.literalArr(attributeNames), true));
    }

    // e.g. C(1, C1Template)
    this.instruction(
        this._creationCode, template.sourceSpan, R3.containerCreate,
        ...trimTrailingNulls(parameters));

    // e.g. p(1, 'forOf', ɵb(ctx.items));
    const context = o.variable(CONTEXT_NAME);
    template.inputs.forEach(input => {
      const convertedBinding = this.convertPropertyBinding(context, input.value);
      this.instruction(
          this._bindingCode, template.sourceSpan, R3.elementProperty, o.literal(templateIndex),
          o.literal(input.name), o.importExpr(R3.bind).callFn([convertedBinding]));
    });

    // Create the template function
    const templateVisitor = new TemplateDefinitionBuilder(
        this.outputCtx, this.constantPool, this.reflector, templateContext, this._bindingScope,
        this.level + 1, contextName, templateName, [], this.directiveMatcher, this.directives,
        this.pipeTypeByName, this.pipes);
    const templateFunctionExpr =
        templateVisitor.buildTemplateFunction(template.children, template.variables);
    this._postfixCode.push(templateFunctionExpr.toDeclStmt(templateName, null));
  }

  // These should be handled in the template or element directly.
  readonly visitReference = invalid;
  readonly visitVariable = invalid;
  readonly visitAttribute = invalid;
  readonly visitBoundAttribute = invalid;
  readonly visitBoundEvent = invalid;

  visitBoundText(text: t.BoundText) {
    const nodeIndex = this.allocateDataSlot();

    this.instruction(this._creationCode, text.sourceSpan, R3.text, o.literal(nodeIndex));

    this.instruction(
        this._bindingCode, text.sourceSpan, R3.textCreateBound, o.literal(nodeIndex),
        this.convertPropertyBinding(o.variable(CONTEXT_NAME), text.value));
  }

  visitText(text: t.Text) {
    this.instruction(
        this._creationCode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()),
        o.literal(text.value));
  }

  // When the content of the element is a single text node the translation can be inlined:
  //
  // `<p i18n="desc|mean">some content</p>`
  // compiles to
  // ```
  // /**
  // * @desc desc
  // * @meaning mean
  // */
  // const MSG_XYZ = goog.getMsg('some content');
  // i0.ɵT(1, MSG_XYZ);
  // ```
  visitSingleI18nTextChild(text: t.Text, i18nMeta: string) {
    const meta = parseI18nMeta(i18nMeta);
    const variable = this.constantPool.getTranslation(text.value, meta);
    this.instruction(
        this._creationCode, text.sourceSpan, R3.text, o.literal(this.allocateDataSlot()), variable);
  }

  private allocateDataSlot() { return this._dataIndex++; }
  private bindingContext() { return `${this._bindingContext++}`; }

  private instruction(
      statements: o.Statement[], span: ParseSourceSpan|null, reference: o.ExternalReference,
      ...params: o.Expression[]) {
    statements.push(o.importExpr(reference, null, span).callFn(params, span).toStmt());
  }

  private convertPropertyBinding(implicit: o.Expression, value: AST): o.Expression {
    const pipesConvertedValue = value.visit(this._valueConverter);
    const convertedPropertyBinding = convertPropertyBinding(
        this, implicit, pipesConvertedValue, this.bindingContext(), BindingForm.TrySimple,
        interpolate);
    this._bindingCode.push(...convertedPropertyBinding.stmts);
    return convertedPropertyBinding.currValExpr;
  }
}

function getQueryPredicate(query: CompileQueryMetadata, outputCtx: OutputContext): o.Expression {
  if (query.selectors.length > 1 || (query.selectors.length == 1 && query.selectors[0].value)) {
    const selectors = query.selectors.map(value => value.value as string);
    selectors.some(value => !value) && error('Found a type among the string selectors expected');
    return outputCtx.constantPool.getConstLiteral(
        o.literalArr(selectors.map(value => o.literal(value))));
  }

  if (query.selectors.length == 1) {
    const first = query.selectors[0];
    if (first.identifier) {
      return outputCtx.importExpr(first.identifier.reference);
    }
  }

  error('Unexpected query form');
  return o.NULL_EXPR;
}

export function createFactory(
    type: CompileTypeMetadata, outputCtx: OutputContext, reflector: CompileReflector,
    queries: CompileQueryMetadata[]): o.Expression {
  let args: o.Expression[] = [];

  const elementRef = reflector.resolveExternalReference(Identifiers.ElementRef);
  const templateRef = reflector.resolveExternalReference(Identifiers.TemplateRef);
  const viewContainerRef = reflector.resolveExternalReference(Identifiers.ViewContainerRef);

  for (let dependency of type.diDeps) {
    const token = dependency.token;
    if (token) {
      const tokenRef = tokenReference(token);
      if (tokenRef === elementRef) {
        args.push(o.importExpr(R3.injectElementRef).callFn([]));
      } else if (tokenRef === templateRef) {
        args.push(o.importExpr(R3.injectTemplateRef).callFn([]));
      } else if (tokenRef === viewContainerRef) {
        args.push(o.importExpr(R3.injectViewContainerRef).callFn([]));
      } else if (dependency.isAttribute) {
        args.push(o.importExpr(R3.injectAttribute).callFn([o.literal(dependency.token !.value)]));
      } else {
        const tokenValue =
            token.identifier != null ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);
        const directiveInjectArgs = [tokenValue];
        const flags = extractFlags(dependency);
        if (flags != core.InjectFlags.Default) {
          // Append flag information if other than default.
          directiveInjectArgs.push(o.literal(flags));
        }
        args.push(o.importExpr(R3.directiveInject).callFn(directiveInjectArgs));
      }
    } else {
      unsupported('dependency without a token');
    }
  }

  const queryDefinitions: o.Expression[] = [];
  for (let query of queries) {
    const predicate = getQueryPredicate(query, outputCtx);

    // e.g. r3.Q(null, somePredicate, false) or r3.Q(null, ['div'], false)
    const parameters = [
      o.literal(null, o.INFERRED_TYPE),
      predicate,
      o.literal(query.descendants),
    ];

    if (query.read) {
      parameters.push(outputCtx.importExpr(query.read.identifier !.reference));
    }

    queryDefinitions.push(o.importExpr(R3.query).callFn(parameters));
  }

  const createInstance = new o.InstantiateExpr(outputCtx.importExpr(type.reference), args);
  const result = queryDefinitions.length > 0 ? o.literalArr([createInstance, ...queryDefinitions]) :
                                               createInstance;

  return o.fn(
      [], [new o.ReturnStatement(result)], o.INFERRED_TYPE, null,
      type.reference.name ? `${type.reference.name}_Factory` : null);
}

function extractFlags(dependency: CompileDiDependencyMetadata): core.InjectFlags {
  let flags = core.InjectFlags.Default;
  if (dependency.isHost) {
    flags |= core.InjectFlags.Host;
  }
  if (dependency.isOptional) {
    flags |= core.InjectFlags.Optional;
  }
  if (dependency.isSelf) {
    flags |= core.InjectFlags.Self;
  }
  if (dependency.isSkipSelf) {
    flags |= core.InjectFlags.SkipSelf;
  }
  if (dependency.isValue) {
    unsupported('value dependencies');
  }
  return flags;
}

/**
 *  Remove trailing null nodes as they are implied.
 */
function trimTrailingNulls(parameters: o.Expression[]): o.Expression[] {
  while (o.isNull(parameters[parameters.length - 1])) {
    parameters.pop();
  }
  return parameters;
}

// Turn a directive selector into an R3-compatible selector for directive def
function createDirectiveSelector(selector: string): o.Expression {
  return asLiteral(core.parseSelectorToR3Selector(selector));
}

function createHostAttributesArray(
    directiveMetadata: CompileDirectiveMetadata, outputCtx: OutputContext): o.Expression|null {
  const values: o.Expression[] = [];
  const attributes = directiveMetadata.hostAttributes;
  for (let key of Object.getOwnPropertyNames(attributes)) {
    const value = attributes[key];
    values.push(o.literal(key), o.literal(value));
  }
  if (values.length > 0) {
    return outputCtx.constantPool.getConstLiteral(o.literalArr(values));
  }
  return null;
}

// Return a host binding function or null if one is not necessary.
function createHostBindingsFunction(
    directiveMetadata: CompileDirectiveMetadata, outputCtx: OutputContext,
    bindingParser: BindingParser): o.Expression|null {
  const statements: o.Statement[] = [];

  const temporary = temporaryAllocator(statements, TEMPORARY_NAME);

  const hostBindingSourceSpan = typeSourceSpan(
      directiveMetadata.isComponent ? 'Component' : 'Directive', directiveMetadata.type);

  // Calculate the queries
  for (let index = 0; index < directiveMetadata.queries.length; index++) {
    const query = directiveMetadata.queries[index];

    // e.g. r3.qR(tmp = r3.ld(dirIndex)[1]) && (r3.ld(dirIndex)[0].someDir = tmp);
    const getDirectiveMemory = o.importExpr(R3.load).callFn([o.variable('dirIndex')]);
    // The query list is at the query index + 1 because the directive itself is in slot 0.
    const getQueryList = getDirectiveMemory.key(o.literal(index + 1));
    const assignToTemporary = temporary().set(getQueryList);
    const callQueryRefresh = o.importExpr(R3.queryRefresh).callFn([assignToTemporary]);
    const updateDirective = getDirectiveMemory.key(o.literal(0, o.INFERRED_TYPE))
                                .prop(query.propertyName)
                                .set(query.first ? temporary().prop('first') : temporary());
    const andExpression = callQueryRefresh.and(updateDirective);
    statements.push(andExpression.toStmt());
  }

  const directiveSummary = directiveMetadata.toSummary();

  // Calculate the host property bindings
  const bindings = bindingParser.createBoundHostProperties(directiveSummary, hostBindingSourceSpan);
  const bindingContext = o.importExpr(R3.load).callFn([o.variable('dirIndex')]);
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
      const typeName = identifierName(directiveMetadata.type);
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
    const typeName = directiveMetadata.type.reference.name;
    return o.fn(
        [
          new o.FnParam('dirIndex', o.NUMBER_TYPE),
          new o.FnParam('elIndex', o.NUMBER_TYPE),
        ],
        statements, o.INFERRED_TYPE, null, typeName ? `${typeName}_HostBindings` : null);
  }

  return null;
}

class ValueConverter extends AstMemoryEfficientTransformer {
  constructor(
      private outputCtx: OutputContext, private allocateSlot: () => number,
      private definePipe:
          (name: string, localName: string, slot: number, value: o.Expression) => void) {
    super();
  }

  // AstMemoryEfficientTransformer
  visitPipe(pipe: BindingPipe, context: any): AST {
    // Allocate a slot to create the pipe
    const slot = this.allocateSlot();
    const slotPseudoLocal = `PIPE:${slot}`;
    const target = new PropertyRead(pipe.span, new ImplicitReceiver(pipe.span), slotPseudoLocal);
    const bindingId = pipeBinding(pipe.args);
    this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(bindingId));
    const value = pipe.exp.visit(this);
    const args = this.visitAll(pipe.args);

    return new FunctionCall(
        pipe.span, target, [new LiteralPrimitive(pipe.span, slot), value, ...args]);
  }

  visitLiteralArray(array: LiteralArray, context: any): AST {
    return new BuiltinFunctionCall(array.span, this.visitAll(array.expressions), values => {
      // If the literal has calculated (non-literal) elements transform it into
      // calls to literal factories that compose the literal and will cache intermediate
      // values. Otherwise, just return an literal array that contains the values.
      const literal = o.literalArr(values);
      return values.every(a => a.isConstant()) ?
          this.outputCtx.constantPool.getConstLiteral(literal, true) :
          getLiteralFactory(this.outputCtx, literal);
    });
  }

  visitLiteralMap(map: LiteralMap, context: any): AST {
    return new BuiltinFunctionCall(map.span, this.visitAll(map.values), values => {
      // If the literal has calculated (non-literal) elements  transform it into
      // calls to literal factories that compose the literal and will cache intermediate
      // values. Otherwise, just return an literal array that contains the values.
      const literal = o.literalMap(values.map(
          (value, index) => ({key: map.keys[index].key, value, quoted: map.keys[index].quoted})));
      return values.every(a => a.isConstant()) ?
          this.outputCtx.constantPool.getConstLiteral(literal, true) :
          getLiteralFactory(this.outputCtx, literal);
    });
  }
}

function invalid<T>(arg: o.Expression | o.Statement | t.Node): never {
  throw new Error(
      `Invalid state: Visitor ${this.constructor.name} doesn't handle ${o.constructor.name}`);
}

function asLiteral(value: any): o.Expression {
  if (Array.isArray(value)) {
    return o.literalArr(value.map(asLiteral));
  }
  return o.literal(value, o.INFERRED_TYPE);
}

function conditionallyCreateMapObjectLiteral(keys: {[key: string]: string}): o.Expression|null {
  if (Object.getOwnPropertyNames(keys).length > 0) {
    return mapToExpression(keys);
  }
  return null;
}

function mapToExpression(map: {[key: string]: any}, quoted = false): o.Expression {
  return o.literalMap(
      Object.getOwnPropertyNames(map).map(key => ({key, quoted, value: asLiteral(map[key])})));
}

/**
 * Creates an allocator for a temporary variable.
 *
 * A variable declaration is added to the statements the first time the allocator is invoked.
 */
function temporaryAllocator(statements: o.Statement[], name: string): () => o.ReadVarExpr {
  let temp: o.ReadVarExpr|null = null;
  return () => {
    if (!temp) {
      statements.push(new o.DeclareVarStmt(TEMPORARY_NAME, undefined, o.DYNAMIC_TYPE));
      temp = o.variable(name);
    }
    return temp;
  };
}

// Parse i18n metas like:
// - "@@id",
// - "description[@@id]",
// - "meaning|description[@@id]"
function parseI18nMeta(i18n?: string): {description?: string, id?: string, meaning?: string} {
  let meaning: string|undefined;
  let description: string|undefined;
  let id: string|undefined;

  if (i18n) {
    // TODO(vicb): figure out how to force a message ID with closure ?
    const idIndex = i18n.indexOf(ID_SEPARATOR);

    const descIndex = i18n.indexOf(MEANING_SEPARATOR);
    let meaningAndDesc: string;
    [meaningAndDesc, id] =
        (idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''];
    [meaning, description] = (descIndex > -1) ?
        [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
        ['', meaningAndDesc];
  }

  return {description, id, meaning};
}

/**
 * Creates a `CssSelector` given a tag name and a map of attributes
 */
function createCssSelector(tag: string, attributes: {[name: string]: string}): CssSelector {
  const cssSelector = new CssSelector();

  cssSelector.setElement(tag);

  Object.getOwnPropertyNames(attributes).forEach((name) => {
    const value = attributes[name];

    cssSelector.addAttribute(name, value);
    if (name.toLowerCase() === 'class') {
      const classes = value.trim().split(/\s+/g);
      classes.forEach(className => cssSelector.addClassName(className));
    }
  });

  return cssSelector;
}
