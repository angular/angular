/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  BindingPipe,
  BindingType,
  BoundTarget,
  Call,
  createCssSelectorFromNode,
  CssSelector,
  DYNAMIC_TYPE,
  ImplicitReceiver,
  ParsedEventType,
  ParseSourceSpan,
  PropertyRead,
  R3Identifiers,
  SafeCall,
  SafePropertyRead,
  SchemaMetadata,
  SelectorMatcher,
  TemplateEntity,
  ThisReceiver,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstContent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockTriggers,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstHoverDeferredTrigger,
  TmplAstIcu,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstInteractionDeferredTrigger,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstTemplate,
  TmplAstText,
  TmplAstTextAttribute,
  TmplAstVariable,
  TmplAstHostElement,
  TmplAstViewportDeferredTrigger,
  TransplantedType,
  TmplAstComponent,
  TmplAstDirective,
  Binary,
} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../imports';
import {BindingPropertyName, ClassPropertyName, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {TypeCheckId, TypeCheckableDirectiveMeta, TypeCheckBlockMetadata} from '../api';

import {addExpressionIdentifier, ExpressionIdentifier, markIgnoreDiagnostics} from './comments';
import {
  addParseSpanInfo,
  addTypeCheckId,
  wrapForDiagnostics,
  wrapForTypeChecker,
} from './diagnostics';
import {DomSchemaChecker} from './dom';
import {Environment} from './environment';
import {astToTypescript, ANY_EXPRESSION} from './expression';
import {OutOfBandDiagnosticRecorder} from './oob';
import {
  tsCallMethod,
  tsCastToAny,
  tsCreateElement,
  tsCreateTypeQueryForCoercedInput,
  tsCreateVariable,
  tsDeclareVariable,
} from './ts_util';
import {requiresInlineTypeCtor} from './type_constructor';
import {TypeParameterEmitter} from './type_parameter_emitter';
import {createHostBindingsBlockGuard} from './host_bindings';

/**
 * Controls how generics for the component context class will be handled during TCB generation.
 */
export enum TcbGenericContextBehavior {
  /**
   * References to generic parameter bounds will be emitted via the `TypeParameterEmitter`.
   *
   * The caller must verify that all parameter bounds are emittable in order to use this mode.
   */
  UseEmitter,

  /**
   * Generic parameter declarations will be copied directly from the `ts.ClassDeclaration` of the
   * component class.
   *
   * The caller must only use the generated TCB code in a context where such copies will still be
   * valid, such as an inline type check block.
   */
  CopyClassNodes,

  /**
   * Any generic parameters for the component context class will be set to `any`.
   *
   * Produces a less useful type, but is always safe to use.
   */
  FallbackToAny,
}

/**
 * Given a `ts.ClassDeclaration` for a component, and metadata regarding that component, compose a
 * "type check block" function.
 *
 * When passed through TypeScript's TypeChecker, type errors that arise within the type check block
 * function indicate issues in the template itself.
 *
 * As a side effect of generating a TCB for the component, `ts.Diagnostic`s may also be produced
 * directly for issues within the template which are identified during generation. These issues are
 * recorded in either the `domSchemaChecker` (which checks usage of DOM elements and bindings) as
 * well as the `oobRecorder` (which records errors when the type-checking code generator is unable
 * to sufficiently understand a template).
 *
 * @param env an `Environment` into which type-checking code will be generated.
 * @param ref a `Reference` to the component class which should be type-checked.
 * @param name a `ts.Identifier` to use for the generated `ts.FunctionDeclaration`.
 * @param meta metadata about the component's template and the function being generated.
 * @param domSchemaChecker used to check and record errors regarding improper usage of DOM elements
 * and bindings.
 * @param oobRecorder used to record errors regarding template elements which could not be correctly
 * translated into types during TCB generation.
 * @param genericContextBehavior controls how generic parameters (especially parameters with generic
 * bounds) will be referenced from the generated TCB code.
 */
export function generateTypeCheckBlock(
  env: Environment,
  ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
  name: ts.Identifier,
  meta: TypeCheckBlockMetadata,
  domSchemaChecker: DomSchemaChecker,
  oobRecorder: OutOfBandDiagnosticRecorder,
  genericContextBehavior: TcbGenericContextBehavior,
): ts.FunctionDeclaration {
  const tcb = new Context(
    env,
    domSchemaChecker,
    oobRecorder,
    meta.id,
    meta.boundTarget,
    meta.pipes,
    meta.schemas,
    meta.isStandalone,
    meta.preserveWhitespaces,
  );
  const ctxRawType = env.referenceType(ref);
  if (!ts.isTypeReferenceNode(ctxRawType)) {
    throw new Error(
      `Expected TypeReferenceNode when referencing the ctx param for ${ref.debugName}`,
    );
  }

  let typeParameters: ts.TypeParameterDeclaration[] | undefined = undefined;
  let typeArguments: ts.TypeNode[] | undefined = undefined;

  if (ref.node.typeParameters !== undefined) {
    if (!env.config.useContextGenericType) {
      genericContextBehavior = TcbGenericContextBehavior.FallbackToAny;
    }

    switch (genericContextBehavior) {
      case TcbGenericContextBehavior.UseEmitter:
        // Guaranteed to emit type parameters since we checked that the class has them above.
        typeParameters = new TypeParameterEmitter(ref.node.typeParameters, env.reflector).emit(
          (typeRef) => env.referenceType(typeRef),
        )!;
        typeArguments = typeParameters.map((param) =>
          ts.factory.createTypeReferenceNode(param.name),
        );
        break;
      case TcbGenericContextBehavior.CopyClassNodes:
        typeParameters = [...ref.node.typeParameters];
        typeArguments = typeParameters.map((param) =>
          ts.factory.createTypeReferenceNode(param.name),
        );
        break;
      case TcbGenericContextBehavior.FallbackToAny:
        typeArguments = ref.node.typeParameters.map(() =>
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        );
        break;
    }
  }

  const paramList = [tcbThisParam(ctxRawType.typeName, typeArguments)];
  const statements: ts.Statement[] = [];

  // Add the template type checking code.
  if (tcb.boundTarget.target.template !== undefined) {
    const templateScope = Scope.forNodes(
      tcb,
      null,
      null,
      tcb.boundTarget.target.template,
      /* guard */ null,
    );

    statements.push(renderBlockStatements(env, templateScope, ts.factory.createTrue()));
  }

  // Add the host bindings type checking code.
  if (tcb.boundTarget.target.host !== undefined) {
    const hostScope = Scope.forNodes(tcb, null, tcb.boundTarget.target.host, null, null);
    statements.push(renderBlockStatements(env, hostScope, createHostBindingsBlockGuard()));
  }

  const body = ts.factory.createBlock(statements);
  const fnDecl = ts.factory.createFunctionDeclaration(
    /* modifiers */ undefined,
    /* asteriskToken */ undefined,
    /* name */ name,
    /* typeParameters */ env.config.useContextGenericType ? typeParameters : undefined,
    /* parameters */ paramList,
    /* type */ undefined,
    /* body */ body,
  );
  addTypeCheckId(fnDecl, meta.id);
  return fnDecl;
}

function renderBlockStatements(
  env: Environment,
  scope: Scope,
  wrapperExpression: ts.Expression,
): ts.Statement {
  const scopeStatements = scope.render();
  const innerBody = ts.factory.createBlock([...env.getPreludeStatements(), ...scopeStatements]);

  // Wrap the body in an if statement. This serves two purposes:
  // 1. It allows us to distinguish between the sections of the block (e.g. host or template).
  // 2. It allows the `ts.Printer` to produce better-looking output.
  return ts.factory.createIfStatement(wrapperExpression, innerBody);
}

/** Types that can referenced locally in a template. */
type LocalSymbol =
  | TmplAstElement
  | TmplAstTemplate
  | TmplAstVariable
  | TmplAstLetDeclaration
  | TmplAstReference
  | TmplAstHostElement
  | TmplAstComponent
  | TmplAstDirective;

/**
 * A code generation operation that's involved in the construction of a Type Check Block.
 *
 * The generation of a TCB is non-linear. Bindings within a template may result in the need to
 * construct certain types earlier than they otherwise would be constructed. That is, if the
 * generation of a TCB for a template is broken down into specific operations (constructing a
 * directive, extracting a variable from a let- operation, etc), then it's possible for operations
 * earlier in the sequence to depend on operations which occur later in the sequence.
 *
 * `TcbOp` abstracts the different types of operations which are required to convert a template into
 * a TCB. This allows for two phases of processing for the template, where 1) a linear sequence of
 * `TcbOp`s is generated, and then 2) these operations are executed, not necessarily in linear
 * order.
 *
 * Each `TcbOp` may insert statements into the body of the TCB, and also optionally return a
 * `ts.Expression` which can be used to reference the operation's result.
 */
abstract class TcbOp {
  /**
   * Set to true if this operation can be considered optional. Optional operations are only executed
   * when depended upon by other operations, otherwise they are disregarded. This allows for less
   * code to generate, parse and type-check, overall positively contributing to performance.
   */
  abstract readonly optional: boolean;

  abstract execute(): ts.Expression | null;

  /**
   * Replacement value or operation used while this `TcbOp` is executing (i.e. to resolve circular
   * references during its execution).
   *
   * This is usually a `null!` expression (which asks TS to infer an appropriate type), but another
   * `TcbOp` can be returned in cases where additional code generation is necessary to deal with
   * circular references.
   */
  circularFallback(): TcbOp | ts.Expression {
    return INFER_TYPE_FOR_CIRCULAR_OP_EXPR;
  }
}

/**
 * A `TcbOp` which creates an expression for a native DOM element (or web component) from a
 * `TmplAstElement`.
 *
 * Executing this operation returns a reference to the element variable.
 */
class TcbElementOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private element: TmplAstElement,
  ) {
    super();
  }

  override get optional() {
    // The statement generated by this operation is only used for type-inference of the DOM
    // element's type and won't report diagnostics by itself, so the operation is marked as optional
    // to avoid generating statements for DOM elements that are never referenced.
    return true;
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    // Add the declaration of the element using document.createElement.
    const initializer = tsCreateElement(this.element.name);
    addParseSpanInfo(initializer, this.element.startSourceSpan || this.element.sourceSpan);
    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
}

/**
 * A `TcbOp` which creates an expression for particular let- `TmplAstVariable` on a
 * `TmplAstTemplate`'s context.
 *
 * Executing this operation returns a reference to the variable variable (lol).
 */
class TcbTemplateVariableOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private template: TmplAstTemplate,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): ts.Identifier {
    // Look for a context variable for the template.
    const ctx = this.scope.resolve(this.template);

    // Allocate an identifier for the TmplAstVariable, and initialize it to a read of the variable
    // on the template context.
    const id = this.tcb.allocateId();
    const initializer = ts.factory.createPropertyAccessExpression(
      /* expression */ ctx,
      /* name */ this.variable.value || '$implicit',
    );
    addParseSpanInfo(id, this.variable.keySpan);

    // Declare the variable, and return its identifier.
    let variable: ts.VariableStatement;
    if (this.variable.valueSpan !== undefined) {
      addParseSpanInfo(initializer, this.variable.valueSpan);
      variable = tsCreateVariable(id, wrapForTypeChecker(initializer));
    } else {
      variable = tsCreateVariable(id, initializer);
    }
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
}

/**
 * A `TcbOp` which generates a variable for a `TmplAstTemplate`'s context.
 *
 * Executing this operation returns a reference to the template's context variable.
 */
class TcbTemplateContextOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
  ) {
    super();
  }

  // The declaration of the context variable is only needed when the context is actually referenced.
  override readonly optional = true;

  override execute(): ts.Identifier {
    // Allocate a template ctx variable and declare it with an 'any' type. The type of this variable
    // may be narrowed as a result of template guard conditions.
    const ctx = this.tcb.allocateId();
    const type = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    this.scope.addStatement(tsDeclareVariable(ctx, type));
    return ctx;
  }
}

/**
 * A `TcbOp` which generates a constant for a `TmplAstLetDeclaration`.
 *
 * Executing this operation returns a reference to the `@let` declaration.
 */
class TcbLetDeclarationOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private node: TmplAstLetDeclaration,
  ) {
    super();
  }

  /**
   * `@let` declarations are mandatory, because their expressions
   * should be checked even if they aren't referenced anywhere.
   */
  override readonly optional = false;

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.node.nameSpan);
    const value = tcbExpression(this.node.value, this.tcb, this.scope);
    // Value needs to be wrapped, because spans for the expressions inside of it can
    // be picked up incorrectly as belonging to the full variable declaration.
    const varStatement = tsCreateVariable(id, wrapForTypeChecker(value), ts.NodeFlags.Const);
    addParseSpanInfo(varStatement.declarationList.declarations[0], this.node.sourceSpan);
    this.scope.addStatement(varStatement);
    return id;
  }
}

/**
 * A `TcbOp` which descends into a `TmplAstTemplate`'s children and generates type-checking code for
 * them.
 *
 * This operation wraps the children's type-checking code in an `if` block, which may include one
 * or more type guard conditions that narrow types within the template body.
 */
class TcbTemplateBodyOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private template: TmplAstTemplate,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    // An `if` will be constructed, within which the template's children will be type checked. The
    // `if` is used for two reasons: it creates a new syntactic scope, isolating variables declared
    // in the template's TCB from the outer context, and it allows any directives on the templates
    // to perform type narrowing of either expressions or the template's context.
    //
    // The guard is the `if` block's condition. It's usually set to `true` but directives that exist
    // on the template can trigger extra guard expressions that serve to narrow types within the
    // `if`. `guard` is calculated by starting with `true` and adding other conditions as needed.
    // Collect these into `guards` by processing the directives.

    // By default the guard is simply `true`.
    let guard: ts.Expression | null = null;
    const directiveGuards: ts.Expression[] = [];

    this.addDirectiveGuards(
      directiveGuards,
      this.template,
      this.tcb.boundTarget.getDirectivesOfNode(this.template),
    );

    for (const directive of this.template.directives) {
      this.addDirectiveGuards(
        directiveGuards,
        directive,
        this.tcb.boundTarget.getDirectivesOfNode(directive),
      );
    }

    // If there are any guards from directives, use them instead.
    if (directiveGuards.length > 0) {
      // Pop the first value and use it as the initializer to reduce(). This way, a single guard
      // will be used on its own, but two or more will be combined into binary AND expressions.
      guard = directiveGuards.reduce(
        (expr, dirGuard) =>
          ts.factory.createBinaryExpression(expr, ts.SyntaxKind.AmpersandAmpersandToken, dirGuard),
        directiveGuards.pop()!,
      );
    }

    // Create a new Scope for the template. This constructs the list of operations for the template
    // children, as well as tracks bindings within the template.
    const tmplScope = Scope.forNodes(
      this.tcb,
      this.scope,
      this.template,
      this.template.children,
      guard,
    );

    // Render the template's `Scope` into its statements.
    const statements = tmplScope.render();
    if (statements.length === 0) {
      // As an optimization, don't generate the scope's block if it has no statements. This is
      // beneficial for templates that contain for example `<span *ngIf="first"></span>`, in which
      // case there's no need to render the `NgIf` guard expression. This seems like a minor
      // improvement, however it reduces the number of flow-node antecedents that TypeScript needs
      // to keep into account for such cases, resulting in an overall reduction of
      // type-checking time.
      return null;
    }

    let tmplBlock: ts.Statement = ts.factory.createBlock(statements);
    if (guard !== null) {
      // The scope has a guard that needs to be applied, so wrap the template block into an `if`
      // statement containing the guard expression.
      tmplBlock = ts.factory.createIfStatement(
        /* expression */ guard,
        /* thenStatement */ tmplBlock,
      );
    }
    this.scope.addStatement(tmplBlock);

    return null;
  }

  private addDirectiveGuards(
    guards: ts.Expression[],
    hostNode: TmplAstTemplate | TmplAstDirective,
    directives: TypeCheckableDirectiveMeta[] | null,
  ) {
    if (directives === null || directives.length === 0) {
      return;
    }

    const isTemplate = hostNode instanceof TmplAstTemplate;

    for (const dir of directives) {
      const dirInstId = this.scope.resolve(hostNode, dir);
      const dirId = this.tcb.env.reference(
        dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>,
      );

      // There are two kinds of guards. Template guards (ngTemplateGuards) allow type narrowing of
      // the expression passed to an @Input of the directive. Scan the directive to see if it has
      // any template guards, and generate them if needed.
      dir.ngTemplateGuards.forEach((guard) => {
        // For each template guard function on the directive, look for a binding to that input.
        const boundInput =
          hostNode.inputs.find((i) => i.name === guard.inputName) ||
          (isTemplate
            ? hostNode.templateAttrs.find((input): input is TmplAstBoundAttribute => {
                return input instanceof TmplAstBoundAttribute && input.name === guard.inputName;
              })
            : undefined);
        if (boundInput !== undefined) {
          // If there is such a binding, generate an expression for it.
          const expr = tcbExpression(boundInput.value, this.tcb, this.scope);

          // The expression has already been checked in the type constructor invocation, so
          // it should be ignored when used within a template guard.
          markIgnoreDiagnostics(expr);

          if (guard.type === 'binding') {
            // Use the binding expression itself as guard.
            guards.push(expr);
          } else {
            // Call the guard function on the directive with the directive instance and that
            // expression.
            const guardInvoke = tsCallMethod(dirId, `ngTemplateGuard_${guard.inputName}`, [
              dirInstId,
              expr,
            ]);
            addParseSpanInfo(guardInvoke, boundInput.value.sourceSpan);
            guards.push(guardInvoke);
          }
        }
      });

      // The second kind of guard is a template context guard. This guard narrows the template
      // rendering context variable `ctx`.
      if (dir.hasNgTemplateContextGuard) {
        if (this.tcb.env.config.applyTemplateContextGuards) {
          const ctx = this.scope.resolve(hostNode);
          const guardInvoke = tsCallMethod(dirId, 'ngTemplateContextGuard', [dirInstId, ctx]);
          addParseSpanInfo(guardInvoke, hostNode.sourceSpan);
          guards.push(guardInvoke);
        } else if (
          isTemplate &&
          hostNode.variables.length > 0 &&
          this.tcb.env.config.suggestionsForSuboptimalTypeInference
        ) {
          // The compiler could have inferred a better type for the variables in this template,
          // but was prevented from doing so by the type-checking configuration. Issue a warning
          // diagnostic.
          this.tcb.oobRecorder.suboptimalTypeInference(this.tcb.id, hostNode.variables);
        }
      }
    }
  }
}

/**
 * A `TcbOp` which renders an Angular expression (e.g. `{{foo() && bar.baz}}`).
 *
 * Executing this operation returns nothing.
 */
class TcbExpressionOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private expression: AST,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const expr = tcbExpression(this.expression, this.tcb, this.scope);
    this.scope.addStatement(ts.factory.createExpressionStatement(expr));
    return null;
  }
}

/**
 * A `TcbOp` which constructs an instance of a directive. For generic directives, generic
 * parameters are set to `any` type.
 */
abstract class TcbDirectiveTypeOpBase extends TcbOp {
  constructor(
    protected tcb: Context,
    protected scope: Scope,
    protected node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
    protected dir: TypeCheckableDirectiveMeta,
  ) {
    super();
  }

  override get optional() {
    // The statement generated by this operation is only used to declare the directive's type and
    // won't report diagnostics by itself, so the operation is marked as optional to avoid
    // generating declarations for directives that don't have any inputs/outputs.
    return true;
  }

  override execute(): ts.Identifier {
    const dirRef = this.dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;

    const rawType = this.tcb.env.referenceType(this.dir.ref);

    let type: ts.TypeNode;
    if (this.dir.isGeneric === false || dirRef.node.typeParameters === undefined) {
      type = rawType;
    } else {
      if (!ts.isTypeReferenceNode(rawType)) {
        throw new Error(
          `Expected TypeReferenceNode when referencing the type for ${this.dir.ref.debugName}`,
        );
      }
      const typeArguments = dirRef.node.typeParameters.map(() =>
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      );
      type = ts.factory.createTypeReferenceNode(rawType.typeName, typeArguments);
    }

    const id = this.tcb.allocateId();
    addExpressionIdentifier(id, ExpressionIdentifier.DIRECTIVE);
    addParseSpanInfo(id, this.node.startSourceSpan || this.node.sourceSpan);
    this.scope.addStatement(tsDeclareVariable(id, type));
    return id;
  }
}

/**
 * A `TcbOp` which constructs an instance of a non-generic directive _without_ setting any of its
 * inputs. Inputs are later set in the `TcbDirectiveInputsOp`. Type checking was found to be
 * faster when done in this way as opposed to `TcbDirectiveCtorOp` which is only necessary when the
 * directive is generic.
 *
 * Executing this operation returns a reference to the directive instance variable with its inferred
 * type.
 */
class TcbNonGenericDirectiveTypeOp extends TcbDirectiveTypeOpBase {
  /**
   * Creates a variable declaration for this op's directive of the argument type. Returns the id of
   * the newly created variable.
   */
  override execute(): ts.Identifier {
    const dirRef = this.dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
    if (this.dir.isGeneric) {
      throw new Error(`Assertion Error: expected ${dirRef.debugName} not to be generic.`);
    }
    return super.execute();
  }
}

/**
 * A `TcbOp` which constructs an instance of a generic directive with its generic parameters set
 * to `any` type. This op is like `TcbDirectiveTypeOp`, except that generic parameters are set to
 * `any` type. This is used for situations where we want to avoid inlining.
 *
 * Executing this operation returns a reference to the directive instance variable with its generic
 * type parameters set to `any`.
 */
class TcbGenericDirectiveTypeWithAnyParamsOp extends TcbDirectiveTypeOpBase {
  override execute(): ts.Identifier {
    const dirRef = this.dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
    if (dirRef.node.typeParameters === undefined) {
      throw new Error(
        `Assertion Error: expected typeParameters when creating a declaration for ${dirRef.debugName}`,
      );
    }

    return super.execute();
  }
}

/**
 * A `TcbOp` which creates a variable for a local ref in a template.
 * The initializer for the variable is the variable expression for the directive, template, or
 * element the ref refers to. When the reference is used in the template, those TCB statements will
 * access this variable as well. For example:
 * ```ts
 * var _t1 = document.createElement('div');
 * var _t2 = _t1;
 * _t2.value
 * ```
 * This operation supports more fluent lookups for the `TemplateTypeChecker` when getting a symbol
 * for a reference. In most cases, this isn't essential; that is, the information for the symbol
 * could be gathered without this operation using the `BoundTarget`. However, for the case of
 * ng-template references, we will need this reference variable to not only provide a location in
 * the shim file, but also to narrow the variable to the correct `TemplateRef<T>` type rather than
 * `TemplateRef<any>` (this work is still TODO).
 *
 * Executing this operation returns a reference to the directive instance variable with its inferred
 * type.
 */
class TcbReferenceOp extends TcbOp {
  constructor(
    private readonly tcb: Context,
    private readonly scope: Scope,
    private readonly node: TmplAstReference,
    private readonly host: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    private readonly target: TypeCheckableDirectiveMeta | TmplAstTemplate | TmplAstElement,
  ) {
    super();
  }

  // The statement generated by this operation is only used to for the Type Checker
  // so it can map a reference variable in the template directly to a node in the TCB.
  override readonly optional = true;

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    let initializer: ts.Expression =
      this.target instanceof TmplAstTemplate || this.target instanceof TmplAstElement
        ? this.scope.resolve(this.target)
        : this.scope.resolve(this.host, this.target);

    // The reference is either to an element, an <ng-template> node, or to a directive on an
    // element or template.
    if (
      (this.target instanceof TmplAstElement && !this.tcb.env.config.checkTypeOfDomReferences) ||
      !this.tcb.env.config.checkTypeOfNonDomReferences
    ) {
      // References to DOM nodes are pinned to 'any' when `checkTypeOfDomReferences` is `false`.
      // References to `TemplateRef`s and directives are pinned to 'any' when
      // `checkTypeOfNonDomReferences` is `false`.
      initializer = ts.factory.createAsExpression(
        initializer,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      );
    } else if (this.target instanceof TmplAstTemplate) {
      // Direct references to an <ng-template> node simply require a value of type
      // `TemplateRef<any>`. To get this, an expression of the form
      // `(_t1 as any as TemplateRef<any>)` is constructed.
      initializer = ts.factory.createAsExpression(
        initializer,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      );
      initializer = ts.factory.createAsExpression(
        initializer,
        this.tcb.env.referenceExternalType('@angular/core', 'TemplateRef', [DYNAMIC_TYPE]),
      );
      initializer = ts.factory.createParenthesizedExpression(initializer);
    }
    addParseSpanInfo(initializer, this.node.sourceSpan);
    addParseSpanInfo(id, this.node.keySpan);

    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
}

/**
 * A `TcbOp` which is used when the target of a reference is missing. This operation generates a
 * variable of type any for usages of the invalid reference to resolve to. The invalid reference
 * itself is recorded out-of-band.
 */
class TcbInvalidReferenceOp extends TcbOp {
  constructor(
    private readonly tcb: Context,
    private readonly scope: Scope,
  ) {
    super();
  }

  // The declaration of a missing reference is only needed when the reference is resolved.
  override readonly optional = true;

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    this.scope.addStatement(tsCreateVariable(id, ANY_EXPRESSION));
    return id;
  }
}

/**
 * A `TcbOp` which constructs an instance of a directive with types inferred from its inputs. The
 * inputs themselves are not checked here; checking of inputs is achieved in `TcbDirectiveInputsOp`.
 * Any errors reported in this statement are ignored, as the type constructor call is only present
 * for type-inference.
 *
 * When a Directive is generic, it is required that the TCB generates the instance using this method
 * in order to infer the type information correctly.
 *
 * Executing this operation returns a reference to the directive instance variable with its inferred
 * type.
 */
class TcbDirectiveCtorOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
    private dir: TypeCheckableDirectiveMeta,
  ) {
    super();
  }

  override get optional() {
    // The statement generated by this operation is only used to infer the directive's type and
    // won't report diagnostics by itself, so the operation is marked as optional.
    return true;
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    addExpressionIdentifier(id, ExpressionIdentifier.DIRECTIVE);
    addParseSpanInfo(id, this.node.startSourceSpan || this.node.sourceSpan);

    const genericInputs = new Map<string, TcbDirectiveInput>();
    const boundAttrs = getBoundAttributes(this.dir, this.node);

    for (const attr of boundAttrs) {
      // Skip text attributes if configured to do so.
      if (
        !this.tcb.env.config.checkTypeOfAttributes &&
        attr.attribute instanceof TmplAstTextAttribute
      ) {
        continue;
      }
      for (const {fieldName, isTwoWayBinding} of attr.inputs) {
        // Skip the field if an attribute has already been bound to it; we can't have a duplicate
        // key in the type constructor call.
        if (genericInputs.has(fieldName)) {
          continue;
        }

        const expression = translateInput(attr.attribute, this.tcb, this.scope);

        genericInputs.set(fieldName, {
          type: 'binding',
          field: fieldName,
          expression,
          sourceSpan: attr.attribute.sourceSpan,
          isTwoWayBinding,
        });
      }
    }

    // Add unset directive inputs for each of the remaining unset fields.
    for (const {classPropertyName} of this.dir.inputs) {
      if (!genericInputs.has(classPropertyName)) {
        genericInputs.set(classPropertyName, {type: 'unset', field: classPropertyName});
      }
    }

    // Call the type constructor of the directive to infer a type, and assign the directive
    // instance.
    const typeCtor = tcbCallTypeCtor(this.dir, this.tcb, Array.from(genericInputs.values()));
    markIgnoreDiagnostics(typeCtor);
    this.scope.addStatement(tsCreateVariable(id, typeCtor));
    return id;
  }

  override circularFallback(): TcbOp {
    return new TcbDirectiveCtorCircularFallbackOp(this.tcb, this.scope, this.dir);
  }
}

/**
 * A `TcbOp` which generates code to check input bindings on an element that correspond with the
 * members of a directive.
 *
 * Executing this operation returns nothing.
 */
class TcbDirectiveInputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
    private dir: TypeCheckableDirectiveMeta,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    let dirId: ts.Expression | null = null;

    // TODO(joost): report duplicate properties

    const boundAttrs = getBoundAttributes(this.dir, this.node);
    const seenRequiredInputs = new Set<ClassPropertyName>();

    for (const attr of boundAttrs) {
      // For bound inputs, the property is assigned the binding expression.
      const expr = widenBinding(translateInput(attr.attribute, this.tcb, this.scope), this.tcb);

      let assignment: ts.Expression = wrapForDiagnostics(expr);

      for (const {fieldName, required, transformType, isSignal, isTwoWayBinding} of attr.inputs) {
        let target: ts.LeftHandSideExpression;

        if (required) {
          seenRequiredInputs.add(fieldName);
        }

        // Note: There is no special logic for transforms/coercion with signal inputs.
        // For signal inputs, a `transformType` will never be set as we do not capture
        // the transform in the compiler metadata. Signal inputs incorporate their
        // transform write type into their member type, and we extract it below when
        // setting the `WriteT` of such `InputSignalWithTransform<_, WriteT>`.

        if (this.dir.coercedInputFields.has(fieldName)) {
          let type: ts.TypeNode;

          if (transformType !== null) {
            type = this.tcb.env.referenceTransplantedType(new TransplantedType(transformType));
          } else {
            // The input has a coercion declaration which should be used instead of assigning the
            // expression into the input field directly. To achieve this, a variable is declared
            // with a type of `typeof Directive.ngAcceptInputType_fieldName` which is then used as
            // target of the assignment.
            const dirTypeRef: ts.TypeNode = this.tcb.env.referenceType(this.dir.ref);

            if (!ts.isTypeReferenceNode(dirTypeRef)) {
              throw new Error(
                `Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`,
              );
            }

            type = tsCreateTypeQueryForCoercedInput(dirTypeRef.typeName, fieldName);
          }

          const id = this.tcb.allocateId();
          this.scope.addStatement(tsDeclareVariable(id, type));

          target = id;
        } else if (this.dir.undeclaredInputFields.has(fieldName)) {
          // If no coercion declaration is present nor is the field declared (i.e. the input is
          // declared in a `@Directive` or `@Component` decorator's `inputs` property) there is no
          // assignment target available, so this field is skipped.
          continue;
        } else if (
          !this.tcb.env.config.honorAccessModifiersForInputBindings &&
          this.dir.restrictedInputFields.has(fieldName)
        ) {
          // If strict checking of access modifiers is disabled and the field is restricted
          // (i.e. private/protected/readonly), generate an assignment into a temporary variable
          // that has the type of the field. This achieves type-checking but circumvents the access
          // modifiers.
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }

          const id = this.tcb.allocateId();
          const dirTypeRef = this.tcb.env.referenceType(this.dir.ref);
          if (!ts.isTypeReferenceNode(dirTypeRef)) {
            throw new Error(
              `Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`,
            );
          }
          const type = ts.factory.createIndexedAccessTypeNode(
            ts.factory.createTypeQueryNode(dirId as ts.Identifier),
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(fieldName)),
          );
          const temp = tsDeclareVariable(id, type);
          this.scope.addStatement(temp);
          target = id;
        } else {
          if (dirId === null) {
            dirId = this.scope.resolve(this.node, this.dir);
          }

          // To get errors assign directly to the fields on the instance, using property access
          // when possible. String literal fields may not be valid JS identifiers so we use
          // literal element access instead for those cases.
          target = this.dir.stringLiteralInputFields.has(fieldName)
            ? ts.factory.createElementAccessExpression(
                dirId,
                ts.factory.createStringLiteral(fieldName),
              )
            : ts.factory.createPropertyAccessExpression(
                dirId,
                ts.factory.createIdentifier(fieldName),
              );
        }

        // For signal inputs, we unwrap the target `InputSignal`. Note that
        // we intentionally do the following things:
        //   1. keep the direct access to `dir.[field]` so that modifiers are honored.
        //   2. follow the existing pattern where multiple targets assign a single expression.
        //      This is a significant requirement for language service auto-completion.
        if (isSignal) {
          const inputSignalBrandWriteSymbol = this.tcb.env.referenceExternalSymbol(
            R3Identifiers.InputSignalBrandWriteType.moduleName,
            R3Identifiers.InputSignalBrandWriteType.name,
          );
          if (
            !ts.isIdentifier(inputSignalBrandWriteSymbol) &&
            !ts.isPropertyAccessExpression(inputSignalBrandWriteSymbol)
          ) {
            throw new Error(
              `Expected identifier or property access for reference to ${R3Identifiers.InputSignalBrandWriteType.name}`,
            );
          }

          target = ts.factory.createElementAccessExpression(target, inputSignalBrandWriteSymbol);
        }

        if (attr.attribute.keySpan !== undefined) {
          addParseSpanInfo(target, attr.attribute.keySpan);
        }

        // Two-way bindings accept `T | WritableSignal<T>` so we have to unwrap the value.
        if (isTwoWayBinding && this.tcb.env.config.allowSignalsInTwoWayBindings) {
          assignment = unwrapWritableSignal(assignment, this.tcb);
        }

        // Finally the assignment is extended by assigning it into the target expression.
        assignment = ts.factory.createBinaryExpression(
          target,
          ts.SyntaxKind.EqualsToken,
          assignment,
        );
      }

      addParseSpanInfo(assignment, attr.attribute.sourceSpan);
      // Ignore diagnostics for text attributes if configured to do so.
      if (
        !this.tcb.env.config.checkTypeOfAttributes &&
        attr.attribute instanceof TmplAstTextAttribute
      ) {
        markIgnoreDiagnostics(assignment);
      }

      this.scope.addStatement(ts.factory.createExpressionStatement(assignment));
    }

    this.checkRequiredInputs(seenRequiredInputs);

    return null;
  }

  private checkRequiredInputs(seenRequiredInputs: Set<ClassPropertyName>): void {
    const missing: BindingPropertyName[] = [];

    for (const input of this.dir.inputs) {
      if (input.required && !seenRequiredInputs.has(input.classPropertyName)) {
        missing.push(input.bindingPropertyName);
      }
    }

    if (missing.length > 0) {
      this.tcb.oobRecorder.missingRequiredInputs(
        this.tcb.id,
        this.node,
        this.dir.name,
        this.dir.isComponent,
        missing,
      );
    }
  }
}

/**
 * A `TcbOp` which is used to generate a fallback expression if the inference of a directive type
 * via `TcbDirectiveCtorOp` requires a reference to its own type. This can happen using a template
 * reference:
 *
 * ```html
 * <some-cmp #ref [prop]="ref.foo"></some-cmp>
 * ```
 *
 * In this case, `TcbDirectiveCtorCircularFallbackOp` will add a second inference of the directive
 * type to the type-check block, this time calling the directive's type constructor without any
 * input expressions. This infers the widest possible supertype for the directive, which is used to
 * resolve any recursive references required to infer the real type.
 */
class TcbDirectiveCtorCircularFallbackOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private dir: TypeCheckableDirectiveMeta,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    const typeCtor = this.tcb.env.typeCtorFor(this.dir);
    const circularPlaceholder = ts.factory.createCallExpression(
      typeCtor,
      /* typeArguments */ undefined,
      [ts.factory.createNonNullExpression(ts.factory.createNull())],
    );
    this.scope.addStatement(tsCreateVariable(id, circularPlaceholder));
    return id;
  }
}

/**
 * A `TcbOp` which feeds elements and unclaimed properties to the `DomSchemaChecker`.
 *
 * The DOM schema is not checked via TCB code generation. Instead, the `DomSchemaChecker` ingests
 * elements and property bindings and accumulates synthetic `ts.Diagnostic`s out-of-band. These are
 * later merged with the diagnostics generated from the TCB.
 *
 * For convenience, the TCB iteration of the template is used to drive the `DomSchemaChecker` via
 * the `TcbDomSchemaCheckerOp`.
 */
class TcbDomSchemaCheckerOp extends TcbOp {
  constructor(
    private tcb: Context,
    private element: TmplAstElement | TmplAstComponent | TmplAstHostElement,
    private checkElement: boolean,
    private claimedInputs: Set<string> | null,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): ts.Expression | null {
    const element = this.element;
    const isTemplateElement =
      element instanceof TmplAstElement || element instanceof TmplAstComponent;
    const bindings = isTemplateElement ? element.inputs : element.bindings;

    if (this.checkElement && isTemplateElement) {
      this.tcb.domSchemaChecker.checkElement(
        this.tcb.id,
        this.getTagName(element),
        element.startSourceSpan,
        this.tcb.schemas,
        this.tcb.hostIsStandalone,
      );
    }

    // TODO(alxhub): this could be more efficient.
    for (const binding of bindings) {
      const isPropertyBinding =
        binding.type === BindingType.Property || binding.type === BindingType.TwoWay;

      if (isPropertyBinding && this.claimedInputs?.has(binding.name)) {
        // Skip this binding as it was claimed by a directive.
        continue;
      }

      if (isPropertyBinding && binding.name !== 'style' && binding.name !== 'class') {
        // A direct binding to a property.
        const propertyName = ATTR_TO_PROP.get(binding.name) ?? binding.name;

        if (isTemplateElement) {
          this.tcb.domSchemaChecker.checkTemplateElementProperty(
            this.tcb.id,
            this.getTagName(element),
            propertyName,
            binding.sourceSpan,
            this.tcb.schemas,
            this.tcb.hostIsStandalone,
          );
        } else {
          this.tcb.domSchemaChecker.checkHostElementProperty(
            this.tcb.id,
            element,
            propertyName,
            binding.keySpan,
            this.tcb.schemas,
          );
        }
      }
    }
    return null;
  }

  private getTagName(node: TmplAstElement | TmplAstComponent): string {
    return node instanceof TmplAstElement ? node.name : getComponentTagName(node);
  }
}

/**
 * A `TcbOp` that finds and flags control flow nodes that interfere with content projection.
 *
 * Context:
 * Control flow blocks try to emulate the content projection behavior of `*ngIf` and `*ngFor`
 * in order to reduce breakages when moving from one syntax to the other (see #52414), however the
 * approach only works if there's only one element at the root of the control flow expression.
 * This means that a stray sibling node (e.g. text) can prevent an element from being projected
 * into the right slot. The purpose of the `TcbOp` is to find any places where a node at the root
 * of a control flow expression *would have been projected* into a specific slot, if the control
 * flow node didn't exist.
 */
class TcbControlFlowContentProjectionOp extends TcbOp {
  private readonly category: ts.DiagnosticCategory;

  constructor(
    private tcb: Context,
    private element: TmplAstElement | TmplAstComponent,
    private ngContentSelectors: string[],
    private componentName: string,
  ) {
    super();

    // We only need to account for `error` and `warning` since
    // this check won't be enabled for `suppress`.
    this.category =
      tcb.env.config.controlFlowPreventingContentProjection === 'error'
        ? ts.DiagnosticCategory.Error
        : ts.DiagnosticCategory.Warning;
  }

  override readonly optional = false;

  override execute(): null {
    const controlFlowToCheck = this.findPotentialControlFlowNodes();

    if (controlFlowToCheck.length > 0) {
      const matcher = new SelectorMatcher<string>();

      for (const selector of this.ngContentSelectors) {
        // `*` is a special selector for the catch-all slot.
        if (selector !== '*') {
          matcher.addSelectables(CssSelector.parse(selector), selector);
        }
      }

      for (const root of controlFlowToCheck) {
        for (const child of root.children) {
          if (child instanceof TmplAstElement || child instanceof TmplAstTemplate) {
            matcher.match(createCssSelectorFromNode(child), (_, originalSelector) => {
              this.tcb.oobRecorder.controlFlowPreventingContentProjection(
                this.tcb.id,
                this.category,
                child,
                this.componentName,
                originalSelector,
                root,
                this.tcb.hostPreserveWhitespaces,
              );
            });
          }
        }
      }
    }

    return null;
  }

  private findPotentialControlFlowNodes() {
    const result: Array<
      TmplAstIfBlockBranch | TmplAstSwitchBlockCase | TmplAstForLoopBlock | TmplAstForLoopBlockEmpty
    > = [];

    for (const child of this.element.children) {
      if (child instanceof TmplAstForLoopBlock) {
        if (this.shouldCheck(child)) {
          result.push(child);
        }
        if (child.empty !== null && this.shouldCheck(child.empty)) {
          result.push(child.empty);
        }
      } else if (child instanceof TmplAstIfBlock) {
        for (const branch of child.branches) {
          if (this.shouldCheck(branch)) {
            result.push(branch);
          }
        }
      } else if (child instanceof TmplAstSwitchBlock) {
        for (const current of child.cases) {
          if (this.shouldCheck(current)) {
            result.push(current);
          }
        }
      }
    }

    return result;
  }

  private shouldCheck(node: TmplAstNode & {children: TmplAstNode[]}): boolean {
    // Skip nodes with less than two children since it's impossible
    // for them to run into the issue that we're checking for.
    if (node.children.length < 2) {
      return false;
    }

    let hasSeenRootNode = false;

    // Check the number of root nodes while skipping empty text where relevant.
    for (const child of node.children) {
      // Normally `preserveWhitspaces` would have been accounted for during parsing, however
      // in `ngtsc/annotations/component/src/resources.ts#parseExtractedTemplate` we enable
      // `preserveWhitespaces` to preserve the accuracy of source maps diagnostics. This means
      // that we have to account for it here since the presence of text nodes affects the
      // content projection behavior.
      if (
        !(child instanceof TmplAstText) ||
        this.tcb.hostPreserveWhitespaces ||
        child.value.trim().length > 0
      ) {
        // Content projection will be affected if there's more than one root node.
        if (hasSeenRootNode) {
          return true;
        }
        hasSeenRootNode = true;
      }
    }

    return false;
  }
}

/**
 * A `TcbOp` which creates an expression for a the host element of a directive.
 *
 * Executing this operation returns a reference to the element variable.
 */
class TcbHostElementOp extends TcbOp {
  override readonly optional = true;

  constructor(
    private tcb: Context,
    private scope: Scope,
    private element: TmplAstHostElement,
  ) {
    super();
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    const initializer = tsCreateElement(...this.element.tagNames);
    addParseSpanInfo(initializer, this.element.sourceSpan);
    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
}

/**
 * A `TcbOp` which creates an expression for a native DOM element from a `TmplAstComponent`.
 *
 * Executing this operation returns a reference to the element variable.
 */
class TcbComponentNodeOp extends TcbOp {
  override readonly optional = true;

  constructor(
    private tcb: Context,
    private scope: Scope,
    private component: TmplAstComponent,
  ) {
    super();
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    const initializer = tsCreateElement(getComponentTagName(this.component));
    addParseSpanInfo(initializer, this.component.startSourceSpan || this.component.sourceSpan);
    this.scope.addStatement(tsCreateVariable(id, initializer));
    return id;
  }
}

/**
 * Mapping between attributes names that don't correspond to their element property names.
 * Note: this mapping has to be kept in sync with the equally named mapping in the runtime.
 */
const ATTR_TO_PROP = new Map(
  Object.entries({
    'class': 'className',
    'for': 'htmlFor',
    'formaction': 'formAction',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
  }),
);

/**
 * A `TcbOp` which generates code to check "unclaimed inputs" - bindings on an element which were
 * not attributed to any directive or component, and are instead processed against the HTML element
 * itself.
 *
 * Currently, only the expressions of these bindings are checked. The targets of the bindings are
 * checked against the DOM schema via a `TcbDomSchemaCheckerOp`.
 *
 * Executing this operation returns nothing.
 */
class TcbUnclaimedInputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private inputs: TmplAstBoundAttribute[],
    private target: LocalSymbol,
    private claimedInputs: Set<string> | null,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    // `this.inputs` contains only those bindings not matched by any directive. These bindings go to
    // the element itself.
    let elId: ts.Expression | null = null;

    // TODO(alxhub): this could be more efficient.
    for (const binding of this.inputs) {
      const isPropertyBinding =
        binding.type === BindingType.Property || binding.type === BindingType.TwoWay;

      if (isPropertyBinding && this.claimedInputs?.has(binding.name)) {
        // Skip this binding as it was claimed by a directive.
        continue;
      }

      const expr = widenBinding(tcbExpression(binding.value, this.tcb, this.scope), this.tcb);

      if (this.tcb.env.config.checkTypeOfDomBindings && isPropertyBinding) {
        if (binding.name !== 'style' && binding.name !== 'class') {
          if (elId === null) {
            elId = this.scope.resolve(this.target);
          }
          // A direct binding to a property.
          const propertyName = ATTR_TO_PROP.get(binding.name) ?? binding.name;
          const prop = ts.factory.createElementAccessExpression(
            elId,
            ts.factory.createStringLiteral(propertyName),
          );
          const stmt = ts.factory.createBinaryExpression(
            prop,
            ts.SyntaxKind.EqualsToken,
            wrapForDiagnostics(expr),
          );
          addParseSpanInfo(stmt, binding.sourceSpan);
          this.scope.addStatement(ts.factory.createExpressionStatement(stmt));
        } else {
          this.scope.addStatement(ts.factory.createExpressionStatement(expr));
        }
      } else {
        // A binding to an animation, attribute, class or style. For now, only validate the right-
        // hand side of the expression.
        // TODO: properly check class and style bindings.
        this.scope.addStatement(ts.factory.createExpressionStatement(expr));
      }
    }

