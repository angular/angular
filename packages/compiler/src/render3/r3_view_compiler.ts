/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompilePipeSummary, CompileTokenMetadata, CompileTypeMetadata, identifierName, rendererTypeName, tokenReference, viewClassName} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {BindingForm, BuiltinConverter, EventHandlerVars, LocalResolver, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins} from '../compiler_util/expression_converter';
import {ConstantPool, DefinitionKind} from '../constant_pool';
import {AST} from '../expression_parser/ast';
import {Identifiers} from '../identifiers';
import * as o from '../output/output_ast';
import {ParseSourceSpan} from '../parse_util';
import {CssSelector} from '../selector';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAst, QueryMatch, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';
import {OutputContext, error} from '../util';

import {Identifiers as R3} from './r3_identifiers';


/** Name of the context parameter passed into a template function */
const CONTEXT_NAME = 'ctx';

/** Name of the creation mode flag passed into a template function */
const CREATION_MODE_FLAG = 'cm';

/** Name of the temporary to use during data binding */
const TEMPORARY_NAME = '_t';

export function compileComponent(
    outputCtx: OutputContext, component: CompileDirectiveMetadata, template: TemplateAst[],
    reflector: CompileReflector) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  // e.g. `type: MyApp`
  definitionMapValues.push(
      {key: 'type', value: outputCtx.importExpr(component.type.reference), quoted: false});

  // e.g. `tag: 'my-app'
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
        value: outputCtx.constantPool.getConstLiteral(o.literalArr(selectorAttributes.map(
            value => value != null ? o.literal(value) : o.literal(undefined)))),
        quoted: false
      });
    }
  }

  // e.g. `template: function(_ctx, _cm) {...}`
  const templateFunctionExpression =
      new TemplateDefinitionBuilder(outputCtx, outputCtx.constantPool, CONTEXT_NAME)
          .buildTemplateFunction(template);
  definitionMapValues.push({key: 'template', value: templateFunctionExpression, quoted: false});


  // e.g. `factory: () => new MyApp(injectElementRef())`
  const templateFactory = createFactory(component.type, outputCtx, reflector);
  definitionMapValues.push({key: 'factory', value: templateFactory, quoted: false});

  const className = identifierName(component.type) !;
  className || error(`Cannot resolver the name of ${component.type}`);

  // Create the partial class to be merged with the actual class.
  outputCtx.statements.push(new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[new o.ClassField(
          /* name */ 'ngComponentDef',
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
  throw new Error(`Builder ${this.constructor.name} is unable to handle ${o.constructor.name} yet`);
}
function unsupported(feature: string): never {
  if (this) {
    throw new Error(`Builder ${this.constructor.name} doesn't support ${feature} yet`);
  }
  throw new Error(`Feature ${feature} is supported yet`);
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
      return o.importExpr(R3.bind1).callFn(args);
    case 5:
      return o.importExpr(R3.bind2).callFn(args);
    case 7:
      return o.importExpr(R3.bind3).callFn(args);
    case 9:
      return o.importExpr(R3.bind4).callFn(args);
    case 11:
      return o.importExpr(R3.bind5).callFn(args);
    case 13:
      return o.importExpr(R3.bind6).callFn(args);
    case 15:
      return o.importExpr(R3.bind7).callFn(args);
    case 17:
      return o.importExpr(R3.bind8).callFn(args);
    case 19:
      return o.importExpr(R3.bind9).callFn(args);
  }
  (args.length > 19 && args.length % 2 == 1) ||
      error(`Invalid interpolation argument length ${args.length}`);
  return o.importExpr(R3.bindV).callFn(args);
}

class TemplateDefinitionBuilder implements TemplateAstVisitor {
  private _dataIndex = 0;
  private _bindingContext = 0;
  private _temporaryAllocated = false;
  private _prefix: o.Statement[] = [];
  private _creationMode: o.Statement[] = [];
  private _bindingMode: o.Statement[] = [];
  private _hostMode: o.Statement[] = [];
  private _refreshMode: o.Statement[] = [];
  private _postfix: o.Statement[] = [];
  private unsupported = unsupported;
  private invalid = invalid;

  constructor(
      private outputCtx: OutputContext, private constantPool: ConstantPool,
      private contextParameter: string, private level = 0) {}

  buildTemplateFunction(asts: TemplateAst[]): o.FunctionExpr {
    templateVisitAll(this, asts);

    return o.fn(
        [
          new o.FnParam(this.contextParameter, null), new o.FnParam(CREATION_MODE_FLAG, o.BOOL_TYPE)
        ],
        [
          // Temporary variable declarations (i.e. let _t: any;)
          ...this._prefix,

          // Creating mode (i.e. if (cm) { ... })
          o.ifStmt(o.variable(CREATION_MODE_FLAG), this._creationMode),

          // Binding mode (i.e. ɵp(...))
          ...this._bindingMode,

          // Host mode (i.e. Comp.h(...))
          ...this._hostMode,

          // Refesh mode (i.e. Comp.r(...))
          ...this._refreshMode,

          // Nested templates (i.e. function CompTemplate() {})
          ...this._postfix
        ],
        o.INFERRED_TYPE);
  }

  // TODO(chuckj): Implement ng-content
  visitNgContent = unknown;

  visitElement(ast: ElementAst) {
    let bindingCount = 0;
    const elementIndex = this.allocateNode();

    // Element creation mode
    const component = findComponent(ast.directives);
    const parameters: o.Expression[] = [o.literal(elementIndex)];
    if (component) {
      parameters.push(this.typeReference(component.directive.type.reference));
    } else {
      parameters.push(o.literal(ast.name));
    }

    const attributes: o.Expression[] = [];
    for (let attr of ast.attrs) {
      attributes.push(o.literal(attr.name), o.literal(attr.value));
    }

    if (attributes.length !== 0) {
      parameters.push(this.constantPool.getConstLiteral(o.literalArr(attributes)));
    }

    this.instruction(this._creationMode, ast.sourceSpan, R3.createElement, ...parameters);

    const implicit = o.variable(this.contextParameter);

    // Generate element input bindings
    for (let input of ast.inputs) {
      if (input.isAnimation) {
        this.unsupported('animations');
      }
      // TODO(chuckj): Builtins transform?
      const convertedBinding = convertPropertyBinding(
          null, implicit, input.value, this.bindingContext(), BindingForm.TrySimple, interpolate);
      this._bindingMode.push(...convertedBinding.stmts);
      const parameters =
          [o.literal(elementIndex), o.literal(input.name), convertedBinding.currValExpr];
      const instruction = BINDING_INSTRUCTION_MAP[input.type];
      if (instruction) {
        // TODO(chuckj): runtime: security context?
        this.instruction(
            this._bindingMode, input.sourceSpan, instruction, o.literal(elementIndex),
            o.literal(input.name), convertedBinding.currValExpr);
      } else {
        this.unsupported(`binding ${PropertyBindingType[input.type]}`);
      }
    }

    // Generate directives input bindings
    this._visitDirectives(ast.directives, implicit, elementIndex);

    // Traverse element child nodes
    templateVisitAll(this, ast.children);


    // Finish element construction mode.
    this.instruction(this._creationMode, ast.endSourceSpan || ast.sourceSpan, R3.elementEnd);
  }

  private _visitDirectives(directives: DirectiveAst[], implicit: o.Expression, nodeIndex: number) {
    for (let directive of directives) {
      const directiveIndex = this.allocateDirective();

      // Creation mode
      // e.g. D(0, TodoComponentDef.n(), TodoComponentDef);
      const directiveType = directive.directive.type.reference;
      const kind =
          directive.directive.isComponent ? DefinitionKind.Component : DefinitionKind.Directive;

      // Note: *do not cache* calls to this.directiveOf() as the constant pool needs to know if the
      // node is referenced multiple times to know that it must generate the reference into a
      // temporary.

      this.instruction(
          this._creationMode, directive.sourceSpan, R3.directiveCreate, o.literal(directiveIndex),
          this.definitionOf(directiveType, kind)
              .callMethod(R3.NEW_METHOD, [], directive.sourceSpan),
          this.definitionOf(directiveType, kind));

      // Bindings
      for (const input of directive.inputs) {
        const convertedBinding = convertPropertyBinding(
            null, implicit, input.value, this.bindingContext(), BindingForm.TrySimple, interpolate);
        this._bindingMode.push(...convertedBinding.stmts);
        this.instruction(
            this._bindingMode, directive.sourceSpan, R3.elementProperty,
            o.literal(input.templateName), o.literal(nodeIndex), convertedBinding.currValExpr);
      }

      // e.g. TodoComponentDef.h(0, 0);
      this._hostMode.push(
          this.definitionOf(directiveType, kind)
              .callMethod(R3.HOST_BINDING_METHOD, [o.literal(directiveIndex), o.literal(nodeIndex)])
              .toStmt());

      // e.g. TodoComponentDef.r(0, 0);
      this._refreshMode.push(
          this.definitionOf(directiveType, kind)
              .callMethod(R3.REFRESH_METHOD, [o.literal(directiveIndex), o.literal(nodeIndex)])
              .toStmt());
    }
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst) {
    const templateIndex = this.allocateNode();

    const templateName = `C${templateIndex}Template`;
    const templateContext = `ctx${this.level}`;

    // TODO(chuckj): attrs?

    // e.g. C(1, C1Template)
    this.instruction(
        this._creationMode, ast.sourceSpan, R3.containerCreate, o.literal(templateIndex),
        o.variable(templateName));

    // Generate directies
    this._visitDirectives(
        ast.directives, o.variable(this.contextParameter),
        // TODO(chuckj): This should be the element index of the element that contained the template
        templateIndex);

    // Create the template function
    const templateVisitor = new TemplateDefinitionBuilder(
        this.outputCtx, this.constantPool, templateContext, this.level + 1);
    const templateFunctionExpr = templateVisitor.buildTemplateFunction(ast.children);
    this._postfix.push(templateFunctionExpr.toDeclStmt(templateName, null));

    // Terminate the definition
    this.instruction(this._creationMode, ast.sourceSpan, R3.containerEnd);
  }

  // These should be handled in the template or element directly.
  readonly visitReference = invalid;
  readonly visitVariable = invalid;
  readonly visitEvent = invalid;
  readonly visitElementProperty = invalid;
  readonly visitAttr = invalid;

  visitBoundText(ast: BoundTextAst) {
    const nodeIndex = this.allocateNode();

    // Creation mode
    this.instruction(this._creationMode, ast.sourceSpan, R3.text, o.literal(nodeIndex));

    // Refresh mode
    this.instruction(
        this._refreshMode, ast.sourceSpan, R3.textCreateBound, o.literal(nodeIndex),
        this.bind(o.variable(this.contextParameter), ast.value, ast.sourceSpan));
  }

  visitText(ast: TextAst) {
    // Text is defined in creation mode only.
    this.instruction(this._creationMode, ast.sourceSpan, R3.text, o.literal(ast.value));
  }

  // These should be handled in the template or element directly
  readonly visitDirective = invalid;
  readonly visitDirectiveProperty = invalid;

  private allocateDirective() { return this._dataIndex++; }
  private allocateNode() { return this._dataIndex++; }
  private bindingContext() { return `${this._bindingContext++}`; }

  private instruction(
      statements: o.Statement[], span: ParseSourceSpan, reference: o.ExternalReference,
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
    const convertedPropertyBinding = convertPropertyBinding(
        null, implicit, value, this.bindingContext(), BindingForm.TrySimple, interpolate);
    this._refreshMode.push(...convertedPropertyBinding.stmts);
    return convertedPropertyBinding.currValExpr;
  }

  private bind(implicit: o.Expression, value: AST, sourceSpan: ParseSourceSpan): o.Expression {
    return o.importExpr(R3.bind).callFn([this.convertPropertyBinding(implicit, value)]);
  }
}

function createFactory(
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
        args.push(o.importExpr(R3.inject).callFn([outputCtx.importExpr(token)]));
      }
    } else {
      unsupported('dependency without a token');
    }
  }

  return o.fn(
      [],
      [new o.ReturnStatement(new o.InstantiateExpr(outputCtx.importExpr(type.reference), args))],
      o.INFERRED_TYPE);
}

function invalid<T>(arg: o.Expression | o.Statement | TemplateAst): never {
  throw new Error(
      `Invalid state: Visitor ${this.constructor.name} doesn't handle ${o.constructor.name}`);
}

function findComponent(directives: DirectiveAst[]): DirectiveAst|undefined {
  return directives.filter(directive => directive.directive.isComponent)[0];
}
