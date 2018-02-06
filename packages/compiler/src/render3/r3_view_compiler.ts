/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompilePipeSummary, CompileTokenMetadata, CompileTypeMetadata, flatten, identifierName, rendererTypeName, tokenReference, viewClassName} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {BindingForm, BuiltinConverter, ConvertPropertyBindingResult, EventHandlerVars, LocalResolver, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins} from '../compiler_util/expression_converter';
import {ConstantPool, DefinitionKind} from '../constant_pool';
import {AST, AstMemoryEfficientTransformer, AstTransformer, BindingPipe, FunctionCall, ImplicitReceiver, LiteralPrimitive, MethodCall, ParseSpan, PropertyRead} from '../expression_parser/ast';
import {Identifiers} from '../identifiers';
import {LifecycleHooks} from '../lifecycle_reflector';
import * as o from '../output/output_ast';
import {ParseSourceSpan} from '../parse_util';
import {CssSelector} from '../selector';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAst, QueryMatch, RecursiveTemplateAstVisitor, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';
import {OutputContext, error} from '../util';

import {Identifiers as R3} from './r3_identifiers';


/** Name of the context parameter passed into a template function */
const CONTEXT_NAME = 'ctx';

/** Name of the creation mode flag passed into a template function */
const CREATION_MODE_FLAG = 'cm';

/** Name of the temporary to use during data binding */
const TEMPORARY_NAME = '_t';

/** The prefix reference variables */
const REFERENCE_PREFIX = '_r';

/** The name of the implicit context reference */
const IMPLICIT_REFERENCE = '$implicit';

export function compileDirective(
    outputCtx: OutputContext, directive: CompileDirectiveMetadata, reflector: CompileReflector) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  // e.g. 'type: MyDirective`
  definitionMapValues.push(
      {key: 'type', value: outputCtx.importExpr(directive.type.reference), quoted: false});

  // e.g. `factory: () => new MyApp(injectElementRef())`
  const templateFactory = createFactory(directive.type, outputCtx, reflector);
  definitionMapValues.push({key: 'factory', value: templateFactory, quoted: false});

  // e.g 'inputs: {a: 'a'}`
  if (Object.getOwnPropertyNames(directive.inputs).length > 0) {
    definitionMapValues.push(
        {key: 'inputs', quoted: false, value: mapToExpression(directive.inputs)});
  }

  const className = identifierName(directive.type) !;
  className || error(`Cannot resolver the name of ${directive.type}`);

  // Create the partial class to be merged with the actual class.
  outputCtx.statements.push(new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[new o.ClassField(
          /* name */ outputCtx.constantPool.propertyNameOf(DefinitionKind.Directive),
          /* type */ o.INFERRED_TYPE,
          /* modifiers */[o.StmtModifier.Static],
          /* initializer */ o.importExpr(R3.defineDirective).callFn([o.literalMap(
              definitionMapValues)]))],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[]));
}