    return null;
  }
}

/**
 * A `TcbOp` which generates code to check event bindings on an element that correspond with the
 * outputs of a directive.
 *
 * Executing this operation returns nothing.
 */
export class TcbDirectiveOutputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
    private dir: TypeCheckableDirectiveMeta,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    let dirId: ts.Expression | null = null;
    const outputs = this.dir.outputs;

    for (const output of this.node.outputs) {
      if (
        output.type === ParsedEventType.Animation ||
        !outputs.hasBindingPropertyName(output.name)
      ) {
        continue;
      }

      if (this.tcb.env.config.checkTypeOfOutputEvents && output.name.endsWith('Change')) {
        const inputName = output.name.slice(0, -6);
        checkSplitTwoWayBinding(inputName, output, this.node.inputs, this.tcb);
      }
      // TODO(alxhub): consider supporting multiple fields with the same property name for outputs.
      const field = outputs.getByBindingPropertyName(output.name)![0].classPropertyName;

      if (dirId === null) {
        dirId = this.scope.resolve(this.node, this.dir);
      }
      const outputField = ts.factory.createElementAccessExpression(
        dirId,
        ts.factory.createStringLiteral(field),
      );
      addParseSpanInfo(outputField, output.keySpan);
      if (this.tcb.env.config.checkTypeOfOutputEvents) {
        // For strict checking of directive events, generate a call to the `subscribe` method
        // on the directive's output field to let type information flow into the handler function's
        // `$event` parameter.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Infer);
        const subscribeFn = ts.factory.createPropertyAccessExpression(outputField, 'subscribe');
        const call = ts.factory.createCallExpression(subscribeFn, /* typeArguments */ undefined, [
          handler,
        ]);
        addParseSpanInfo(call, output.sourceSpan);
        this.scope.addStatement(ts.factory.createExpressionStatement(call));
      } else {
        // If strict checking of directive events is disabled:
        //
        // * We still generate the access to the output field as a statement in the TCB so consumers
        //   of the `TemplateTypeChecker` can still find the node for the class member for the
        //   output.
        // * Emit a handler function where the `$event` parameter has an explicit `any` type.
        this.scope.addStatement(ts.factory.createExpressionStatement(outputField));
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Any);
        this.scope.addStatement(ts.factory.createExpressionStatement(handler));
      }
    }

    return null;
  }
}

/**
 * A `TcbOp` which generates code to check "unclaimed outputs" - event bindings on an element which
 * were not attributed to any directive or component, and are instead processed against the HTML
 * element itself.
 *
 * Executing this operation returns nothing.
 */
class TcbUnclaimedOutputsOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private target: LocalSymbol,
    private outputs: TmplAstBoundEvent[],
    private inputs: TmplAstBoundAttribute[] | null,
    private claimedOutputs: Set<string> | null,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    let elId: ts.Expression | null = null;

    // TODO(alxhub): this could be more efficient.
    for (const output of this.outputs) {
      if (this.claimedOutputs?.has(output.name)) {
        // Skip this event handler as it was claimed by a directive.
        continue;
      }

      if (
        this.tcb.env.config.checkTypeOfOutputEvents &&
        this.inputs !== null &&
        output.name.endsWith('Change')
      ) {
        const inputName = output.name.slice(0, -6);
        if (checkSplitTwoWayBinding(inputName, output, this.inputs, this.tcb)) {
          // Skip this event handler as the error was already handled.
          continue;
        }
      }

      if (output.type === ParsedEventType.Animation) {
        // Animation output bindings always have an `$event` parameter of type `AnimationEvent`.
        const eventType = this.tcb.env.config.checkTypeOfAnimationEvents
          ? this.tcb.env.referenceExternalType('@angular/animations', 'AnimationEvent')
          : EventParamType.Any;

        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, eventType);
        this.scope.addStatement(ts.factory.createExpressionStatement(handler));
      } else if (this.tcb.env.config.checkTypeOfDomEvents) {
        // If strict checking of DOM events is enabled, generate a call to `addEventListener` on
        // the element instance so that TypeScript's type inference for
        // `HTMLElement.addEventListener` using `HTMLElementEventMap` to infer an accurate type for
        // `$event` depending on the event name. For unknown event names, TypeScript resorts to the
        // base `Event` type.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Infer);
        let target: ts.Expression;
        // Only check for `window` and `document` since in theory any target can be passed.
        if (output.target === 'window' || output.target === 'document') {
          target = ts.factory.createIdentifier(output.target);
        } else if (elId === null) {
          target = elId = this.scope.resolve(this.target);
        } else {
          target = elId;
        }
        const propertyAccess = ts.factory.createPropertyAccessExpression(
          target,
          'addEventListener',
        );
        addParseSpanInfo(propertyAccess, output.keySpan);
        const call = ts.factory.createCallExpression(
          /* expression */ propertyAccess,
          /* typeArguments */ undefined,
          /* arguments */ [ts.factory.createStringLiteral(output.name), handler],
        );
        addParseSpanInfo(call, output.sourceSpan);
        this.scope.addStatement(ts.factory.createExpressionStatement(call));
      } else {
        // If strict checking of DOM inputs is disabled, emit a handler function where the `$event`
        // parameter has an explicit `any` type.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Any);
        this.scope.addStatement(ts.factory.createExpressionStatement(handler));
      }
    }

    return null;
  }
}

/**
 * A `TcbOp` which generates a completion point for the component context.
 *
 * This completion point looks like `this. ;` in the TCB output, and does not produce diagnostics.
 * TypeScript autocompletion APIs can be used at this completion point (after the '.') to produce
 * autocompletion results of properties and methods from the template's component context.
 */
class TcbComponentContextCompletionOp extends TcbOp {
  constructor(private scope: Scope) {
    super();
  }

  override readonly optional = false;

  override execute(): null {
    const ctx = ts.factory.createThis();
    const ctxDot = ts.factory.createPropertyAccessExpression(ctx, '');
    markIgnoreDiagnostics(ctxDot);
    addExpressionIdentifier(ctxDot, ExpressionIdentifier.COMPONENT_COMPLETION);
    this.scope.addStatement(ts.factory.createExpressionStatement(ctxDot));
    return null;
  }
}

/**
 * A `TcbOp` which renders a variable defined inside of block syntax (e.g. `@if (expr; as var) {}`).
 *
 * Executing this operation returns the identifier which can be used to refer to the variable.
 */
class TcbBlockVariableOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private initializer: ts.Expression,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.variable.keySpan);
    const variable = tsCreateVariable(id, wrapForTypeChecker(this.initializer));
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
}

/**
 * A `TcbOp` which renders a variable that is implicitly available within a block (e.g. `$count`
 * in a `@for` block).
 *
 * Executing this operation returns the identifier which can be used to refer to the variable.
 */
class TcbBlockImplicitVariableOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private type: ts.TypeNode,
    private variable: TmplAstVariable,
  ) {
    super();
  }

  override readonly optional = true;

  override execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    addParseSpanInfo(id, this.variable.keySpan);
    const variable = tsDeclareVariable(id, this.type);
    addParseSpanInfo(variable.declarationList.declarations[0], this.variable.sourceSpan);
    this.scope.addStatement(variable);
    return id;
  }
}

/**
 * A `TcbOp` which renders an `if` template block as a TypeScript `if` statement.
 *
 * Executing this operation returns nothing.
 */
class TcbIfOp extends TcbOp {
  private expressionScopes = new Map<TmplAstIfBlockBranch, Scope>();

  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: TmplAstIfBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const root = this.generateBranch(0);
    root && this.scope.addStatement(root);
    return null;
  }

  private generateBranch(index: number): ts.Statement | undefined {
    const branch = this.block.branches[index];

    if (!branch) {
      return undefined;
    }

    // If the expression is null, it means that it's an `else` statement.
    if (branch.expression === null) {
      const branchScope = this.getBranchScope(this.scope, branch, index);
      return ts.factory.createBlock(branchScope.render());
    }

    // We process the expression first in the parent scope, but create a scope around the block
    // that the body will inherit from. We do this, because we need to declare a separate variable
    // for the case where the expression has an alias _and_ because we need the processed
    // expression when generating the guard for the body.
    const outerScope = Scope.forNodes(this.tcb, this.scope, branch, [], null);
    outerScope.render().forEach((stmt) => this.scope.addStatement(stmt));
    this.expressionScopes.set(branch, outerScope);

    let expression = tcbExpression(branch.expression, this.tcb, this.scope);
    if (branch.expressionAlias !== null) {
      expression = ts.factory.createBinaryExpression(
        ts.factory.createParenthesizedExpression(expression),
        ts.SyntaxKind.AmpersandAmpersandToken,
        outerScope.resolve(branch.expressionAlias),
      );
    }
    const bodyScope = this.getBranchScope(outerScope, branch, index);

    return ts.factory.createIfStatement(
      expression,
      ts.factory.createBlock(bodyScope.render()),
      this.generateBranch(index + 1),
    );
  }

  private getBranchScope(parentScope: Scope, branch: TmplAstIfBlockBranch, index: number): Scope {
    const checkBody = this.tcb.env.config.checkControlFlowBodies;
    return Scope.forNodes(
      this.tcb,
      parentScope,
      null,
      checkBody ? branch.children : [],
      checkBody ? this.generateBranchGuard(index) : null,
    );
  }

  private generateBranchGuard(index: number): ts.Expression | null {
    let guard: ts.Expression | null = null;

    // Since event listeners are inside callbacks, type narrowing doesn't apply to them anymore.
    // To recreate the behavior, we generate an expression that negates all the values of the
    // branches _before_ the current one, and then we add the current branch's expression on top.
    // For example `@if (expr === 1) {} @else if (expr === 2) {} @else if (expr === 3)`, the guard
    // for the last expression will be `!(expr === 1) && !(expr === 2) && expr === 3`.
    for (let i = 0; i <= index; i++) {
      const branch = this.block.branches[i];

      // Skip over branches without an expression.
      if (branch.expression === null) {
        continue;
      }

      // This shouldn't happen since all the state is handled
      // internally, but we have the check just in case.
      if (!this.expressionScopes.has(branch)) {
        throw new Error(`Could not determine expression scope of branch at index ${i}`);
      }

      const expressionScope = this.expressionScopes.get(branch)!;
      let expression: ts.Expression;

      // We need to recreate the expression and mark it to be ignored for diagnostics,
      // because it was already checked as a part of the block's condition and we don't
      // want it to produce a duplicate diagnostic.
      expression = tcbExpression(branch.expression, this.tcb, expressionScope);
      if (branch.expressionAlias !== null) {
        expression = ts.factory.createBinaryExpression(
          ts.factory.createParenthesizedExpression(expression),
          ts.SyntaxKind.AmpersandAmpersandToken,
          expressionScope.resolve(branch.expressionAlias),
        );
      }
      markIgnoreDiagnostics(expression);

      // The expressions of the preceding branches have to be negated
      // (e.g. `expr` becomes `!(expr)`) when comparing in the guard, except
      // for the branch's own expression which is preserved as is.
      const comparisonExpression =
        i === index
          ? expression
          : ts.factory.createPrefixUnaryExpression(
              ts.SyntaxKind.ExclamationToken,
              ts.factory.createParenthesizedExpression(expression),
            );

      // Finally add the expression to the guard with an && operator.
      guard =
        guard === null
          ? comparisonExpression
          : ts.factory.createBinaryExpression(
              guard,
              ts.SyntaxKind.AmpersandAmpersandToken,
              comparisonExpression,
            );
    }

    return guard;
  }
}

/**
 * A `TcbOp` which renders a `switch` block as a TypeScript `switch` statement.
 *
 * Executing this operation returns nothing.
 */
class TcbSwitchOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: TmplAstSwitchBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const switchExpression = tcbExpression(this.block.expression, this.tcb, this.scope);
    const clauses = this.block.cases.map((current) => {
      const checkBody = this.tcb.env.config.checkControlFlowBodies;
      const clauseScope = Scope.forNodes(
        this.tcb,
        this.scope,
        null,
        checkBody ? current.children : [],
        checkBody ? this.generateGuard(current, switchExpression) : null,
      );
      const statements = [...clauseScope.render(), ts.factory.createBreakStatement()];

      return current.expression === null
        ? ts.factory.createDefaultClause(statements)
        : ts.factory.createCaseClause(
            tcbExpression(current.expression, this.tcb, clauseScope),
            statements,
          );
    });

    this.scope.addStatement(
      ts.factory.createSwitchStatement(switchExpression, ts.factory.createCaseBlock(clauses)),
    );

    return null;
  }

  private generateGuard(
    node: TmplAstSwitchBlockCase,
    switchValue: ts.Expression,
  ): ts.Expression | null {
    // For non-default cases, the guard needs to compare against the case value, e.g.
    // `switchExpression === caseExpression`.
    if (node.expression !== null) {
      // The expression needs to be ignored for diagnostics since it has been checked already.
      const expression = tcbExpression(node.expression, this.tcb, this.scope);
      markIgnoreDiagnostics(expression);
      return ts.factory.createBinaryExpression(
        switchValue,
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        expression,
      );
    }

    // To fully narrow the type in the default case, we need to generate an expression that negates
    // the values of all of the other expressions. For example:
    // @switch (expr) {
    //   @case (1) {}
    //   @case (2) {}
    //   @default {}
    // }
    // Will produce the guard `expr !== 1 && expr !== 2`.
    let guard: ts.Expression | null = null;

    for (const current of this.block.cases) {
      if (current.expression === null) {
        continue;
      }

      // The expression needs to be ignored for diagnostics since it has been checked already.
      const expression = tcbExpression(current.expression, this.tcb, this.scope);
      markIgnoreDiagnostics(expression);
      const comparison = ts.factory.createBinaryExpression(
        switchValue,
        ts.SyntaxKind.ExclamationEqualsEqualsToken,
        expression,
      );

      if (guard === null) {
        guard = comparison;
      } else {
        guard = ts.factory.createBinaryExpression(
          guard,
          ts.SyntaxKind.AmpersandAmpersandToken,
          comparison,
        );
      }
    }

    return guard;
  }
}

/**
 * A `TcbOp` which renders a `for` block as a TypeScript `for...of` loop.
 *
 * Executing this operation returns nothing.
 */
class TcbForOfOp extends TcbOp {
  constructor(
    private tcb: Context,
    private scope: Scope,
    private block: TmplAstForLoopBlock,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    const loopScope = Scope.forNodes(
      this.tcb,
      this.scope,
      this.block,
      this.tcb.env.config.checkControlFlowBodies ? this.block.children : [],
      null,
    );
    const initializerId = loopScope.resolve(this.block.item);
    if (!ts.isIdentifier(initializerId)) {
      throw new Error(
        `Could not resolve for loop variable ${this.block.item.name} to an identifier`,
      );
    }
    const initializer = ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(initializerId)],
      ts.NodeFlags.Const,
    );
    addParseSpanInfo(initializer, this.block.item.keySpan);
    // It's common to have a for loop over a nullable value (e.g. produced by the `async` pipe).
    // Add a non-null expression to allow such values to be assigned.
    const expression = ts.factory.createNonNullExpression(
      tcbExpression(this.block.expression, this.tcb, this.scope),
    );
    const trackTranslator = new TcbForLoopTrackTranslator(this.tcb, loopScope, this.block);
    const trackExpression = trackTranslator.translate(this.block.trackBy);
    const statements = [
      ...loopScope.render(),
      ts.factory.createExpressionStatement(trackExpression),
    ];

    this.scope.addStatement(
      ts.factory.createForOfStatement(
        undefined,
        initializer,
        expression,
        ts.factory.createBlock(statements),
      ),
    );

    return null;
  }
}

/**
 * Value used to break a circular reference between `TcbOp`s.
 *
 * This value is returned whenever `TcbOp`s have a circular dependency. The expression is a non-null
 * assertion of the null value (in TypeScript, the expression `null!`). This construction will infer
 * the least narrow type for whatever it's assigned to.
 */
const INFER_TYPE_FOR_CIRCULAR_OP_EXPR = ts.factory.createNonNullExpression(ts.factory.createNull());

/**
 * Overall generation context for the type check block.
 *
 * `Context` handles operations during code generation which are global with respect to the whole
 * block. It's responsible for variable name allocation and management of any imports needed. It
 * also contains the template metadata itself.
 */
export class Context {
  private nextId = 1;

  constructor(
    readonly env: Environment,
    readonly domSchemaChecker: DomSchemaChecker,
    readonly oobRecorder: OutOfBandDiagnosticRecorder,
    readonly id: TypeCheckId,
    readonly boundTarget: BoundTarget<TypeCheckableDirectiveMeta>,
    private pipes: Map<string, PipeMeta> | null,
    readonly schemas: SchemaMetadata[],
    readonly hostIsStandalone: boolean,
    readonly hostPreserveWhitespaces: boolean,
  ) {}

  /**
   * Allocate a new variable name for use within the `Context`.
   *
   * Currently this uses a monotonically increasing counter, but in the future the variable name
   * might change depending on the type of data being stored.
   */
  allocateId(): ts.Identifier {
    return ts.factory.createIdentifier(`_t${this.nextId++}`);
  }

  getPipeByName(name: string): PipeMeta | null {
    if (this.pipes === null || !this.pipes.has(name)) {
      return null;
    }
    return this.pipes.get(name)!;
  }
}

/**
 * Local scope within the type check block for a particular template.
 *
 * The top-level template and each nested `<ng-template>` have their own `Scope`, which exist in a
 * hierarchy. The structure of this hierarchy mirrors the syntactic scopes in the generated type
 * check block, where each nested template is encased in an `if` structure.
 *
 * As a template's `TcbOp`s are executed in a given `Scope`, statements are added via
 * `addStatement()`. When this processing is complete, the `Scope` can be turned into a `ts.Block`
 * via `renderToBlock()`.
 *
 * If a `TcbOp` requires the output of another, it can call `resolve()`.
 */
class Scope {
  /**
   * A queue of operations which need to be performed to generate the TCB code for this scope.
   *
   * This array can contain either a `TcbOp` which has yet to be executed, or a `ts.Expression|null`
   * representing the memoized result of executing the operation. As operations are executed, their
   * results are written into the `opQueue`, overwriting the original operation.
   *
   * If an operation is in the process of being executed, it is temporarily overwritten here with
   * `INFER_TYPE_FOR_CIRCULAR_OP_EXPR`. This way, if a cycle is encountered where an operation
   * depends transitively on its own result, the inner operation will infer the least narrow type
   * that fits instead. This has the same semantics as TypeScript itself when types are referenced
   * circularly.
   */
  private opQueue: (TcbOp | ts.Expression | null)[] = [];

  /**
   * A map of `TmplAstElement`s to the index of their `TcbElementOp` in the `opQueue`
   */
  private elementOpMap = new Map<TmplAstElement, number>();

  /**
   * A map of `TmplAstHostElement`s to the index of their `TcbHostElementOp` in the `opQueue`
   */
  private hostElementOpMap = new Map<TmplAstHostElement, number>();

  /**
   * A map of `TmplAstComponent`s to the index of their `TcbComponentNodeOp` in the `opQueue`
   */
  private componentNodeOpMap = new Map<TmplAstComponent, number>();

  /**
   * A map of maps which tracks the index of `TcbDirectiveCtorOp`s in the `opQueue` for each
   * directive on a `TmplAstElement` or `TmplAstTemplate` node.
   */
  private directiveOpMap = new Map<
    TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    Map<TypeCheckableDirectiveMeta, number>
  >();

  /**
   * A map of `TmplAstReference`s to the index of their `TcbReferenceOp` in the `opQueue`
   */
  private referenceOpMap = new Map<TmplAstReference, number>();

  /**
   * Map of immediately nested <ng-template>s (within this `Scope`) represented by `TmplAstTemplate`
   * nodes to the index of their `TcbTemplateContextOp`s in the `opQueue`.
   */
  private templateCtxOpMap = new Map<TmplAstTemplate, number>();

  /**
   * Map of variables declared on the template that created this `Scope` (represented by
   * `TmplAstVariable` nodes) to the index of their `TcbVariableOp`s in the `opQueue`, or to
   * pre-resolved variable identifiers.
   */
  private varMap = new Map<TmplAstVariable, number | ts.Identifier>();

  /**
   * A map of the names of `TmplAstLetDeclaration`s to the index of their op in the `opQueue`.
   *
   * Assumes that there won't be duplicated `@let` declarations within the same scope.
   */
  private letDeclOpMap = new Map<string, {opIndex: number; node: TmplAstLetDeclaration}>();

  /**
   * Statements for this template.
   *
   * Executing the `TcbOp`s in the `opQueue` populates this array.
   */
  private statements: ts.Statement[] = [];

  /**
   * Names of the for loop context variables and their types.
   */
  private static readonly forLoopContextVariableTypes = new Map<string, ts.KeywordTypeSyntaxKind>([
    ['$first', ts.SyntaxKind.BooleanKeyword],
    ['$last', ts.SyntaxKind.BooleanKeyword],
    ['$even', ts.SyntaxKind.BooleanKeyword],
    ['$odd', ts.SyntaxKind.BooleanKeyword],
    ['$index', ts.SyntaxKind.NumberKeyword],
    ['$count', ts.SyntaxKind.NumberKeyword],
  ]);

  private constructor(
    private tcb: Context,
    private parent: Scope | null = null,
    private guard: ts.Expression | null = null,
  ) {}

  /**
   * Constructs a `Scope` given either a `TmplAstTemplate` or a list of `TmplAstNode`s.
   *
   * @param tcb the overall context of TCB generation.
   * @param parentScope the `Scope` of the parent template (if any) or `null` if this is the root
   * `Scope`.
   * @param scopedNode Node that provides the scope around the child nodes (e.g. a
   * `TmplAstTemplate` node exposing variables to its children).
   * @param children Child nodes that should be appended to the TCB.
   * @param guard an expression that is applied to this scope for type narrowing purposes.
   */
  static forNodes(
    tcb: Context,
    parentScope: Scope | null,
    scopedNode:
      | TmplAstTemplate
      | TmplAstIfBlockBranch
      | TmplAstForLoopBlock
      | TmplAstHostElement
      | null,
    children: TmplAstNode[] | null,
    guard: ts.Expression | null,
  ): Scope {
    const scope = new Scope(tcb, parentScope, guard);

    if (parentScope === null && tcb.env.config.enableTemplateTypeChecker) {
      // Add an autocompletion point for the component context.
      scope.opQueue.push(new TcbComponentContextCompletionOp(scope));
    }

    // If given an actual `TmplAstTemplate` instance, then process any additional information it
    // has.
    if (scopedNode instanceof TmplAstTemplate) {
      // The template's variable declarations need to be added as `TcbVariableOp`s.
      const varMap = new Map<string, TmplAstVariable>();

      for (const v of scopedNode.variables) {
        // Validate that variables on the `TmplAstTemplate` are only declared once.
        if (!varMap.has(v.name)) {
          varMap.set(v.name, v);
        } else {
          const firstDecl = varMap.get(v.name)!;
          tcb.oobRecorder.duplicateTemplateVar(tcb.id, v, firstDecl);
        }
        this.registerVariable(scope, v, new TcbTemplateVariableOp(tcb, scope, scopedNode, v));
      }
    } else if (scopedNode instanceof TmplAstIfBlockBranch) {
      const {expression, expressionAlias} = scopedNode;
      if (expression !== null && expressionAlias !== null) {
        this.registerVariable(
          scope,
          expressionAlias,
          new TcbBlockVariableOp(
            tcb,
            scope,
            tcbExpression(expression, tcb, scope),
            expressionAlias,
          ),
        );
      }
    } else if (scopedNode instanceof TmplAstForLoopBlock) {
      // Register the variable for the loop so it can be resolved by
      // children. It'll be declared once the loop is created.
      const loopInitializer = tcb.allocateId();
      addParseSpanInfo(loopInitializer, scopedNode.item.sourceSpan);
      scope.varMap.set(scopedNode.item, loopInitializer);

      for (const variable of scopedNode.contextVariables) {
        if (!this.forLoopContextVariableTypes.has(variable.value)) {
          throw new Error(`Unrecognized for loop context variable ${variable.name}`);
        }

        const type = ts.factory.createKeywordTypeNode(
          this.forLoopContextVariableTypes.get(variable.value)!,
        );
        this.registerVariable(
          scope,
          variable,
          new TcbBlockImplicitVariableOp(tcb, scope, type, variable),
        );
      }
    } else if (scopedNode instanceof TmplAstHostElement) {
      scope.appendNode(scopedNode);
    }
    if (children !== null) {
      for (const node of children) {
        scope.appendNode(node);
      }
    }
    // Once everything is registered, we need to check if there are `@let`
    // declarations that conflict with other local symbols defined after them.
    for (const variable of scope.varMap.keys()) {
      Scope.checkConflictingLet(scope, variable);
    }
    for (const ref of scope.referenceOpMap.keys()) {
      Scope.checkConflictingLet(scope, ref);
    }
    return scope;
  }

  /** Registers a local variable with a scope. */
  private static registerVariable(scope: Scope, variable: TmplAstVariable, op: TcbOp): void {
    const opIndex = scope.opQueue.push(op) - 1;
    scope.varMap.set(variable, opIndex);
  }

  /**
   * Look up a `ts.Expression` representing the value of some operation in the current `Scope`,
   * including any parent scope(s). This method always returns a mutable clone of the
   * `ts.Expression` with the comments cleared.
   *
   * @param node a `TmplAstNode` of the operation in question. The lookup performed will depend on
   * the type of this node:
   *
   * Assuming `directive` is not present, then `resolve` will return:
   *
   * * `TmplAstElement` - retrieve the expression for the element DOM node
   * * `TmplAstTemplate` - retrieve the template context variable
   * * `TmplAstVariable` - retrieve a template let- variable
   * * `TmplAstLetDeclaration` - retrieve a template `@let` declaration
   * * `TmplAstReference` - retrieve variable created for the local ref
   *
   * @param directive if present, a directive type on a `TmplAstElement` or `TmplAstTemplate` to
   * look up instead of the default for an element or template node.
   */
  resolve(
    node: LocalSymbol,
    directive?: TypeCheckableDirectiveMeta,
  ): ts.Identifier | ts.NonNullExpression {
    // Attempt to resolve the operation locally.
    const res = this.resolveLocal(node, directive);
    if (res !== null) {
      // We want to get a clone of the resolved expression and clear the trailing comments
      // so they don't continue to appear in every place the expression is used.
      // As an example, this would otherwise produce:
      // var _t1 /**T:DIR*/ /*1,2*/ = _ctor1();
      // _t1 /**T:DIR*/ /*1,2*/.input = 'value';
      //
      // In addition, returning a clone prevents the consumer of `Scope#resolve` from
      // attaching comments at the declaration site.
      let clone: ts.Identifier | ts.NonNullExpression;

      if (ts.isIdentifier(res)) {
        clone = ts.factory.createIdentifier(res.text);
      } else if (ts.isNonNullExpression(res)) {
        clone = ts.factory.createNonNullExpression(res.expression);
      } else {
        throw new Error(`Could not resolve ${node} to an Identifier or a NonNullExpression`);
      }

      ts.setOriginalNode(clone, res);
      (clone as any).parent = clone.parent;
      return ts.setSyntheticTrailingComments(clone, []);
    } else if (this.parent !== null) {
      // Check with the parent.
      return this.parent.resolve(node, directive);
    } else {
      throw new Error(`Could not resolve ${node} / ${directive}`);
    }
  }

  /**
   * Add a statement to this scope.
   */
  addStatement(stmt: ts.Statement): void {
    this.statements.push(stmt);
  }

  /**
   * Get the statements.
   */
  render(): ts.Statement[] {
    for (let i = 0; i < this.opQueue.length; i++) {
      // Optional statements cannot be skipped when we are generating the TCB for use
      // by the TemplateTypeChecker.
      const skipOptional = !this.tcb.env.config.enableTemplateTypeChecker;
      this.executeOp(i, skipOptional);
    }
    return this.statements;
  }

  /**
   * Returns an expression of all template guards that apply to this scope, including those of
   * parent scopes. If no guards have been applied, null is returned.
   */
  guards(): ts.Expression | null {
    let parentGuards: ts.Expression | null = null;
    if (this.parent !== null) {
      // Start with the guards from the parent scope, if present.
      parentGuards = this.parent.guards();
    }

    if (this.guard === null) {
      // This scope does not have a guard, so return the parent's guards as is.
      return parentGuards;
    } else if (parentGuards === null) {
      // There's no guards from the parent scope, so this scope's guard represents all available
      // guards.
      return this.guard;
    } else {
      // Both the parent scope and this scope provide a guard, so create a combination of the two.
      // It is important that the parent guard is used as left operand, given that it may provide
      // narrowing that is required for this scope's guard to be valid.
      return ts.factory.createBinaryExpression(
        parentGuards,
        ts.SyntaxKind.AmpersandAmpersandToken,
        this.guard,
      );
    }
  }