export function compileComponent(
    outputCtx: OutputContext, component: CompileDirectiveMetadata, pipes: CompilePipeSummary[],
    template: TemplateAst[], reflector: CompileReflector) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  // e.g. `type: MyApp`
  definitionMapValues.push(
      {key: 'type', value: outputCtx.importExpr(component.type.reference), quoted: false});

  // e.g. `tag: 'my-app'`
  // This is optional and only included if the first selector of a component has element.
  const selector = component.selector && CssSelector.parse(component.selector);
  const firstSelector = selector && selector[0];
  if (firstSelector && firstSelector.hasElementSelector()) {
    definitionMapValues.push({key: 'tag', value: o.literal(firstSelector.element), quoted: false});
  }

  // e.g. `attr: ["class", ".my.app"]
  // This is optional an only included if the first selector of a component specifies attributes.
  if (firstSelector) {
    const selectorAttributes = firstSelector.getAttrs();
    if (selectorAttributes.length) {
      definitionMapValues.push({
        key: 'attrs',
        value: outputCtx.constantPool.getConstLiteral(
            o.literalArr(selectorAttributes.map(
                value => value != null ? o.literal(value) : o.literal(undefined))),
            /* forceShared */ true),
        quoted: false
      });
    }
  }

  // e.g. `factory: function MyApp_Factory() { return new MyApp(injectElementRef()); }`
  const templateFactory = createFactory(component.type, outputCtx, reflector);
  definitionMapValues.push({key: 'factory', value: templateFactory, quoted: false});

  // e.g. `template: function MyComponent_Template(_ctx, _cm) {...}`
  const templateTypeName = component.type.reference.name;
  const templateName = templateTypeName ? `${templateTypeName}_Template` : null;
  const pipeMap = new Map(pipes.map<[string, CompilePipeSummary]>(pipe => [pipe.name, pipe]));
  const templateFunctionExpression =
      new TemplateDefinitionBuilder(
          outputCtx, outputCtx.constantPool, reflector, CONTEXT_NAME, ROOT_SCOPE.nestedScope(), 0,
          component.template !.ngContentSelectors, templateTypeName, templateName, pipeMap)
          .buildTemplateFunction(template, []);
  definitionMapValues.push({key: 'template', value: templateFunctionExpression, quoted: false});

  // e.g `inputs: {a: 'a'}`
  if (Object.getOwnPropertyNames(component.inputs).length > 0) {
    definitionMapValues.push(
        {key: 'inputs', quoted: false, value: mapToExpression(component.inputs)});
  }

  // e.g. `features: [NgOnChangesFeature(MyComponent)]`
  const features: o.Expression[] = [];
  if (component.type.lifecycleHooks.some(lifecycle => lifecycle == LifecycleHooks.OnChanges)) {
    features.push(o.importExpr(R3.NgOnChangesFeature, null, null).callFn([outputCtx.importExpr(
        component.type.reference)]));
  }
  if (features.length) {
    definitionMapValues.push({key: 'features', quoted: false, value: o.literalArr(features)});
  }

  const className = identifierName(component.type) !;
  className || error(`Cannot resolver the name of ${component.type}`);

  // Create the partial class to be merged with the actual class.
  outputCtx.statements.push(new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[new o.ClassField(
          /* name */ outputCtx.constantPool.propertyNameOf(DefinitionKind.Component),
          /* type */ o.INFERRED_TYPE,
          /* modifiers */[o.StmtModifier.Static],
          /* initializer */ o.importExpr(R3.defineComponent).callFn([o.literalMap(
              definitionMapValues)]))],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[]));
}


// TODO: Remove these when the things are fully supported
function unknown<T>(arg: o.Expression | o.Statement | TemplateAst): never {
  throw new Error(
      `Builder ${this.constructor.name} is unable to handle ${arg.constructor.name} yet`);
}

function unsupported(feature: string): never {
  if (this) {
    throw new Error(`Builder ${this.constructor.name} doesn't support ${feature} yet`);
  }
  throw new Error(`Feature ${feature} is not supported yet`);
}