  /** Returns whether a template symbol is defined locally within the current scope. */
  isLocal(node: TmplAstVariable | TmplAstLetDeclaration | TmplAstReference): boolean {
    if (node instanceof TmplAstVariable) {
      return this.varMap.has(node);
    }
    if (node instanceof TmplAstLetDeclaration) {
      return this.letDeclOpMap.has(node.name);
    }
    return this.referenceOpMap.has(node);
  }

  private resolveLocal(
    ref: LocalSymbol,
    directive?: TypeCheckableDirectiveMeta,
  ): ts.Expression | null {
    if (ref instanceof TmplAstReference && this.referenceOpMap.has(ref)) {
      return this.resolveOp(this.referenceOpMap.get(ref)!);
    } else if (ref instanceof TmplAstLetDeclaration && this.letDeclOpMap.has(ref.name)) {
      return this.resolveOp(this.letDeclOpMap.get(ref.name)!.opIndex);
    } else if (ref instanceof TmplAstVariable && this.varMap.has(ref)) {
      // Resolving a context variable for this template.
      // Execute the `TcbVariableOp` associated with the `TmplAstVariable`.
      const opIndexOrNode = this.varMap.get(ref)!;
      return typeof opIndexOrNode === 'number' ? this.resolveOp(opIndexOrNode) : opIndexOrNode;
    } else if (
      ref instanceof TmplAstTemplate &&
      directive === undefined &&
      this.templateCtxOpMap.has(ref)
    ) {
      // Resolving the context of the given sub-template.
      // Execute the `TcbTemplateContextOp` for the template.
      return this.resolveOp(this.templateCtxOpMap.get(ref)!);
    } else if (
      (ref instanceof TmplAstElement ||
        ref instanceof TmplAstTemplate ||
        ref instanceof TmplAstComponent ||
        ref instanceof TmplAstDirective) &&
      directive !== undefined &&
      this.directiveOpMap.has(ref)
    ) {
      // Resolving a directive on an element or sub-template.
      const dirMap = this.directiveOpMap.get(ref)!;
      return dirMap.has(directive) ? this.resolveOp(dirMap.get(directive)!) : null;
    } else if (ref instanceof TmplAstElement && this.elementOpMap.has(ref)) {
      // Resolving the DOM node of an element in this template.
      return this.resolveOp(this.elementOpMap.get(ref)!);
    } else if (ref instanceof TmplAstComponent && this.componentNodeOpMap.has(ref)) {
      return this.resolveOp(this.componentNodeOpMap.get(ref)!);
    } else if (ref instanceof TmplAstHostElement && this.hostElementOpMap.has(ref)) {
      return this.resolveOp(this.hostElementOpMap.get(ref)!);
    } else {
      return null;
    }
  }

  /**
   * Like `executeOp`, but assert that the operation actually returned `ts.Expression`.
   */
  private resolveOp(opIndex: number): ts.Expression {
    const res = this.executeOp(opIndex, /* skipOptional */ false);
    if (res === null) {
      throw new Error(`Error resolving operation, got null`);
    }
    return res;
  }

  /**
   * Execute a particular `TcbOp` in the `opQueue`.
   *
   * This method replaces the operation in the `opQueue` with the result of execution (once done)
   * and also protects against a circular dependency from the operation to itself by temporarily
   * setting the operation's result to a special expression.
   */
  private executeOp(opIndex: number, skipOptional: boolean): ts.Expression | null {
    const op = this.opQueue[opIndex];
    if (!(op instanceof TcbOp)) {
      return op;
    }

    if (skipOptional && op.optional) {
      return null;
    }

    // Set the result of the operation in the queue to its circular fallback. If executing this
    // operation results in a circular dependency, this will prevent an infinite loop and allow for
    // the resolution of such cycles.
    this.opQueue[opIndex] = op.circularFallback();
    const res = op.execute();
    // Once the operation has finished executing, it's safe to cache the real result.
    this.opQueue[opIndex] = res;
    return res;
  }

  private appendNode(node: TmplAstNode): void {
    if (node instanceof TmplAstElement) {
      const opIndex = this.opQueue.push(new TcbElementOp(this.tcb, this, node)) - 1;
      this.elementOpMap.set(node, opIndex);
      if (this.tcb.env.config.controlFlowPreventingContentProjection !== 'suppress') {
        this.appendContentProjectionCheckOp(node);
      }
      this.appendDirectivesAndInputsOfElementLikeNode(node);
      this.appendOutputsOfElementLikeNode(node);
      this.appendSelectorlessDirectives(node);
      this.appendChildren(node);
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstTemplate) {
      // Template children are rendered in a child scope.
      this.appendDirectivesAndInputsOfElementLikeNode(node);
      this.appendOutputsOfElementLikeNode(node);
      this.appendSelectorlessDirectives(node);
      const ctxIndex = this.opQueue.push(new TcbTemplateContextOp(this.tcb, this)) - 1;
      this.templateCtxOpMap.set(node, ctxIndex);
      if (this.tcb.env.config.checkTemplateBodies) {
        this.opQueue.push(new TcbTemplateBodyOp(this.tcb, this, node));
      } else if (this.tcb.env.config.alwaysCheckSchemaInTemplateBodies) {
        this.appendDeepSchemaChecks(node.children);
      }
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstComponent) {
      this.appendComponentNode(node);
    } else if (node instanceof TmplAstDeferredBlock) {
      this.appendDeferredBlock(node);
    } else if (node instanceof TmplAstIfBlock) {
      this.opQueue.push(new TcbIfOp(this.tcb, this, node));
    } else if (node instanceof TmplAstSwitchBlock) {
      this.opQueue.push(new TcbSwitchOp(this.tcb, this, node));
    } else if (node instanceof TmplAstForLoopBlock) {
      this.opQueue.push(new TcbForOfOp(this.tcb, this, node));
      node.empty && this.tcb.env.config.checkControlFlowBodies && this.appendChildren(node.empty);
    } else if (node instanceof TmplAstBoundText) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, node.value));
    } else if (node instanceof TmplAstIcu) {
      this.appendIcuExpressions(node);
    } else if (node instanceof TmplAstContent) {
      this.appendChildren(node);
    } else if (node instanceof TmplAstLetDeclaration) {
      const opIndex = this.opQueue.push(new TcbLetDeclarationOp(this.tcb, this, node)) - 1;
      if (this.isLocal(node)) {
        this.tcb.oobRecorder.conflictingDeclaration(this.tcb.id, node);
      } else {
        this.letDeclOpMap.set(node.name, {opIndex, node});
      }
    } else if (node instanceof TmplAstHostElement) {
      const opIndex = this.opQueue.push(new TcbHostElementOp(this.tcb, this, node)) - 1;
      this.hostElementOpMap.set(node, opIndex);
      this.opQueue.push(
        new TcbUnclaimedInputsOp(this.tcb, this, node.bindings, node, null),
        new TcbUnclaimedOutputsOp(this.tcb, this, node, node.listeners, null, null),
        new TcbDomSchemaCheckerOp(this.tcb, node, false, null),
      );
    }
  }

  private appendChildren(node: TmplAstNode & {children: TmplAstNode[]}) {
    for (const child of node.children) {
      this.appendNode(child);
    }
  }

  private checkAndAppendReferencesOfNode(
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
  ): void {
    for (const ref of node.references) {
      const target = this.tcb.boundTarget.getReferenceTarget(ref);

      let ctxIndex: number;
      if (target === null) {
        // The reference is invalid if it doesn't have a target, so report it as an error.
        this.tcb.oobRecorder.missingReferenceTarget(this.tcb.id, ref);

        // Any usages of the invalid reference will be resolved to a variable of type any.
        ctxIndex = this.opQueue.push(new TcbInvalidReferenceOp(this.tcb, this)) - 1;
      } else if (target instanceof TmplAstTemplate || target instanceof TmplAstElement) {
        ctxIndex = this.opQueue.push(new TcbReferenceOp(this.tcb, this, ref, node, target)) - 1;
      } else {
        ctxIndex =
          this.opQueue.push(new TcbReferenceOp(this.tcb, this, ref, node, target.directive)) - 1;
      }
      this.referenceOpMap.set(ref, ctxIndex);
    }
  }

  private appendDirectivesAndInputsOfElementLikeNode(node: TmplAstElement | TmplAstTemplate): void {
    // Collect all the inputs on the element.
    const claimedInputs = new Set<string>();

    // Don't resolve directives when selectorless is enabled and treat all the inputs on the element
    // as unclaimed. In selectorless the inputs are defined either in component or directive nodes.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);

    if (directives === null || directives.length === 0) {
      // If there are no directives, then all inputs are unclaimed inputs, so queue an operation
      // to add them if needed.
      if (node instanceof TmplAstElement) {
        this.opQueue.push(
          new TcbUnclaimedInputsOp(this.tcb, this, node.inputs, node, claimedInputs),
          new TcbDomSchemaCheckerOp(this.tcb, node, /* checkElement */ true, claimedInputs),
        );
      }
      return;
    }

    if (node instanceof TmplAstElement) {
      const isDeferred = this.tcb.boundTarget.isDeferred(node);
      if (!isDeferred && directives.some((dirMeta) => dirMeta.isExplicitlyDeferred)) {
        // This node has directives/components that were defer-loaded (included into
        // `@Component.deferredImports`), but the node itself was used outside of a
        // `@defer` block, which is the error.
        this.tcb.oobRecorder.deferredComponentUsedEagerly(this.tcb.id, node);
      }
    }

    const dirMap = new Map<TypeCheckableDirectiveMeta, number>();
    for (const dir of directives) {
      this.appendDirectiveInputs(dir, node, dirMap);
    }
    this.directiveOpMap.set(node, dirMap);

    // After expanding the directives, we might need to queue an operation to check any unclaimed
    // inputs.
    if (node instanceof TmplAstElement) {
      // Go through the directives and remove any inputs that it claims from `elementInputs`.
      for (const dir of directives) {
        for (const propertyName of dir.inputs.propertyNames) {
          claimedInputs.add(propertyName);
        }
      }

      this.opQueue.push(new TcbUnclaimedInputsOp(this.tcb, this, node.inputs, node, claimedInputs));
      // If there are no directives which match this element, then it's a "plain" DOM element (or a
      // web component), and should be checked against the DOM schema. If any directives match,
      // we must assume that the element could be custom (either a component, or a directive like
      // <router-outlet>) and shouldn't validate the element name itself.
      const checkElement = directives.length === 0;
      this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, checkElement, claimedInputs));
    }
  }

  private appendOutputsOfElementLikeNode(node: TmplAstElement | TmplAstTemplate): void {
    // Collect all the outputs on the element.
    const claimedOutputs = new Set<string>();

    // Don't resolve directives when selectorless is enabled and treat all the outputs on the
    // element as unclaimed. In selectorless the outputs are defined either in component or
    // directive nodes.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);

    if (directives === null || directives.length === 0) {
      // If there are no directives, then all outputs are unclaimed outputs, so queue an operation
      // to add them if needed.
      if (node instanceof TmplAstElement) {
        this.opQueue.push(
          new TcbUnclaimedOutputsOp(
            this.tcb,
            this,
            node,
            node.outputs,
            node.inputs,
            claimedOutputs,
          ),
        );
      }
      return;
    }

    // Queue operations for all directives to check the relevant outputs for a directive.
    for (const dir of directives) {
      this.opQueue.push(new TcbDirectiveOutputsOp(this.tcb, this, node, dir));
    }

    // After expanding the directives, we might need to queue an operation to check any unclaimed
    // outputs.
    if (node instanceof TmplAstElement) {
      // Go through the directives and register any outputs that it claims in `claimedOutputs`.
      for (const dir of directives) {
        for (const outputProperty of dir.outputs.propertyNames) {
          claimedOutputs.add(outputProperty);
        }
      }

      this.opQueue.push(
        new TcbUnclaimedOutputsOp(this.tcb, this, node, node.outputs, node.inputs, claimedOutputs),
      );
    }
  }

  private appendInputsOfSelectorlessNode(node: TmplAstComponent | TmplAstDirective): void {
    // Only resolve the directives that were brought in by this specific directive.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    const claimedInputs = new Set<string>();

    if (directives !== null && directives.length > 0) {
      const dirMap = new Map<TypeCheckableDirectiveMeta, number>();
      for (const dir of directives) {
        this.appendDirectiveInputs(dir, node, dirMap);

        for (const propertyName of dir.inputs.propertyNames) {
          claimedInputs.add(propertyName);
        }
      }
      this.directiveOpMap.set(node, dirMap);
    }

    // In selectorless all directive inputs have to be claimed.
    if (node instanceof TmplAstDirective) {
      for (const input of node.inputs) {
        if (!claimedInputs.has(input.name)) {
          this.tcb.oobRecorder.unclaimedDirectiveBinding(this.tcb.id, node, input);
        }
      }

      for (const attr of node.attributes) {
        if (!claimedInputs.has(attr.name)) {
          this.tcb.oobRecorder.unclaimedDirectiveBinding(this.tcb.id, node, attr);
        }
      }
    } else {
      const checkElement = node.tagName !== null;
      this.opQueue.push(
        new TcbUnclaimedInputsOp(this.tcb, this, node.inputs, node, claimedInputs),
        new TcbDomSchemaCheckerOp(this.tcb, node, checkElement, claimedInputs),
      );
    }
  }

  private appendOutputsOfSelectorlessNode(node: TmplAstComponent | TmplAstDirective): void {
    // Only resolve the directives that were brought in by this specific directive.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    const claimedOutputs = new Set<string>();

    if (directives !== null && directives.length > 0) {
      for (const dir of directives) {
        this.opQueue.push(new TcbDirectiveOutputsOp(this.tcb, this, node, dir));

        for (const outputProperty of dir.outputs.propertyNames) {
          claimedOutputs.add(outputProperty);
        }
      }
    }

    // In selectorless all directive outputs have to be claimed.
    if (node instanceof TmplAstDirective) {
      for (const output of node.outputs) {
        if (!claimedOutputs.has(output.name)) {
          this.tcb.oobRecorder.unclaimedDirectiveBinding(this.tcb.id, node, output);
        }
      }
    } else {
      this.opQueue.push(
        new TcbUnclaimedOutputsOp(this.tcb, this, node, node.outputs, node.inputs, claimedOutputs),
      );
    }
  }

  private appendDirectiveInputs(
    dir: TypeCheckableDirectiveMeta,
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    dirMap: Map<TypeCheckableDirectiveMeta, number>,
  ): void {
    let directiveOp: TcbOp;
    const host = this.tcb.env.reflector;
    const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;

    if (!dir.isGeneric) {
      // The most common case is that when a directive is not generic, we use the normal
      // `TcbNonDirectiveTypeOp`.
      directiveOp = new TcbNonGenericDirectiveTypeOp(this.tcb, this, node, dir);
    } else if (
      !requiresInlineTypeCtor(dirRef.node, host, this.tcb.env) ||
      this.tcb.env.config.useInlineTypeConstructors
    ) {
      // For generic directives, we use a type constructor to infer types. If a directive requires
      // an inline type constructor, then inlining must be available to use the
      // `TcbDirectiveCtorOp`. If not we, we fallback to using `any` – see below.
      directiveOp = new TcbDirectiveCtorOp(this.tcb, this, node, dir);
    } else {
      // If inlining is not available, then we give up on inferring the generic params, and use
      // `any` type for the directive's generic parameters.
      directiveOp = new TcbGenericDirectiveTypeWithAnyParamsOp(this.tcb, this, node, dir);
    }

    const dirIndex = this.opQueue.push(directiveOp) - 1;
    dirMap.set(dir, dirIndex);

    this.opQueue.push(new TcbDirectiveInputsOp(this.tcb, this, node, dir));
  }

  private appendSelectorlessDirectives(
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent,
  ): void {
    for (const directive of node.directives) {
      // Check that the directive exists.
      if (!this.tcb.boundTarget.referencedDirectiveExists(directive.name)) {
        this.tcb.oobRecorder.missingNamedTemplateDependency(this.tcb.id, directive);
        continue;
      }

      // Check that the class is a directive class.
      const directives = this.tcb.boundTarget.getDirectivesOfNode(directive);
      if (
        directives === null ||
        directives.length === 0 ||
        directives.some((dir) => dir.isComponent || !dir.isStandalone)
      ) {
        this.tcb.oobRecorder.incorrectTemplateDependencyType(this.tcb.id, directive);
        continue;
      }

      this.appendInputsOfSelectorlessNode(directive);
      this.appendOutputsOfSelectorlessNode(directive);
      this.checkAndAppendReferencesOfNode(directive);
    }
  }

  private appendDeepSchemaChecks(nodes: TmplAstNode[]): void {
    for (const node of nodes) {
      if (!(node instanceof TmplAstElement || node instanceof TmplAstTemplate)) {
        continue;
      }

      if (node instanceof TmplAstElement) {
        const claimedInputs = new Set<string>();
        let directives = this.tcb.boundTarget.getDirectivesOfNode(node);

        for (const dirNode of node.directives) {
          const directiveResults = this.tcb.boundTarget.getDirectivesOfNode(dirNode);

          if (directiveResults !== null && directiveResults.length > 0) {
            directives ??= [];
            directives.push(...directiveResults);
          }
        }

        let hasDirectives: boolean;
        if (directives === null || directives.length === 0) {
          hasDirectives = false;
        } else {
          hasDirectives = true;
          for (const dir of directives) {
            for (const propertyName of dir.inputs.propertyNames) {
              claimedInputs.add(propertyName);
            }
          }
        }
        this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, !hasDirectives, claimedInputs));
      }

      this.appendDeepSchemaChecks(node.children);
    }
  }

  private appendIcuExpressions(node: TmplAstIcu): void {
    for (const variable of Object.values(node.vars)) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, variable.value));
    }
    for (const placeholder of Object.values(node.placeholders)) {
      if (placeholder instanceof TmplAstBoundText) {
        this.opQueue.push(new TcbExpressionOp(this.tcb, this, placeholder.value));
      }
    }
  }

  private appendContentProjectionCheckOp(root: TmplAstElement | TmplAstComponent): void {
    const meta =
      this.tcb.boundTarget.getDirectivesOfNode(root)?.find((meta) => meta.isComponent) || null;

    if (meta !== null && meta.ngContentSelectors !== null && meta.ngContentSelectors.length > 0) {
      const selectors = meta.ngContentSelectors;

      // We don't need to generate anything for components that don't have projection
      // slots, or they only have one catch-all slot (represented by `*`).
      if (selectors.length > 1 || (selectors.length === 1 && selectors[0] !== '*')) {
        this.opQueue.push(
          new TcbControlFlowContentProjectionOp(this.tcb, root, selectors, meta.name),
        );
      }
    }
  }

  private appendComponentNode(node: TmplAstComponent): void {
    // TODO(crisbeto): should we still append the children if the component is invalid?
    // Check that the referenced class exists.
    if (!this.tcb.boundTarget.referencedDirectiveExists(node.componentName)) {
      this.tcb.oobRecorder.missingNamedTemplateDependency(this.tcb.id, node);
      return;
    }

    // Check that the class is a component.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    if (
      directives === null ||
      directives.length === 0 ||
      directives.every((dir) => !dir.isComponent || !dir.isStandalone)
    ) {
      this.tcb.oobRecorder.incorrectTemplateDependencyType(this.tcb.id, node);
      return;
    }

    const opIndex = this.opQueue.push(new TcbComponentNodeOp(this.tcb, this, node)) - 1;
    this.componentNodeOpMap.set(node, opIndex);
    if (this.tcb.env.config.controlFlowPreventingContentProjection !== 'suppress') {
      this.appendContentProjectionCheckOp(node);
    }
    this.appendInputsOfSelectorlessNode(node);
    this.appendOutputsOfSelectorlessNode(node);
    this.appendSelectorlessDirectives(node);
    this.appendChildren(node);
    this.checkAndAppendReferencesOfNode(node);
  }

  private appendDeferredBlock(block: TmplAstDeferredBlock): void {
    this.appendDeferredTriggers(block, block.triggers);
    this.appendDeferredTriggers(block, block.prefetchTriggers);

    // Only the `when` hydration trigger needs to be checked.
    if (block.hydrateTriggers.when) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, block.hydrateTriggers.when.value));
    }

    this.appendChildren(block);

    if (block.placeholder !== null) {
      this.appendChildren(block.placeholder);
    }

    if (block.loading !== null) {
      this.appendChildren(block.loading);
    }

    if (block.error !== null) {
      this.appendChildren(block.error);
    }
  }

  private appendDeferredTriggers(
    block: TmplAstDeferredBlock,
    triggers: TmplAstDeferredBlockTriggers,
  ): void {
    if (triggers.when !== undefined) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, triggers.when.value));
    }

    if (triggers.hover !== undefined) {
      this.validateReferenceBasedDeferredTrigger(block, triggers.hover);
    }

    if (triggers.interaction !== undefined) {
      this.validateReferenceBasedDeferredTrigger(block, triggers.interaction);
    }

    if (triggers.viewport !== undefined) {
      this.validateReferenceBasedDeferredTrigger(block, triggers.viewport);
    }
  }

  private validateReferenceBasedDeferredTrigger(
    block: TmplAstDeferredBlock,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void {
    if (trigger.reference === null) {
      if (block.placeholder === null) {
        this.tcb.oobRecorder.deferImplicitTriggerMissingPlaceholder(this.tcb.id, trigger);
        return;
      }

      let rootNode: TmplAstNode | null = null;

      for (const child of block.placeholder.children) {
        // Skip over empty text nodes if the host doesn't preserve whitespaces.
        if (
          !this.tcb.hostPreserveWhitespaces &&
          child instanceof TmplAstText &&
          child.value.trim().length === 0
        ) {
          continue;
        }

        // Capture the first root node.
        if (rootNode === null) {
          rootNode = child;
        } else {
          // More than one root node is invalid. Reset it and break
          // the loop so the assertion below can flag it.
          rootNode = null;
          break;
        }
      }

      if (rootNode === null || !(rootNode instanceof TmplAstElement)) {
        this.tcb.oobRecorder.deferImplicitTriggerInvalidPlaceholder(this.tcb.id, trigger);
      }
      return;
    }

    if (this.tcb.boundTarget.getDeferredTriggerTarget(block, trigger) === null) {
      this.tcb.oobRecorder.inaccessibleDeferredTriggerElement(this.tcb.id, trigger);
    }
  }

  /** Reports a diagnostic if there are any `@let` declarations that conflict with a node. */
  private static checkConflictingLet(scope: Scope, node: TmplAstVariable | TmplAstReference): void {
    if (scope.letDeclOpMap.has(node.name)) {
      scope.tcb.oobRecorder.conflictingDeclaration(
        scope.tcb.id,
        scope.letDeclOpMap.get(node.name)!.node,
      );
    }
  }
}

interface TcbBoundAttribute {
  attribute: TmplAstBoundAttribute | TmplAstTextAttribute;
  inputs: {
    fieldName: ClassPropertyName;
    required: boolean;
    isSignal: boolean;
    transformType: Reference<ts.TypeNode> | null;
    isTwoWayBinding: boolean;
  }[];
}

/**
 * Create the `this` parameter to the top-level TCB function, with the given generic type
 * arguments.
 */
function tcbThisParam(
  name: ts.EntityName,
  typeArguments: ts.TypeNode[] | undefined,
): ts.ParameterDeclaration {
  return ts.factory.createParameterDeclaration(
    /* modifiers */ undefined,
    /* dotDotDotToken */ undefined,
    /* name */ 'this',
    /* questionToken */ undefined,
    /* type */ ts.factory.createTypeReferenceNode(name, typeArguments),
    /* initializer */ undefined,
  );
}

/**
 * Process an `AST` expression and convert it into a `ts.Expression`, generating references to the
 * correct identifiers in the current scope.
 */
function tcbExpression(ast: AST, tcb: Context, scope: Scope): ts.Expression {
  const translator = new TcbExpressionTranslator(tcb, scope);
  return translator.translate(ast);
}

class TcbExpressionTranslator {
  constructor(
    protected tcb: Context,
    protected scope: Scope,
  ) {}

  translate(ast: AST): ts.Expression {
    // `astToTypescript` actually does the conversion. A special resolver `tcbResolve` is passed
    // which interprets specific expression nodes that interact with the `ImplicitReceiver`. These
    // nodes actually refer to identifiers within the current scope.
    return astToTypescript(ast, (ast) => this.resolve(ast), this.tcb.env.config);
  }

  /**
   * Resolve an `AST` expression within the given scope.
   *
   * Some `AST` expressions refer to top-level concepts (references, variables, the component
   * context). This method assists in resolving those.
   */
  protected resolve(ast: AST): ts.Expression | null {
    if (
      ast instanceof PropertyRead &&
      ast.receiver instanceof ImplicitReceiver &&
      !(ast.receiver instanceof ThisReceiver)
    ) {
      // Try to resolve a bound target for this expression. If no such target is available, then
      // the expression is referencing the top-level component context. In that case, `null` is
      // returned here to let it fall through resolution so it will be caught when the
      // `ImplicitReceiver` is resolved in the branch below.
      const target = this.tcb.boundTarget.getExpressionTarget(ast);
      const targetExpression = target === null ? null : this.getTargetNodeExpression(target, ast);
      if (
        target instanceof TmplAstLetDeclaration &&
        !this.isValidLetDeclarationAccess(target, ast)
      ) {
        this.tcb.oobRecorder.letUsedBeforeDefinition(this.tcb.id, ast, target);
        // Cast the expression to `any` so we don't produce additional diagnostics.
        // We don't use `markIgnoreForDiagnostics` here, because it won't prevent duplicate
        // diagnostics for nested accesses in cases like `@let value = value.foo.bar.baz`.
        if (targetExpression !== null) {
          return ts.factory.createAsExpression(
            targetExpression,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
          );
        }
      }
      return targetExpression;
    } else if (
      ast instanceof Binary &&
      Binary.isAssignmentOperation(ast.operation) &&
      ast.left instanceof PropertyRead &&
      ast.left.receiver instanceof ImplicitReceiver
    ) {
      const read = ast.left;
      const target = this.tcb.boundTarget.getExpressionTarget(read);
      if (target === null) {
        return null;
      }

      const targetExpression = this.getTargetNodeExpression(target, read);
      const expr = this.translate(ast.right);
      const result = ts.factory.createParenthesizedExpression(
        ts.factory.createBinaryExpression(targetExpression, ts.SyntaxKind.EqualsToken, expr),
      );
      addParseSpanInfo(result, read.sourceSpan);

      // Ignore diagnostics from TS produced for writes to `@let` and re-report them using
      // our own infrastructure. We can't rely on the TS reporting, because it includes
      // the name of the auto-generated TCB variable name.
      if (target instanceof TmplAstLetDeclaration) {
        markIgnoreDiagnostics(result);
        this.tcb.oobRecorder.illegalWriteToLetDeclaration(this.tcb.id, read, target);
      }

      return result;
    } else if (ast instanceof ImplicitReceiver) {
      // AST instances representing variables and references look very similar to property reads
      // or method calls from the component context: both have the shape
      // PropertyRead(ImplicitReceiver, 'propName') or Call(ImplicitReceiver, 'methodName').
      //
      // `translate` will first try to `resolve` the outer PropertyRead/Call. If this works,
      // it's because the `BoundTarget` found an expression target for the whole expression, and
      // therefore `translate` will never attempt to `resolve` the ImplicitReceiver of that
      // PropertyRead/Call.
      //
      // Therefore if `resolve` is called on an `ImplicitReceiver`, it's because no outer
      // PropertyRead/Call resolved to a variable or reference, and therefore this is a
      // property read or method call on the component context itself.
      return ts.factory.createThis();
    } else if (ast instanceof BindingPipe) {
      const expr = this.translate(ast.exp);
      const pipeMeta = this.tcb.getPipeByName(ast.name);
      let pipe: ts.Expression | null;
      if (pipeMeta === null) {
        // No pipe by that name exists in scope. Record this as an error.
        this.tcb.oobRecorder.missingPipe(this.tcb.id, ast, this.tcb.hostIsStandalone);

        // Use an 'any' value to at least allow the rest of the expression to be checked.
        pipe = ANY_EXPRESSION;
      } else if (
        pipeMeta.isExplicitlyDeferred &&
        this.tcb.boundTarget.getEagerlyUsedPipes().includes(ast.name)
      ) {
        // This pipe was defer-loaded (included into `@Component.deferredImports`),
        // but was used outside of a `@defer` block, which is the error.
        this.tcb.oobRecorder.deferredPipeUsedEagerly(this.tcb.id, ast);

        // Use an 'any' value to at least allow the rest of the expression to be checked.
        pipe = ANY_EXPRESSION;
      } else {
        // Use a variable declared as the pipe's type.
        pipe = this.tcb.env.pipeInst(
          pipeMeta.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>,
        );
      }
      const args = ast.args.map((arg) => this.translate(arg));
      let methodAccess: ts.Expression = ts.factory.createPropertyAccessExpression(
        pipe,
        'transform',
      );
      addParseSpanInfo(methodAccess, ast.nameSpan);
      if (!this.tcb.env.config.checkTypeOfPipes) {
        methodAccess = ts.factory.createAsExpression(
          methodAccess,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        );
      }

      const result = ts.factory.createCallExpression(
        /* expression */ methodAccess,
        /* typeArguments */ undefined,
        /* argumentsArray */ [expr, ...args],
      );
      addParseSpanInfo(result, ast.sourceSpan);
      return result;
    } else if (
      (ast instanceof Call || ast instanceof SafeCall) &&
      (ast.receiver instanceof PropertyRead || ast.receiver instanceof SafePropertyRead)
    ) {
      // Resolve the special `$any(expr)` syntax to insert a cast of the argument to type `any`.
      // `$any(expr)` -> `expr as any`
      if (
        ast.receiver.receiver instanceof ImplicitReceiver &&
        !(ast.receiver.receiver instanceof ThisReceiver) &&
        ast.receiver.name === '$any' &&
        ast.args.length === 1
      ) {
        const expr = this.translate(ast.args[0]);
        const exprAsAny = ts.factory.createAsExpression(
          expr,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        );
        const result = ts.factory.createParenthesizedExpression(exprAsAny);
        addParseSpanInfo(result, ast.sourceSpan);
        return result;
      }

      // Attempt to resolve a bound target for the method, and generate the method call if a target
      // could be resolved. If no target is available, then the method is referencing the top-level
      // component context, in which case `null` is returned to let the `ImplicitReceiver` being
      // resolved to the component context.
      const target = this.tcb.boundTarget.getExpressionTarget(ast);
      if (target === null) {
        return null;
      }

      const receiver = this.getTargetNodeExpression(target, ast);
      const method = wrapForDiagnostics(receiver);
      addParseSpanInfo(method, ast.receiver.nameSpan);
      const args = ast.args.map((arg) => this.translate(arg));
      const node = ts.factory.createCallExpression(method, undefined, args);
      addParseSpanInfo(node, ast.sourceSpan);
      return node;
    } else {
      // This AST isn't special after all.
      return null;
    }
  }