const BINDING_INSTRUCTION_MAP: {[index: number]: o.ExternalReference | undefined} = {
  [PropertyBindingType.Property]: R3.elementProperty,
  [PropertyBindingType.Attribute]: R3.elementAttribute,
  [PropertyBindingType.Class]: R3.elementClass,
  [PropertyBindingType.Style]: R3.elementStyle
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

function pipeBinding(args: o.Expression[]): o.ExternalReference {
  switch (args.length) {
    case 0:
      // The first parameter to pipeBind is always the value to be transformed followed
      // by arg.length arguments so the total number of arguments to pipeBind are
      // arg.length + 1.
      return R3.pipeBind1;
    case 1:
      return R3.pipeBind2;
    case 2:
      return R3.pipeBind3;
    default:
      return R3.pipeBindV;
  }
}

class BindingScope {
  private map = new Map<string, o.Expression>();
  private referenceNameIndex = 0;

  constructor(private parent: BindingScope|null) {}

  get(name: string): o.Expression|null {
    let current: BindingScope|null = this;
    while (current) {
      const value = current.map.get(name);
      if (value != null) {
        // Cache the value locally.
        this.map.set(name, value);
        return value;
      }
      current = current.parent;
    }
    return null;
  }

  set(name: string, value: o.Expression): BindingScope {
    !this.map.has(name) ||
        error(`The name ${name} is already defined in scope to be ${this.map.get(name)}`);
    this.map.set(name, value);
    return this;
  }

  nestedScope(): BindingScope { return new BindingScope(this); }

  freshReferenceName(): string {
    let current: BindingScope|null = this;
    // Find the top scope as it maintains the global reference count
    while (current.parent) current = current.parent;
    return `${REFERENCE_PREFIX}${current.referenceNameIndex++}`;
  }
}

const ROOT_SCOPE = new BindingScope(null).set('$event', o.variable('$event'));

class TemplateDefinitionBuilder implements TemplateAstVisitor, LocalResolver {
  private _dataIndex = 0;
  private _bindingContext = 0;
  private _referenceIndex = 0;
  private _temporaryAllocated = false;
  private _prefix: o.Statement[] = [];
  private _creationMode: o.Statement[] = [];
  private _bindingMode: o.Statement[] = [];
  private _hostMode: o.Statement[] = [];
  private _refreshMode: o.Statement[] = [];
  private _postfix: o.Statement[] = [];
  private _contentProjections: Map<NgContentAst, NgContentInfo>;
  private _projectionDefinitionIndex = 0;
  private _pipeConverter: PipeConverter;
  private unsupported = unsupported;
  private invalid = invalid;

  constructor(
      private outputCtx: OutputContext, private constantPool: ConstantPool,
      private reflector: CompileReflector, private contextParameter: string,
      private bindingScope: BindingScope, private level = 0, private ngContentSelectors: string[],
      private contextName: string|null, private templateName: string|null,
      private pipes: Map<string, CompilePipeSummary>) {
    this._pipeConverter =
        new PipeConverter(() => this.allocateDataSlot(), (name, localName, slot, value) => {
          bindingScope.set(localName, value);
          const pipe = pipes.get(name) !;
          pipe || error(`Could not find pipe ${name}`);
          const pipeDefinition = constantPool.getDefinition(
              pipe.type.reference, DefinitionKind.Pipe, outputCtx, /* forceShared */ true);
          this._creationMode.push(
              o.importExpr(R3.pipe)
                  .callFn([
                    o.literal(slot), pipeDefinition, pipeDefinition.callMethod(R3.NEW_METHOD, [])
                  ])
                  .toStmt());
        });
  }

  buildTemplateFunction(asts: TemplateAst[], variables: VariableAst[]): o.FunctionExpr {
    // Create variable bindings
    for (const variable of variables) {
      const variableName = variable.name;
      const expression =
          o.variable(this.contextParameter).prop(variable.value || IMPLICIT_REFERENCE);
      const scopedName = this.bindingScope.freshReferenceName();
      const declaration = o.variable(scopedName).set(expression).toDeclStmt(o.INFERRED_TYPE, [
        o.StmtModifier.Final
      ]);

      // Add the reference to the local scope.
      this.bindingScope.set(variableName, o.variable(scopedName));

      // Declare the local variable in binding mode
      this._bindingMode.push(declaration);
    }

    // Collect content projections
    if (this.ngContentSelectors && this.ngContentSelectors.length > 0) {
      const contentProjections = getContentProjection(asts, this.ngContentSelectors);
      this._contentProjections = contentProjections;
      if (contentProjections.size > 0) {
        const infos: R3CssSelector[] = [];
        Array.from(contentProjections.values()).forEach(info => {
          if (info.selector) {
            infos[info.index - 1] = info.selector;
          }
        });
        const projectionIndex = this._projectionDefinitionIndex = this.allocateDataSlot();
        const parameters: o.Expression[] = [o.literal(projectionIndex)];
        !infos.some(value => !value) || error(`content project information skipped an index`);
        if (infos.length > 1) {
          parameters.push(this.outputCtx.constantPool.getConstLiteral(
              asLiteral(infos), /* forceShared */ true));
        }
        this.instruction(this._creationMode, null, R3.projectionDef, ...parameters);
      }
    }

    templateVisitAll(this, asts);

    const creationMode = this._creationMode.length > 0 ?
        [o.ifStmt(o.variable(CREATION_MODE_FLAG), this._creationMode)] :
        [];

    return o.fn(
        [
          new o.FnParam(this.contextParameter, null), new o.FnParam(CREATION_MODE_FLAG, o.BOOL_TYPE)
        ],
        [
          // Temporary variable declarations (i.e. let _t: any;)
          ...this._prefix,

          // Creating mode (i.e. if (cm) { ... })
          ...creationMode,

          // Binding mode (i.e. ɵp(...))
          ...this._bindingMode,

          // Host mode (i.e. Comp.h(...))
          ...this._hostMode,

          // Refresh mode (i.e. Comp.r(...))
          ...this._refreshMode,

          // Nested templates (i.e. function CompTemplate() {})
          ...this._postfix
        ],
        o.INFERRED_TYPE, null, this.templateName);
  }

  // LocalResolver
  getLocal(name: string): o.Expression|null { return this.bindingScope.get(name); }

  // TemplateAstVisitor
  visitNgContent(ast: NgContentAst) {
    const info = this._contentProjections.get(ast) !;
    info || error(`Expected ${ast.sourceSpan} to be included in content projection collection`);
    const slot = this.allocateDataSlot();
    const parameters = [o.literal(slot), o.literal(this._projectionDefinitionIndex)];
    if (info.index !== 0) {
      parameters.push(o.literal(info.index));
    }
    this.instruction(this._creationMode, ast.sourceSpan, R3.projection, ...parameters);
  }

  private _computeDirectivesArray(directives: DirectiveAst[]) {
    const directiveIndexMap = new Map<any, number>();
    const directiveExpressions: o.Expression[] =
        directives.filter(directive => !directive.directive.isComponent).map(directive => {
          directiveIndexMap.set(directive.directive.type.reference, this.allocateDataSlot());
          return this.typeReference(directive.directive.type.reference);
        });
    return {
      directivesArray: directiveExpressions.length ?
          this.constantPool.getConstLiteral(
              o.literalArr(directiveExpressions), /* forceShared */ true) :
          o.literal(null),
      directiveIndexMap
    };
  }

  // TemplateAstVisitor
  visitElement(ast: ElementAst) {
    let bindingCount = 0;
    const elementIndex = this.allocateDataSlot();
    let componentIndex: number|undefined = undefined;
    const referenceDataSlots = new Map<string, number>();

    // Element creation mode
    const component = findComponent(ast.directives);
    const nullNode = o.literal(null, o.INFERRED_TYPE);
    const parameters: o.Expression[] = [o.literal(elementIndex)];

    // Add component type or element tag
    if (component) {
      parameters.push(this.typeReference(component.directive.type.reference));
      componentIndex = this.allocateDataSlot();
    } else {
      parameters.push(o.literal(ast.name));
    }

    // Add attributes array
    const attributes: o.Expression[] = [];
    for (let attr of ast.attrs) {
      attributes.push(o.literal(attr.name), o.literal(attr.value));
    }
    parameters.push(
        attributes.length > 0 ?
            this.constantPool.getConstLiteral(o.literalArr(attributes), /* forceShared */ true) :
            nullNode);

    // Add directives array
    const {directivesArray, directiveIndexMap} = this._computeDirectivesArray(ast.directives);
    parameters.push(directiveIndexMap.size > 0 ? directivesArray : nullNode);

    if (component && componentIndex != null) {
      // Record the data slot for the component
      directiveIndexMap.set(component.directive.type.reference, componentIndex);
    }

    // Add references array
    if (ast.references && ast.references.length > 0) {
      const references =
          flatten(ast.references.map(reference => {
            const slot = this.allocateDataSlot();
            referenceDataSlots.set(reference.name, slot);
            // Generate the update temporary.
            const variableName = this.bindingScope.freshReferenceName();
            this._bindingMode.push(o.variable(variableName, o.INFERRED_TYPE)
                                       .set(o.importExpr(R3.load).callFn([o.literal(slot)]))
                                       .toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            this.bindingScope.set(reference.name, o.variable(variableName));
            return [reference.name, reference.originalValue];
          })).map(value => o.literal(value));
      parameters.push(
          this.constantPool.getConstLiteral(o.literalArr(references), /* forceShared */ true));
    } else {
      parameters.push(nullNode);
    }

    // Remove trailing null nodes as they are implied.
    while (parameters[parameters.length - 1] === nullNode) {
      parameters.pop();
    }

    // Generate the instruction create element instruction
    this.instruction(this._creationMode, ast.sourceSpan, R3.createElement, ...parameters);

    const implicit = o.variable(this.contextParameter);

    // Generate element input bindings
    for (let input of ast.inputs) {
      if (input.isAnimation) {
        this.unsupported('animations');
      }
      const convertedBinding = this.convertPropertyBinding(implicit, input.value);
      const parameters = [o.literal(elementIndex), o.literal(input.name), convertedBinding];
      const instruction = BINDING_INSTRUCTION_MAP[input.type];
      if (instruction) {
        // TODO(chuckj): runtime: security context?
        this.instruction(
            this._bindingMode, input.sourceSpan, instruction, o.literal(elementIndex),
            o.literal(input.name), convertedBinding);
      } else {
        this.unsupported(`binding ${PropertyBindingType[input.type]}`);
      }
    }

    // Generate directives input bindings
    this._visitDirectives(ast.directives, implicit, elementIndex, directiveIndexMap);

    // Traverse element child nodes
    templateVisitAll(this, ast.children);

    // Finish element construction mode.
    this.instruction(this._creationMode, ast.endSourceSpan || ast.sourceSpan, R3.elementEnd);
  }

  private _visitDirectives(
      directives: DirectiveAst[], implicit: o.Expression, nodeIndex: number,
      directiveIndexMap: Map<any, number>) {
    for (let directive of directives) {
      const directiveIndex = directiveIndexMap.get(directive.directive.type.reference);

      // Creation mode
      // e.g. D(0, TodoComponentDef.n(), TodoComponentDef);
      const directiveType = directive.directive.type.reference;
      const kind =
          directive.directive.isComponent ? DefinitionKind.Component : DefinitionKind.Directive;

      // Note: *do not cache* calls to this.directiveOf() as the constant pool needs to know if the
      // node is referenced multiple times to know that it must generate the reference into a
      // temporary.

      // Bindings
      for (const input of directive.inputs) {
        const convertedBinding = this.convertPropertyBinding(implicit, input.value);
        this.instruction(
            this._bindingMode, directive.sourceSpan, R3.elementProperty, o.literal(nodeIndex),
            o.literal(input.templateName), o.importExpr(R3.bind).callFn([convertedBinding]));
      }

      // e.g. MyDirective.ngDirectiveDef.h(0, 0);
      this._hostMode.push(
          this.definitionOf(directiveType, kind)
              .callMethod(R3.HOST_BINDING_METHOD, [o.literal(directiveIndex), o.literal(nodeIndex)])
              .toStmt());

      // e.g. r(0, 0);
      this.instruction(
          this._refreshMode, directive.sourceSpan, R3.refreshComponent, o.literal(directiveIndex),
          o.literal(nodeIndex));
    }
  }

  // TemplateAstVisitor
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst) {
    const templateIndex = this.allocateDataSlot();

    const templateRef = this.reflector.resolveExternalReference(Identifiers.TemplateRef);
    const templateDirective = ast.directives.find(
        directive => directive.directive.type.diDeps.some(
            dependency =>
                dependency.token != null && (tokenReference(dependency.token) == templateRef)));
    const contextName =
        this.contextName && templateDirective && templateDirective.directive.type.reference.name ?
        `${this.contextName}_${templateDirective.directive.type.reference.name}` :
        null;
    const templateName =
        contextName ? `${contextName}_Template_${templateIndex}` : `Template_${templateIndex}`;
    const templateContext = `ctx${this.level}`;

    const {directivesArray, directiveIndexMap} = this._computeDirectivesArray(ast.directives);

    // e.g. C(1, C1Template)
    this.instruction(
        this._creationMode, ast.sourceSpan, R3.containerCreate, o.literal(templateIndex),
        directivesArray, o.variable(templateName));

    // e.g. Cr(1)
    this.instruction(
        this._refreshMode, ast.sourceSpan, R3.containerRefreshStart, o.literal(templateIndex));

    // Generate directives
    this._visitDirectives(
        ast.directives, o.variable(this.contextParameter), templateIndex, directiveIndexMap);

    // e.g. cr();
    this.instruction(this._refreshMode, ast.sourceSpan, R3.containerRefreshEnd);

    // Create the template function
    const templateVisitor = new TemplateDefinitionBuilder(
        this.outputCtx, this.constantPool, this.reflector, templateContext,
        this.bindingScope.nestedScope(), this.level + 1, this.ngContentSelectors, contextName,
        templateName, this.pipes);
    const templateFunctionExpr = templateVisitor.buildTemplateFunction(ast.children, ast.variables);
    this._postfix.push(templateFunctionExpr.toDeclStmt(templateName, null));
  }

  // These should be handled in the template or element directly.
  readonly visitReference = invalid;
  readonly visitVariable = invalid;
  readonly visitEvent = invalid;
  readonly visitElementProperty = invalid;
  readonly visitAttr = invalid;

  // TemplateAstVisitor
  visitBoundText(ast: BoundTextAst) {
    const nodeIndex = this.allocateDataSlot();

    // Creation mode
    this.instruction(this._creationMode, ast.sourceSpan, R3.text, o.literal(nodeIndex));

    // Refresh mode
    this.instruction(
        this._refreshMode, ast.sourceSpan, R3.textCreateBound, o.literal(nodeIndex),
        this.bind(o.variable(CONTEXT_NAME), ast.value, ast.sourceSpan));
  }

  // TemplateAstVisitor
  visitText(ast: TextAst) {
    // Text is defined in creation mode only.
    this.instruction(
        this._creationMode, ast.sourceSpan, R3.text, o.literal(this.allocateDataSlot()),
        o.literal(ast.value));
  }

  // These should be handled in the template or element directly
  readonly visitDirective = invalid;
  readonly visitDirectiveProperty = invalid;

  private allocateDataSlot() { return this._dataIndex++; }
  private bindingContext() { return `${this._bindingContext++}`; }

  private instruction(
      statements: o.Statement[], span: ParseSourceSpan|null, reference: o.ExternalReference,
      ...params: o.Expression[]) {
    statements.push(o.importExpr(reference, null, span).callFn(params, span).toStmt());
  }

  private typeReference(type: any): o.Expression { return this.outputCtx.importExpr(type); }

  private definitionOf(type: any, kind: DefinitionKind): o.Expression {
    return this.constantPool.getDefinition(type, kind, this.outputCtx);
  }

  private temp(): o.ReadVarExpr {
    if (!this._temporaryAllocated) {
      this._prefix.push(o.variable(TEMPORARY_NAME, o.DYNAMIC_TYPE,  null)
                            .set(o.literal(undefined))
                            .toDeclStmt(o.DYNAMIC_TYPE));
      this._temporaryAllocated = true;
    }
    return o.variable(TEMPORARY_NAME);
  }

  private convertPropertyBinding(implicit: o.Expression, value: AST): o.Expression {
    const pipesConvertedValue = value.visit(this._pipeConverter);
    const convertedPropertyBinding = convertPropertyBinding(
        this, implicit, pipesConvertedValue, this.bindingContext(), BindingForm.TrySimple,
        interpolate);
    this._refreshMode.push(...convertedPropertyBinding.stmts);
    return convertedPropertyBinding.currValExpr;
  }

  private bind(implicit: o.Expression, value: AST, sourceSpan: ParseSourceSpan): o.Expression {
    return this.convertPropertyBinding(implicit, value);
  }
}

export function createFactory(
    type: CompileTypeMetadata, outputCtx: OutputContext,
    reflector: CompileReflector): o.FunctionExpr {
  let args: o.Expression[] = [];

  const elementRef = reflector.resolveExternalReference(Identifiers.ElementRef);
  const templateRef = reflector.resolveExternalReference(Identifiers.TemplateRef);
  const viewContainerRef = reflector.resolveExternalReference(Identifiers.ViewContainerRef);

  for (let dependency of type.diDeps) {
    if (dependency.isValue) {
      unsupported('value dependencies');
    }
    if (dependency.isHost) {
      unsupported('host dependencies');
    }
    const token = dependency.token;
    if (token) {
      const tokenRef = tokenReference(token);
      if (tokenRef === elementRef) {
        args.push(o.importExpr(R3.injectElementRef).callFn([]));
      } else if (tokenRef === templateRef) {
        args.push(o.importExpr(R3.injectTemplateRef).callFn([]));
      } else if (tokenRef === viewContainerRef) {
        args.push(o.importExpr(R3.injectViewContainerRef).callFn([]));
      } else {
        const value =
            token.identifier != null ? outputCtx.importExpr(tokenRef) : o.literal(tokenRef);
        args.push(o.importExpr(R3.inject).callFn([value]));
      }
    } else {
      unsupported('dependency without a token');
    }
  }

  return o.fn(
      [],
      [new o.ReturnStatement(new o.InstantiateExpr(outputCtx.importExpr(type.reference), args))],
      o.INFERRED_TYPE, null, type.reference.name ? `${type.reference.name}_Factory` : null);
}

class PipeConverter extends AstMemoryEfficientTransformer {
  private pipeSlots = new Map<string, number>();
  constructor(
      private allocateSlot: () => number,
      private definePipe:
          (name: string, localName: string, slot: number, value: o.Expression) => void) {
    super();
  }

  // AstMemoryEfficientTransformer
  visitPipe(ast: BindingPipe, context: any): AST {
    // Allocate a slot to create the pipe
    let slot = this.pipeSlots.get(ast.name);
    if (slot == null) {
      slot = this.allocateSlot();
      this.pipeSlots.set(ast.name, slot);
    }
    const slotPseudoLocal = `PIPE:${slot}`;
    const target = new PropertyRead(ast.span, new ImplicitReceiver(ast.span), slotPseudoLocal);
    const bindingId = pipeBinding(ast.args);
    this.definePipe(ast.name, slotPseudoLocal, slot, o.importExpr(bindingId));
    const value = ast.exp.visit(this);
    const args = this.visitAll(ast.args);

    return new FunctionCall(
        ast.span, target, [new LiteralPrimitive(ast.span, slot), value, ...args]);
  }
}

function invalid<T>(arg: o.Expression | o.Statement | TemplateAst): never {
  throw new Error(
      `Invalid state: Visitor ${this.constructor.name} doesn't handle ${o.constructor.name}`);
}

function findComponent(directives: DirectiveAst[]): DirectiveAst|undefined {
  return directives.filter(directive => directive.directive.isComponent)[0];
}

interface NgContentInfo {
  index: number;
  selector?: R3CssSelector;
}

class ContentProjectionVisitor extends RecursiveTemplateAstVisitor {
  private index = 1;
  constructor(
      private projectionMap: Map<NgContentAst, NgContentInfo>,
      private ngContentSelectors: string[]) {
    super();
  }

  visitNgContent(ast: NgContentAst) {
    const selectorText = this.ngContentSelectors[ast.index];
    selectorText != null || error(`could not find selector for index ${ast.index} in ${ast}`);
    if (!selectorText || selectorText === '*') {
      this.projectionMap.set(ast, {index: 0});
    } else {
      const cssSelectors = CssSelector.parse(selectorText);
      this.projectionMap.set(
          ast, {index: this.index++, selector: parseSelectorsToR3Selector(cssSelectors)});
    }
  }
}

function getContentProjection(asts: TemplateAst[], ngContentSelectors: string[]) {
  const projectIndexMap = new Map<NgContentAst, NgContentInfo>();
  const visitor = new ContentProjectionVisitor(projectIndexMap, ngContentSelectors);
  templateVisitAll(visitor, asts);
  return projectIndexMap;
}

// These are a copy the CSS types from core/src/render3/interfaces/projection.ts
// They are duplicated here as they cannot be directly referenced from core.
type R3SimpleCssSelector = (string | null)[];
type R3CssSelectorWithNegations =
    [R3SimpleCssSelector, null] | [R3SimpleCssSelector, R3SimpleCssSelector];
type R3CssSelector = R3CssSelectorWithNegations[];

function parserSelectorToSimpleSelector(selector: CssSelector): R3SimpleCssSelector {
  const classes =
      selector.classNames && selector.classNames.length ? ['class', ...selector.classNames] : [];
  return [selector.element, ...selector.attrs, ...classes];
}

function parserSelectorToR3Selector(selector: CssSelector): R3CssSelectorWithNegations {
  const positive = parserSelectorToSimpleSelector(selector);
  const negative = selector.notSelectors && selector.notSelectors.length &&
      parserSelectorToSimpleSelector(selector.notSelectors[0]);

  return negative ? [positive, negative] : [positive, null];
}

function parseSelectorsToR3Selector(selectors: CssSelector[]): R3CssSelector {
  return selectors.map(parserSelectorToR3Selector);
}

function asLiteral(value: any): o.Expression {
  if (Array.isArray(value)) {
    return o.literalArr(value.map(asLiteral));
  }
  return o.literal(value, o.INFERRED_TYPE);
}

function mapToExpression(map: {[key: string]: any}): o.Expression {
  return o.literalMap(Object.getOwnPropertyNames(map).map(
      key => ({key, quoted: false, value: o.literal(map[key])})));
}