  private getTargetNodeExpression(targetNode: TemplateEntity, expressionNode: AST): ts.Expression {
    const expr = this.scope.resolve(targetNode);
    addParseSpanInfo(expr, expressionNode.sourceSpan);
    return expr;
  }

  protected isValidLetDeclarationAccess(target: TmplAstLetDeclaration, ast: PropertyRead): boolean {
    const targetStart = target.sourceSpan.start.offset;
    const targetEnd = target.sourceSpan.end.offset;
    const astStart = ast.sourceSpan.start;

    // We only flag local references that occur before the declaration, because embedded views
    // are updated before the child views. In practice this means that something like
    // `<ng-template [ngIf]="true">{{value}}</ng-template> @let value = 1;` is valid.
    return (targetStart < astStart && astStart > targetEnd) || !this.scope.isLocal(target);
  }
}

/**
 * Call the type constructor of a directive instance on a given template node, inferring a type for
 * the directive instance from any bound inputs.
 */
function tcbCallTypeCtor(
  dir: TypeCheckableDirectiveMeta,
  tcb: Context,
  inputs: TcbDirectiveInput[],
): ts.Expression {
  const typeCtor = tcb.env.typeCtorFor(dir);

  // Construct an array of `ts.PropertyAssignment`s for each of the directive's inputs.
  const members = inputs.map((input) => {
    const propertyName = ts.factory.createStringLiteral(input.field);

    if (input.type === 'binding') {
      // For bound inputs, the property is assigned the binding expression.
      let expr = widenBinding(input.expression, tcb);

      if (input.isTwoWayBinding && tcb.env.config.allowSignalsInTwoWayBindings) {
        expr = unwrapWritableSignal(expr, tcb);
      }

      const assignment = ts.factory.createPropertyAssignment(
        propertyName,
        wrapForDiagnostics(expr),
      );
      addParseSpanInfo(assignment, input.sourceSpan);
      return assignment;
    } else {
      // A type constructor is required to be called with all input properties, so any unset
      // inputs are simply assigned a value of type `any` to ignore them.
      return ts.factory.createPropertyAssignment(propertyName, ANY_EXPRESSION);
    }
  });

  // Call the `ngTypeCtor` method on the directive class, with an object literal argument created
  // from the matched inputs.
  return ts.factory.createCallExpression(
    /* expression */ typeCtor,
    /* typeArguments */ undefined,
    /* argumentsArray */ [ts.factory.createObjectLiteralExpression(members)],
  );
}

function getBoundAttributes(
  directive: TypeCheckableDirectiveMeta,
  node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
): TcbBoundAttribute[] {
  const boundInputs: TcbBoundAttribute[] = [];

  const processAttribute = (attr: TmplAstBoundAttribute | TmplAstTextAttribute) => {
    // Skip non-property bindings.
    if (
      attr instanceof TmplAstBoundAttribute &&
      attr.type !== BindingType.Property &&
      attr.type !== BindingType.TwoWay
    ) {
      return;
    }

    // Skip the attribute if the directive does not have an input for it.
    const inputs = directive.inputs.getByBindingPropertyName(attr.name);

    if (inputs !== null) {
      boundInputs.push({
        attribute: attr,
        inputs: inputs.map((input) => {
          return {
            fieldName: input.classPropertyName,
            required: input.required,
            transformType: input.transform?.type || null,
            isSignal: input.isSignal,
            isTwoWayBinding:
              attr instanceof TmplAstBoundAttribute && attr.type === BindingType.TwoWay,
          };
        }),
      });
    }
  };

  node.inputs.forEach(processAttribute);
  node.attributes.forEach(processAttribute);
  if (node instanceof TmplAstTemplate) {
    node.templateAttrs.forEach(processAttribute);
  }

  return boundInputs;
}

/**
 * Translates the given attribute binding to a `ts.Expression`.
 */
function translateInput(
  attr: TmplAstBoundAttribute | TmplAstTextAttribute,
  tcb: Context,
  scope: Scope,
): ts.Expression {
  if (attr instanceof TmplAstBoundAttribute) {
    // Produce an expression representing the value of the binding.
    return tcbExpression(attr.value, tcb, scope);
  } else {
    // For regular attributes with a static string value, use the represented string literal.
    return ts.factory.createStringLiteral(attr.value);
  }
}

/**
 * Potentially widens the type of `expr` according to the type-checking configuration.
 */
function widenBinding(expr: ts.Expression, tcb: Context): ts.Expression {
  if (!tcb.env.config.checkTypeOfInputBindings) {
    // If checking the type of bindings is disabled, cast the resulting expression to 'any'
    // before the assignment.
    return tsCastToAny(expr);
  } else if (!tcb.env.config.strictNullInputBindings) {
    if (ts.isObjectLiteralExpression(expr) || ts.isArrayLiteralExpression(expr)) {
      // Object literals and array literals should not be wrapped in non-null assertions as that
      // would cause literals to be prematurely widened, resulting in type errors when assigning
      // into a literal type.
      return expr;
    } else {
      // If strict null checks are disabled, erase `null` and `undefined` from the type by
      // wrapping the expression in a non-null assertion.
      return ts.factory.createNonNullExpression(expr);
    }
  } else {
    // No widening is requested, use the expression as is.
    return expr;
  }
}

/**
 * Wraps an expression in an `unwrapSignal` call which extracts the signal's value.
 */
function unwrapWritableSignal(expression: ts.Expression, tcb: Context): ts.CallExpression {
  const unwrapRef = tcb.env.referenceExternalSymbol(
    R3Identifiers.unwrapWritableSignal.moduleName,
    R3Identifiers.unwrapWritableSignal.name,
  );
  return ts.factory.createCallExpression(unwrapRef, undefined, [expression]);
}

/**
 * An input binding that corresponds with a field of a directive.
 */
interface TcbDirectiveBoundInput {
  type: 'binding';

  /**
   * The name of a field on the directive that is set.
   */
  field: string;

  /**
   * The `ts.Expression` corresponding with the input binding expression.
   */
  expression: ts.Expression;

  /**
   * The source span of the full attribute binding.
   */
  sourceSpan: ParseSourceSpan;

  /**
   * Whether the binding is part of a two-way binding.
   */
  isTwoWayBinding: boolean;
}

/**
 * Indicates that a certain field of a directive does not have a corresponding input binding.
 */
interface TcbDirectiveUnsetInput {
  type: 'unset';

  /**
   * The name of a field on the directive for which no input binding is present.
   */
  field: string;
}

type TcbDirectiveInput = TcbDirectiveBoundInput | TcbDirectiveUnsetInput;

const EVENT_PARAMETER = '$event';

const enum EventParamType {
  /* Generates code to infer the type of `$event` based on how the listener is registered. */
  Infer,

  /* Declares the type of the `$event` parameter as `any`. */
  Any,
}

/**
 * Creates an arrow function to be used as handler function for event bindings. The handler
 * function has a single parameter `$event` and the bound event's handler `AST` represented as a
 * TypeScript expression as its body.
 *
 * When `eventType` is set to `Infer`, the `$event` parameter will not have an explicit type. This
 * allows for the created handler function to have its `$event` parameter's type inferred based on
 * how it's used, to enable strict type checking of event bindings. When set to `Any`, the `$event`
 * parameter will have an explicit `any` type, effectively disabling strict type checking of event
 * bindings. Alternatively, an explicit type can be passed for the `$event` parameter.
 */
function tcbCreateEventHandler(
  event: TmplAstBoundEvent,
  tcb: Context,
  scope: Scope,
  eventType: EventParamType | ts.TypeNode,
): ts.Expression {
  const handler = tcbEventHandlerExpression(event.handler, tcb, scope);
  const statements: ts.Statement[] = [];

  // TODO(crisbeto): remove the `checkTwoWayBoundEvents` check in v20.
  if (event.type === ParsedEventType.TwoWay && tcb.env.config.checkTwoWayBoundEvents) {
    // If we're dealing with a two-way event, we create a variable initialized to the unwrapped
    // signal value of the expression and then we assign `$event` to it. Note that in most cases
    // this will already be covered by the corresponding input binding, however it allows us to
    // handle the case where the input has a wider type than the output (see #58971).
    const target = tcb.allocateId();
    const assignment = ts.factory.createBinaryExpression(
      target,
      ts.SyntaxKind.EqualsToken,
      ts.factory.createIdentifier(EVENT_PARAMETER),
    );

    statements.push(
      tsCreateVariable(
        target,
        tcb.env.config.allowSignalsInTwoWayBindings ? unwrapWritableSignal(handler, tcb) : handler,
      ),
      ts.factory.createExpressionStatement(assignment),
    );
  } else {
    statements.push(ts.factory.createExpressionStatement(handler));
  }

  let eventParamType: ts.TypeNode | undefined;
  if (eventType === EventParamType.Infer) {
    eventParamType = undefined;
  } else if (eventType === EventParamType.Any) {
    eventParamType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  } else {
    eventParamType = eventType;
  }

  // Obtain all guards that have been applied to the scope and its parents, as they have to be
  // repeated within the handler function for their narrowing to be in effect within the handler.
  const guards = scope.guards();

  let body = ts.factory.createBlock(statements);
  if (guards !== null) {
    // Wrap the body in an `if` statement containing all guards that have to be applied.
    body = ts.factory.createBlock([ts.factory.createIfStatement(guards, body)]);
  }

  const eventParam = ts.factory.createParameterDeclaration(
    /* modifiers */ undefined,
    /* dotDotDotToken */ undefined,
    /* name */ EVENT_PARAMETER,
    /* questionToken */ undefined,
    /* type */ eventParamType,
  );
  addExpressionIdentifier(eventParam, ExpressionIdentifier.EVENT_PARAMETER);

  // Return an arrow function instead of a function expression to preserve the `this` context.
  return ts.factory.createArrowFunction(
    /* modifiers */ undefined,
    /* typeParameters */ undefined,
    /* parameters */ [eventParam],
    /* type */ ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
    /* equalsGreaterThanToken */ undefined,
    /* body */ body,
  );
}

/**
 * Similar to `tcbExpression`, this function converts the provided `AST` expression into a
 * `ts.Expression`, with special handling of the `$event` variable that can be used within event
 * bindings.
 */
function tcbEventHandlerExpression(ast: AST, tcb: Context, scope: Scope): ts.Expression {
  const translator = new TcbEventHandlerTranslator(tcb, scope);
  return translator.translate(ast);
}

function checkSplitTwoWayBinding(
  inputName: string,
  output: TmplAstBoundEvent,
  inputs: TmplAstBoundAttribute[],
  tcb: Context,
) {
  const input = inputs.find((input) => input.name === inputName);
  if (input === undefined || input.sourceSpan !== output.sourceSpan) {
    return false;
  }
  // Input consumer should be a directive because it's claimed
  const inputConsumer = tcb.boundTarget.getConsumerOfBinding(input) as TypeCheckableDirectiveMeta;
  const outputConsumer = tcb.boundTarget.getConsumerOfBinding(output);
  if (
    outputConsumer === null ||
    inputConsumer.ref === undefined ||
    outputConsumer instanceof TmplAstTemplate
  ) {
    return false;
  }
  if (outputConsumer instanceof TmplAstElement) {
    tcb.oobRecorder.splitTwoWayBinding(
      tcb.id,
      input,
      output,
      inputConsumer.ref.node,
      outputConsumer,
    );
    return true;
  } else if (outputConsumer.ref !== inputConsumer.ref) {
    tcb.oobRecorder.splitTwoWayBinding(
      tcb.id,
      input,
      output,
      inputConsumer.ref.node,
      outputConsumer.ref.node,
    );
    return true;
  }
  return false;
}

class TcbEventHandlerTranslator extends TcbExpressionTranslator {
  protected override resolve(ast: AST): ts.Expression | null {
    // Recognize a property read on the implicit receiver corresponding with the event parameter
    // that is available in event bindings. Since this variable is a parameter of the handler
    // function that the converted expression becomes a child of, just create a reference to the
    // parameter by its name.
    if (
      ast instanceof PropertyRead &&
      ast.receiver instanceof ImplicitReceiver &&
      !(ast.receiver instanceof ThisReceiver) &&
      ast.name === EVENT_PARAMETER
    ) {
      const event = ts.factory.createIdentifier(EVENT_PARAMETER);
      addParseSpanInfo(event, ast.nameSpan);
      return event;
    }

    return super.resolve(ast);
  }

  protected override isValidLetDeclarationAccess(): boolean {
    // Event listeners are allowed to read `@let` declarations before
    // they're declared since the callback won't be executed immediately.
    return true;
  }
}

class TcbForLoopTrackTranslator extends TcbExpressionTranslator {
  private allowedVariables: Set<TmplAstVariable>;

  constructor(
    tcb: Context,
    scope: Scope,
    private block: TmplAstForLoopBlock,
  ) {
    super(tcb, scope);

    // Tracking expressions are only allowed to read the `$index`,
    // the item and properties off the component instance.
    this.allowedVariables = new Set([block.item]);
    for (const variable of block.contextVariables) {
      if (variable.value === '$index') {
        this.allowedVariables.add(variable);
      }
    }
  }

  protected override resolve(ast: AST): ts.Expression | null {
    if (ast instanceof PropertyRead && ast.receiver instanceof ImplicitReceiver) {
      const target = this.tcb.boundTarget.getExpressionTarget(ast);

      if (
        target !== null &&
        (!(target instanceof TmplAstVariable) || !this.allowedVariables.has(target))
      ) {
        this.tcb.oobRecorder.illegalForLoopTrackAccess(this.tcb.id, this.block, ast);
      }
    }

    return super.resolve(ast);
  }
}

// TODO(crisbeto): the logic for determining the fallback tag name of a Component node is
// still being designed. For now fall back to `ng-component`, but this will have to be
// revisited once the design is finalized.
function getComponentTagName(node: TmplAstComponent): string {
  return node.tagName || 'ng-component';
}
