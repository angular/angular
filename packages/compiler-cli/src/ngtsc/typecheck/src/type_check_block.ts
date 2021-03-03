/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BindingPipe, BindingType, BoundTarget, DYNAMIC_TYPE, ImplicitReceiver, MethodCall, ParsedEventType, ParseSourceSpan, PropertyRead, PropertyWrite, SchemaMetadata, ThisReceiver, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstBoundText, TmplAstElement, TmplAstIcu, TmplAstNode, TmplAstReference, TmplAstTemplate, TmplAstTextAttribute, TmplAstVariable} from '@angular/compiler';
import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ClassPropertyName} from '../../metadata';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {TemplateId, TypeCheckableDirectiveMeta, TypeCheckBlockMetadata} from '../api';

import {addExpressionIdentifier, ExpressionIdentifier, markIgnoreDiagnostics} from './comments';
import {addParseSpanInfo, addTemplateId, wrapForDiagnostics, wrapForTypeChecker} from './diagnostics';
import {DomSchemaChecker} from './dom';
import {Environment} from './environment';
import {astToTypescript, NULL_AS_ANY} from './expression';
import {OutOfBandDiagnosticRecorder} from './oob';
import {ExpressionSemanticVisitor} from './template_semantics';
import {checkIfGenericTypesAreUnbound, tsCallMethod, tsCastToAny, tsCreateElement, tsCreateTypeQueryForCoercedInput, tsCreateVariable, tsDeclareVariable} from './ts_util';
import {requiresInlineTypeCtor} from './type_constructor';

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
 */
export function generateTypeCheckBlock(
    env: Environment, ref: Reference<ClassDeclaration<ts.ClassDeclaration>>, name: ts.Identifier,
    meta: TypeCheckBlockMetadata, domSchemaChecker: DomSchemaChecker,
    oobRecorder: OutOfBandDiagnosticRecorder): ts.FunctionDeclaration {
  const tcb = new Context(
      env, domSchemaChecker, oobRecorder, meta.id, meta.boundTarget, meta.pipes, meta.schemas);
  const scope = Scope.forNodes(tcb, null, tcb.boundTarget.target.template !, /* guard */ null);
  const ctxRawType = env.referenceType(ref);
  if (!ts.isTypeReferenceNode(ctxRawType)) {
    throw new Error(
        `Expected TypeReferenceNode when referencing the ctx param for ${ref.debugName}`);
  }
  const paramList = [tcbCtxParam(ref.node, ctxRawType.typeName, env.config.useContextGenericType)];

  const scopeStatements = scope.render();
  const innerBody = ts.createBlock([
    ...env.getPreludeStatements(),
    ...scopeStatements,
  ]);

  // Wrap the body in an "if (true)" expression. This is unnecessary but has the effect of causing
  // the `ts.Printer` to format the type-check block nicely.
  const body = ts.createBlock([ts.createIf(ts.createTrue(), innerBody, undefined)]);
  const fnDecl = ts.createFunctionDeclaration(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      /* asteriskToken */ undefined,
      /* name */ name,
      /* typeParameters */ env.config.useContextGenericType ? ref.node.typeParameters : undefined,
      /* parameters */ paramList,
      /* type */ undefined,
      /* body */ body);
  addTemplateId(fnDecl, meta.id);
  return fnDecl;
}

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

  abstract execute(): ts.Expression|null;

  /**
   * Replacement value or operation used while this `TcbOp` is executing (i.e. to resolve circular
   * references during its execution).
   *
   * This is usually a `null!` expression (which asks TS to infer an appropriate type), but another
   * `TcbOp` can be returned in cases where additional code generation is necessary to deal with
   * circular references.
   */
  circularFallback(): TcbOp|ts.Expression {
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
  constructor(private tcb: Context, private scope: Scope, private element: TmplAstElement) {
    super();
  }

  get optional() {
    // The statement generated by this operation is only used for type-inference of the DOM
    // element's type and won't report diagnostics by itself, so the operation is marked as optional
    // to avoid generating statements for DOM elements that are never referenced.
    return true;
  }

  execute(): ts.Identifier {
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
class TcbVariableOp extends TcbOp {
  constructor(
      private tcb: Context, private scope: Scope, private template: TmplAstTemplate,
      private variable: TmplAstVariable) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): ts.Identifier {
    // Look for a context variable for the template.
    const ctx = this.scope.resolve(this.template);

    // Allocate an identifier for the TmplAstVariable, and initialize it to a read of the variable
    // on the template context.
    const id = this.tcb.allocateId();
    const initializer = ts.createPropertyAccess(
        /* expression */ ctx,
        /* name */ this.variable.value || '$implicit');
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
  constructor(private tcb: Context, private scope: Scope) {
    super();
  }

  // The declaration of the context variable is only needed when the context is actually referenced.
  readonly optional = true;

  execute(): ts.Identifier {
    // Allocate a template ctx variable and declare it with an 'any' type. The type of this variable
    // may be narrowed as a result of template guard conditions.
    const ctx = this.tcb.allocateId();
    const type = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    this.scope.addStatement(tsDeclareVariable(ctx, type));
    return ctx;
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
  constructor(private tcb: Context, private scope: Scope, private template: TmplAstTemplate) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): null {
    // An `if` will be constructed, within which the template's children will be type checked. The
    // `if` is used for two reasons: it creates a new syntactic scope, isolating variables declared
    // in the template's TCB from the outer context, and it allows any directives on the templates
    // to perform type narrowing of either expressions or the template's context.
    //
    // The guard is the `if` block's condition. It's usually set to `true` but directives that exist
    // on the template can trigger extra guard expressions that serve to narrow types within the
    // `if`. `guard` is calculated by starting with `true` and adding other conditions as needed.
    // Collect these into `guards` by processing the directives.
    const directiveGuards: ts.Expression[] = [];

    const directives = this.tcb.boundTarget.getDirectivesOfNode(this.template);
    if (directives !== null) {
      for (const dir of directives) {
        const dirInstId = this.scope.resolve(this.template, dir);
        const dirId =
            this.tcb.env.reference(dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>);

        // There are two kinds of guards. Template guards (ngTemplateGuards) allow type narrowing of
        // the expression passed to an @Input of the directive. Scan the directive to see if it has
        // any template guards, and generate them if needed.
        dir.ngTemplateGuards.forEach(guard => {
          // For each template guard function on the directive, look for a binding to that input.
          const boundInput = this.template.inputs.find(i => i.name === guard.inputName) ||
              this.template.templateAttrs.find(
                  (i: TmplAstTextAttribute|TmplAstBoundAttribute): i is TmplAstBoundAttribute =>
                      i instanceof TmplAstBoundAttribute && i.name === guard.inputName);
          if (boundInput !== undefined) {
            // If there is such a binding, generate an expression for it.
            const expr = tcbExpression(boundInput.value, this.tcb, this.scope);

            // The expression has already been checked in the type constructor invocation, so
            // it should be ignored when used within a template guard.
            markIgnoreDiagnostics(expr);

            if (guard.type === 'binding') {
              // Use the binding expression itself as guard.
              directiveGuards.push(expr);
            } else {
              // Call the guard function on the directive with the directive instance and that
              // expression.
              const guardInvoke = tsCallMethod(dirId, `ngTemplateGuard_${guard.inputName}`, [
                dirInstId,
                expr,
              ]);
              addParseSpanInfo(guardInvoke, boundInput.value.sourceSpan);
              directiveGuards.push(guardInvoke);
            }
          }
        });

        // The second kind of guard is a template context guard. This guard narrows the template
        // rendering context variable `ctx`.
        if (dir.hasNgTemplateContextGuard) {
          if (this.tcb.env.config.applyTemplateContextGuards) {
            const ctx = this.scope.resolve(this.template);
            const guardInvoke = tsCallMethod(dirId, 'ngTemplateContextGuard', [dirInstId, ctx]);
            addParseSpanInfo(guardInvoke, this.template.sourceSpan);
            directiveGuards.push(guardInvoke);
          } else if (
              this.template.variables.length > 0 &&
              this.tcb.env.config.suggestionsForSuboptimalTypeInference) {
            // The compiler could have inferred a better type for the variables in this template,
            // but was prevented from doing so by the type-checking configuration. Issue a warning
            // diagnostic.
            this.tcb.oobRecorder.suboptimalTypeInference(this.tcb.id, this.template.variables);
          }
        }
      }
    }

    // By default the guard is simply `true`.
    let guard: ts.Expression|null = null;

    // If there are any guards from directives, use them instead.
    if (directiveGuards.length > 0) {
      // Pop the first value and use it as the initializer to reduce(). This way, a single guard
      // will be used on its own, but two or more will be combined into binary AND expressions.
      guard = directiveGuards.reduce(
          (expr, dirGuard) =>
              ts.createBinary(expr, ts.SyntaxKind.AmpersandAmpersandToken, dirGuard),
          directiveGuards.pop()!);
    }

    // Create a new Scope for the template. This constructs the list of operations for the template
    // children, as well as tracks bindings within the template.
    const tmplScope = Scope.forNodes(this.tcb, this.scope, this.template, guard);

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

    let tmplBlock: ts.Statement = ts.createBlock(statements);
    if (guard !== null) {
      // The scope has a guard that needs to be applied, so wrap the template block into an `if`
      // statement containing the guard expression.
      tmplBlock = ts.createIf(/* expression */ guard, /* thenStatement */ tmplBlock);
    }
    this.scope.addStatement(tmplBlock);

    return null;
  }
}

/**
 * A `TcbOp` which renders a text binding (interpolation) into the TCB.
 *
 * Executing this operation returns nothing.
 */
class TcbTextInterpolationOp extends TcbOp {
  constructor(private tcb: Context, private scope: Scope, private binding: TmplAstBoundText) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): null {
    const expr = tcbExpression(this.binding.value, this.tcb, this.scope);
    this.scope.addStatement(ts.createExpressionStatement(expr));
    return null;
  }
}

/**
 * A `TcbOp` which constructs an instance of a directive. For generic directives, generic
 * parameters are set to `any` type.
 */
abstract class TcbDirectiveTypeOpBase extends TcbOp {
  constructor(
      protected tcb: Context, protected scope: Scope,
      protected node: TmplAstTemplate|TmplAstElement, protected dir: TypeCheckableDirectiveMeta) {
    super();
  }

  get optional() {
    // The statement generated by this operation is only used to declare the directive's type and
    // won't report diagnostics by itself, so the operation is marked as optional to avoid
    // generating declarations for directives that don't have any inputs/outputs.
    return true;
  }

  execute(): ts.Identifier {
    const dirRef = this.dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;

    const rawType = this.tcb.env.referenceType(this.dir.ref);

    let type: ts.TypeNode;
    if (this.dir.isGeneric === false || dirRef.node.typeParameters === undefined) {
      type = rawType;
    } else {
      if (!ts.isTypeReferenceNode(rawType)) {
        throw new Error(
            `Expected TypeReferenceNode when referencing the type for ${this.dir.ref.debugName}`);
      }
      const typeArguments = dirRef.node.typeParameters.map(
          () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
      type = ts.factory.createTypeReferenceNode(rawType.typeName, typeArguments);
    }

    const id = this.tcb.allocateId();
    addExpressionIdentifier(type, ExpressionIdentifier.DIRECTIVE);
    addParseSpanInfo(type, this.node.startSourceSpan || this.node.sourceSpan);
    this.scope.addStatement(tsDeclareVariable(id, type));
    return id;
  }
}

/**
 * A `TcbOp` which constructs an instance of a non-generic directive _without_ setting any of its
 * inputs. Inputs  are later set in the `TcbDirectiveInputsOp`. Type checking was found to be
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
  execute(): ts.Identifier {
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
  execute(): ts.Identifier {
    const dirRef = this.dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;
    if (dirRef.node.typeParameters === undefined) {
      throw new Error(`Assertion Error: expected typeParameters when creating a declaration for ${
          dirRef.debugName}`);
    }

    return super.execute();
  }
}

/**
 * A `TcbOp` which creates a variable for a local ref in a template.
 * The initializer for the variable is the variable expression for the directive, template, or
 * element the ref refers to. When the reference is used in the template, those TCB statements will
 * access this variable as well. For example:
 * ```
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
      private readonly tcb: Context, private readonly scope: Scope,
      private readonly node: TmplAstReference,
      private readonly host: TmplAstElement|TmplAstTemplate,
      private readonly target: TypeCheckableDirectiveMeta|TmplAstTemplate|TmplAstElement) {
    super();
  }

  // The statement generated by this operation is only used to for the Type Checker
  // so it can map a reference variable in the template directly to a node in the TCB.
  readonly optional = true;

  execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    let initializer =
        this.target instanceof TmplAstTemplate || this.target instanceof TmplAstElement ?
        this.scope.resolve(this.target) :
        this.scope.resolve(this.host, this.target);

    // The reference is either to an element, an <ng-template> node, or to a directive on an
    // element or template.
    if ((this.target instanceof TmplAstElement && !this.tcb.env.config.checkTypeOfDomReferences) ||
        !this.tcb.env.config.checkTypeOfNonDomReferences) {
      // References to DOM nodes are pinned to 'any' when `checkTypeOfDomReferences` is `false`.
      // References to `TemplateRef`s and directives are pinned to 'any' when
      // `checkTypeOfNonDomReferences` is `false`.
      initializer =
          ts.createAsExpression(initializer, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
    } else if (this.target instanceof TmplAstTemplate) {
      // Direct references to an <ng-template> node simply require a value of type
      // `TemplateRef<any>`. To get this, an expression of the form
      // `(_t1 as any as TemplateRef<any>)` is constructed.
      initializer =
          ts.createAsExpression(initializer, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
      initializer = ts.createAsExpression(
          initializer,
          this.tcb.env.referenceExternalType('@angular/core', 'TemplateRef', [DYNAMIC_TYPE]));
      initializer = ts.createParen(initializer);
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
  constructor(private readonly tcb: Context, private readonly scope: Scope) {
    super();
  }

  // The declaration of a missing reference is only needed when the reference is resolved.
  readonly optional = true;

  execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    this.scope.addStatement(tsCreateVariable(id, NULL_AS_ANY));
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
      private tcb: Context, private scope: Scope, private node: TmplAstTemplate|TmplAstElement,
      private dir: TypeCheckableDirectiveMeta) {
    super();
  }

  get optional() {
    // The statement generated by this operation is only used to infer the directive's type and
    // won't report diagnostics by itself, so the operation is marked as optional.
    return true;
  }

  execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    addExpressionIdentifier(id, ExpressionIdentifier.DIRECTIVE);
    addParseSpanInfo(id, this.node.startSourceSpan || this.node.sourceSpan);

    const genericInputs = new Map<string, TcbDirectiveInput>();

    const inputs = getBoundInputs(this.dir, this.node, this.tcb);
    for (const input of inputs) {
      // Skip text attributes if configured to do so.
      if (!this.tcb.env.config.checkTypeOfAttributes &&
          input.attribute instanceof TmplAstTextAttribute) {
        continue;
      }
      for (const fieldName of input.fieldNames) {
        // Skip the field if an attribute has already been bound to it; we can't have a duplicate
        // key in the type constructor call.
        if (genericInputs.has(fieldName)) {
          continue;
        }

        const expression = translateInput(input.attribute, this.tcb, this.scope);
        genericInputs.set(fieldName, {
          type: 'binding',
          field: fieldName,
          expression,
          sourceSpan: input.attribute.sourceSpan
        });
      }
    }

    // Add unset directive inputs for each of the remaining unset fields.
    for (const [fieldName] of this.dir.inputs) {
      if (!genericInputs.has(fieldName)) {
        genericInputs.set(fieldName, {type: 'unset', field: fieldName});
      }
    }

    // Call the type constructor of the directive to infer a type, and assign the directive
    // instance.
    const typeCtor = tcbCallTypeCtor(this.dir, this.tcb, Array.from(genericInputs.values()));
    markIgnoreDiagnostics(typeCtor);
    this.scope.addStatement(tsCreateVariable(id, typeCtor));
    return id;
  }

  circularFallback(): TcbOp {
    return new TcbDirectiveCtorCircularFallbackOp(this.tcb, this.scope, this.node, this.dir);
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
      private tcb: Context, private scope: Scope, private node: TmplAstTemplate|TmplAstElement,
      private dir: TypeCheckableDirectiveMeta) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): null {
    let dirId: ts.Expression|null = null;

    // TODO(joost): report duplicate properties

    const inputs = getBoundInputs(this.dir, this.node, this.tcb);
    for (const input of inputs) {
      // For bound inputs, the property is assigned the binding expression.
      let expr = translateInput(input.attribute, this.tcb, this.scope);
      if (!this.tcb.env.config.checkTypeOfInputBindings) {
        // If checking the type of bindings is disabled, cast the resulting expression to 'any'
        // before the assignment.
        expr = tsCastToAny(expr);
      } else if (!this.tcb.env.config.strictNullInputBindings) {
        // If strict null checks are disabled, erase `null` and `undefined` from the type by
        // wrapping the expression in a non-null assertion.
        expr = ts.createNonNullExpression(expr);
      }

      let assignment: ts.Expression = wrapForDiagnostics(expr);

      for (const fieldName of input.fieldNames) {
        let target: ts.LeftHandSideExpression;
        if (this.dir.coercedInputFields.has(fieldName)) {
          // The input has a coercion declaration which should be used instead of assigning the
          // expression into the input field directly. To achieve this, a variable is declared
          // with a type of `typeof Directive.ngAcceptInputType_fieldName` which is then used as
          // target of the assignment.
          const dirTypeRef = this.tcb.env.referenceType(this.dir.ref);
          if (!ts.isTypeReferenceNode(dirTypeRef)) {
            throw new Error(
                `Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`);
          }

          const id = this.tcb.allocateId();
          const type = tsCreateTypeQueryForCoercedInput(dirTypeRef.typeName, fieldName);
          this.scope.addStatement(tsDeclareVariable(id, type));

          target = id;
        } else if (this.dir.undeclaredInputFields.has(fieldName)) {
          // If no coercion declaration is present nor is the field declared (i.e. the input is
          // declared in a `@Directive` or `@Component` decorator's `inputs` property) there is no
          // assignment target available, so this field is skipped.
          continue;
        } else if (
            !this.tcb.env.config.honorAccessModifiersForInputBindings &&
            this.dir.restrictedInputFields.has(fieldName)) {
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
                `Expected TypeReferenceNode from reference to ${this.dir.ref.debugName}`);
          }
          const type = ts.createIndexedAccessTypeNode(
              ts.createTypeQueryNode(dirId as ts.Identifier),
              ts.createLiteralTypeNode(ts.createStringLiteral(fieldName)));
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
          target = this.dir.stringLiteralInputFields.has(fieldName) ?
              ts.createElementAccess(dirId, ts.createStringLiteral(fieldName)) :
              ts.createPropertyAccess(dirId, ts.createIdentifier(fieldName));
        }

        if (input.attribute.keySpan !== undefined) {
          addParseSpanInfo(target, input.attribute.keySpan);
        }
        // Finally the assignment is extended by assigning it into the target expression.
        assignment = ts.createBinary(target, ts.SyntaxKind.EqualsToken, assignment);
      }

      addParseSpanInfo(assignment, input.attribute.sourceSpan);
      // Ignore diagnostics for text attributes if configured to do so.
      if (!this.tcb.env.config.checkTypeOfAttributes &&
          input.attribute instanceof TmplAstTextAttribute) {
        markIgnoreDiagnostics(assignment);
      }

      this.scope.addStatement(ts.createExpressionStatement(assignment));
    }

    return null;
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
      private tcb: Context, private scope: Scope, private node: TmplAstTemplate|TmplAstElement,
      private dir: TypeCheckableDirectiveMeta) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    const typeCtor = this.tcb.env.typeCtorFor(this.dir);
    const circularPlaceholder = ts.createCall(
        typeCtor, /* typeArguments */ undefined, [ts.createNonNullExpression(ts.createNull())]);
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
      private tcb: Context, private element: TmplAstElement, private checkElement: boolean,
      private claimedInputs: Set<string>) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): ts.Expression|null {
    if (this.checkElement) {
      this.tcb.domSchemaChecker.checkElement(this.tcb.id, this.element, this.tcb.schemas);
    }

    // TODO(alxhub): this could be more efficient.
    for (const binding of this.element.inputs) {
      if (binding.type === BindingType.Property && this.claimedInputs.has(binding.name)) {
        // Skip this binding as it was claimed by a directive.
        continue;
      }

      if (binding.type === BindingType.Property) {
        if (binding.name !== 'style' && binding.name !== 'class') {
          // A direct binding to a property.
          const propertyName = ATTR_TO_PROP[binding.name] || binding.name;
          this.tcb.domSchemaChecker.checkProperty(
              this.tcb.id, this.element, propertyName, binding.sourceSpan, this.tcb.schemas);
        }
      }
    }
    return null;
  }
}


/**
 * Mapping between attributes names that don't correspond to their element property names.
 * Note: this mapping has to be kept in sync with the equally named mapping in the runtime.
 */
const ATTR_TO_PROP: {[name: string]: string} = {
  'class': 'className',
  'for': 'htmlFor',
  'formaction': 'formAction',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};

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
      private tcb: Context, private scope: Scope, private element: TmplAstElement,
      private claimedInputs: Set<string>) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): null {
    // `this.inputs` contains only those bindings not matched by any directive. These bindings go to
    // the element itself.
    let elId: ts.Expression|null = null;

    // TODO(alxhub): this could be more efficient.
    for (const binding of this.element.inputs) {
      if (binding.type === BindingType.Property && this.claimedInputs.has(binding.name)) {
        // Skip this binding as it was claimed by a directive.
        continue;
      }

      let expr = tcbExpression(binding.value, this.tcb, this.scope);
      if (!this.tcb.env.config.checkTypeOfInputBindings) {
        // If checking the type of bindings is disabled, cast the resulting expression to 'any'
        // before the assignment.
        expr = tsCastToAny(expr);
      } else if (!this.tcb.env.config.strictNullInputBindings) {
        // If strict null checks are disabled, erase `null` and `undefined` from the type by
        // wrapping the expression in a non-null assertion.
        expr = ts.createNonNullExpression(expr);
      }

      if (this.tcb.env.config.checkTypeOfDomBindings && binding.type === BindingType.Property) {
        if (binding.name !== 'style' && binding.name !== 'class') {
          if (elId === null) {
            elId = this.scope.resolve(this.element);
          }
          // A direct binding to a property.
          const propertyName = ATTR_TO_PROP[binding.name] || binding.name;
          const prop = ts.createElementAccess(elId, ts.createStringLiteral(propertyName));
          const stmt = ts.createBinary(prop, ts.SyntaxKind.EqualsToken, wrapForDiagnostics(expr));
          addParseSpanInfo(stmt, binding.sourceSpan);
          this.scope.addStatement(ts.createExpressionStatement(stmt));
        } else {
          this.scope.addStatement(ts.createExpressionStatement(expr));
        }
      } else {
        // A binding to an animation, attribute, class or style. For now, only validate the right-
        // hand side of the expression.
        // TODO: properly check class and style bindings.
        this.scope.addStatement(ts.createExpressionStatement(expr));
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
      private tcb: Context, private scope: Scope, private node: TmplAstTemplate|TmplAstElement,
      private dir: TypeCheckableDirectiveMeta) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): null {
    let dirId: ts.Expression|null = null;
    const outputs = this.dir.outputs;

    for (const output of this.node.outputs) {
      if (output.type !== ParsedEventType.Regular || !outputs.hasBindingPropertyName(output.name)) {
        continue;
      }
      // TODO(alxhub): consider supporting multiple fields with the same property name for outputs.
      const field = outputs.getByBindingPropertyName(output.name)![0].classPropertyName;

      if (dirId === null) {
        dirId = this.scope.resolve(this.node, this.dir);
      }
      const outputField = ts.createElementAccess(dirId, ts.createStringLiteral(field));
      addParseSpanInfo(outputField, output.keySpan);
      if (this.tcb.env.config.checkTypeOfOutputEvents) {
        // For strict checking of directive events, generate a call to the `subscribe` method
        // on the directive's output field to let type information flow into the handler function's
        // `$event` parameter.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Infer);
        const subscribeFn = ts.createPropertyAccess(outputField, 'subscribe');
        const call = ts.createCall(subscribeFn, /* typeArguments */ undefined, [handler]);
        addParseSpanInfo(call, output.sourceSpan);
        this.scope.addStatement(ts.createExpressionStatement(call));
      } else {
        // If strict checking of directive events is disabled:
        //
        // * We still generate the access to the output field as a statement in the TCB so consumers
        //   of the `TemplateTypeChecker` can still find the node for the class member for the
        //   output.
        // * Emit a handler function where the `$event` parameter has an explicit `any` type.
        this.scope.addStatement(ts.createExpressionStatement(outputField));
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Any);
        this.scope.addStatement(ts.createExpressionStatement(handler));
      }

      ExpressionSemanticVisitor.visit(
          output.handler, this.tcb.id, this.tcb.boundTarget, this.tcb.oobRecorder);
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
      private tcb: Context, private scope: Scope, private element: TmplAstElement,
      private claimedOutputs: Set<string>) {
    super();
  }

  get optional() {
    return false;
  }

  execute(): null {
    let elId: ts.Expression|null = null;

    // TODO(alxhub): this could be more efficient.
    for (const output of this.element.outputs) {
      if (this.claimedOutputs.has(output.name)) {
        // Skip this event handler as it was claimed by a directive.
        continue;
      }

      if (output.type === ParsedEventType.Animation) {
        // Animation output bindings always have an `$event` parameter of type `AnimationEvent`.
        const eventType = this.tcb.env.config.checkTypeOfAnimationEvents ?
            this.tcb.env.referenceExternalType('@angular/animations', 'AnimationEvent') :
            EventParamType.Any;

        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, eventType);
        this.scope.addStatement(ts.createExpressionStatement(handler));
      } else if (this.tcb.env.config.checkTypeOfDomEvents) {
        // If strict checking of DOM events is enabled, generate a call to `addEventListener` on
        // the element instance so that TypeScript's type inference for
        // `HTMLElement.addEventListener` using `HTMLElementEventMap` to infer an accurate type for
        // `$event` depending on the event name. For unknown event names, TypeScript resorts to the
        // base `Event` type.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Infer);

        if (elId === null) {
          elId = this.scope.resolve(this.element);
        }
        const propertyAccess = ts.createPropertyAccess(elId, 'addEventListener');
        addParseSpanInfo(propertyAccess, output.keySpan);
        const call = ts.createCall(
            /* expression */ propertyAccess,
            /* typeArguments */ undefined,
            /* arguments */[ts.createStringLiteral(output.name), handler]);
        addParseSpanInfo(call, output.sourceSpan);
        this.scope.addStatement(ts.createExpressionStatement(call));
      } else {
        // If strict checking of DOM inputs is disabled, emit a handler function where the `$event`
        // parameter has an explicit `any` type.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Any);
        this.scope.addStatement(ts.createExpressionStatement(handler));
      }

      ExpressionSemanticVisitor.visit(
          output.handler, this.tcb.id, this.tcb.boundTarget, this.tcb.oobRecorder);
    }

    return null;
  }
}

/**
 * A `TcbOp` which generates a completion point for the component context.
 *
 * This completion point looks like `ctx. ;` in the TCB output, and does not produce diagnostics.
 * TypeScript autocompletion APIs can be used at this completion point (after the '.') to produce
 * autocompletion results of properties and methods from the template's component context.
 */
class TcbComponentContextCompletionOp extends TcbOp {
  constructor(private scope: Scope) {
    super();
  }

  readonly optional = false;

  execute(): null {
    const ctx = ts.createIdentifier('ctx');
    const ctxDot = ts.createPropertyAccess(ctx, '');
    markIgnoreDiagnostics(ctxDot);
    addExpressionIdentifier(ctxDot, ExpressionIdentifier.COMPONENT_COMPLETION);
    this.scope.addStatement(ts.createExpressionStatement(ctxDot));
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
const INFER_TYPE_FOR_CIRCULAR_OP_EXPR = ts.createNonNullExpression(ts.createNull());

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
      readonly env: Environment, readonly domSchemaChecker: DomSchemaChecker,
      readonly oobRecorder: OutOfBandDiagnosticRecorder, readonly id: TemplateId,
      readonly boundTarget: BoundTarget<TypeCheckableDirectiveMeta>,
      private pipes: Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>,
      readonly schemas: SchemaMetadata[]) {}

  /**
   * Allocate a new variable name for use within the `Context`.
   *
   * Currently this uses a monotonically increasing counter, but in the future the variable name
   * might change depending on the type of data being stored.
   */
  allocateId(): ts.Identifier {
    return ts.createIdentifier(`_t${this.nextId++}`);
  }

  getPipeByName(name: string): Reference<ClassDeclaration<ts.ClassDeclaration>>|null {
    if (!this.pipes.has(name)) {
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
  private opQueue: (TcbOp|ts.Expression|null)[] = [];

  /**
   * A map of `TmplAstElement`s to the index of their `TcbElementOp` in the `opQueue`
   */
  private elementOpMap = new Map<TmplAstElement, number>();
  /**
   * A map of maps which tracks the index of `TcbDirectiveCtorOp`s in the `opQueue` for each
   * directive on a `TmplAstElement` or `TmplAstTemplate` node.
   */
  private directiveOpMap =
      new Map<TmplAstElement|TmplAstTemplate, Map<TypeCheckableDirectiveMeta, number>>();

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
   * `TmplAstVariable` nodes) to the index of their `TcbVariableOp`s in the `opQueue`.
   */
  private varMap = new Map<TmplAstVariable, number>();

  /**
   * Statements for this template.
   *
   * Executing the `TcbOp`s in the `opQueue` populates this array.
   */
  private statements: ts.Statement[] = [];

  private constructor(
      private tcb: Context, private parent: Scope|null = null,
      private guard: ts.Expression|null = null) {}

  /**
   * Constructs a `Scope` given either a `TmplAstTemplate` or a list of `TmplAstNode`s.
   *
   * @param tcb the overall context of TCB generation.
   * @param parent the `Scope` of the parent template (if any) or `null` if this is the root
   * `Scope`.
   * @param templateOrNodes either a `TmplAstTemplate` representing the template for which to
   * calculate the `Scope`, or a list of nodes if no outer template object is available.
   * @param guard an expression that is applied to this scope for type narrowing purposes.
   */
  static forNodes(
      tcb: Context, parent: Scope|null, templateOrNodes: TmplAstTemplate|(TmplAstNode[]),
      guard: ts.Expression|null): Scope {
    const scope = new Scope(tcb, parent, guard);

    if (parent === null && tcb.env.config.enableTemplateTypeChecker) {
      // Add an autocompletion point for the component context.
      scope.opQueue.push(new TcbComponentContextCompletionOp(scope));
    }

    let children: TmplAstNode[];

    // If given an actual `TmplAstTemplate` instance, then process any additional information it
    // has.
    if (templateOrNodes instanceof TmplAstTemplate) {
      // The template's variable declarations need to be added as `TcbVariableOp`s.
      const varMap = new Map<string, TmplAstVariable>();

      for (const v of templateOrNodes.variables) {
        // Validate that variables on the `TmplAstTemplate` are only declared once.
        if (!varMap.has(v.name)) {
          varMap.set(v.name, v);
        } else {
          const firstDecl = varMap.get(v.name)!;
          tcb.oobRecorder.duplicateTemplateVar(tcb.id, v, firstDecl);
        }

        const opIndex = scope.opQueue.push(new TcbVariableOp(tcb, scope, templateOrNodes, v)) - 1;
        scope.varMap.set(v, opIndex);
      }
      children = templateOrNodes.children;
    } else {
      children = templateOrNodes;
    }
    for (const node of children) {
      scope.appendNode(node);
    }
    return scope;
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
   * * `TmplAstReference` - retrieve variable created for the local ref
   *
   * @param directive if present, a directive type on a `TmplAstElement` or `TmplAstTemplate` to
   * look up instead of the default for an element or template node.
   */
  resolve(
      node: TmplAstElement|TmplAstTemplate|TmplAstVariable|TmplAstReference,
      directive?: TypeCheckableDirectiveMeta): ts.Expression {
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

      const clone = ts.getMutableClone(res);
      ts.setSyntheticTrailingComments(clone, []);
      return clone;
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
  guards(): ts.Expression|null {
    let parentGuards: ts.Expression|null = null;
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
      return ts.createBinary(parentGuards, ts.SyntaxKind.AmpersandAmpersandToken, this.guard);
    }
  }

  private resolveLocal(
      ref: TmplAstElement|TmplAstTemplate|TmplAstVariable|TmplAstReference,
      directive?: TypeCheckableDirectiveMeta): ts.Expression|null {
    if (ref instanceof TmplAstReference && this.referenceOpMap.has(ref)) {
      return this.resolveOp(this.referenceOpMap.get(ref)!);
    } else if (ref instanceof TmplAstVariable && this.varMap.has(ref)) {
      // Resolving a context variable for this template.
      // Execute the `TcbVariableOp` associated with the `TmplAstVariable`.
      return this.resolveOp(this.varMap.get(ref)!);
    } else if (
        ref instanceof TmplAstTemplate && directive === undefined &&
        this.templateCtxOpMap.has(ref)) {
      // Resolving the context of the given sub-template.
      // Execute the `TcbTemplateContextOp` for the template.
      return this.resolveOp(this.templateCtxOpMap.get(ref)!);
    } else if (
        (ref instanceof TmplAstElement || ref instanceof TmplAstTemplate) &&
        directive !== undefined && this.directiveOpMap.has(ref)) {
      // Resolving a directive on an element or sub-template.
      const dirMap = this.directiveOpMap.get(ref)!;
      if (dirMap.has(directive)) {
        return this.resolveOp(dirMap.get(directive)!);
      } else {
        return null;
      }
    } else if (ref instanceof TmplAstElement && this.elementOpMap.has(ref)) {
      // Resolving the DOM node of an element in this template.
      return this.resolveOp(this.elementOpMap.get(ref)!);
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
  private executeOp(opIndex: number, skipOptional: boolean): ts.Expression|null {
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
      this.appendDirectivesAndInputsOfNode(node);
      this.appendOutputsOfNode(node);
      for (const child of node.children) {
        this.appendNode(child);
      }
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstTemplate) {
      // Template children are rendered in a child scope.
      this.appendDirectivesAndInputsOfNode(node);
      this.appendOutputsOfNode(node);
      const ctxIndex = this.opQueue.push(new TcbTemplateContextOp(this.tcb, this)) - 1;
      this.templateCtxOpMap.set(node, ctxIndex);
      if (this.tcb.env.config.checkTemplateBodies) {
        this.opQueue.push(new TcbTemplateBodyOp(this.tcb, this, node));
      } else if (this.tcb.env.config.alwaysCheckSchemaInTemplateBodies) {
        this.appendDeepSchemaChecks(node.children);
      }
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstBoundText) {
      this.opQueue.push(new TcbTextInterpolationOp(this.tcb, this, node));
    } else if (node instanceof TmplAstIcu) {
      this.appendIcuExpressions(node);
    }
  }

  private checkAndAppendReferencesOfNode(node: TmplAstElement|TmplAstTemplate): void {
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

  private appendDirectivesAndInputsOfNode(node: TmplAstElement|TmplAstTemplate): void {
    // Collect all the inputs on the element.
    const claimedInputs = new Set<string>();
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    if (directives === null || directives.length === 0) {
      // If there are no directives, then all inputs are unclaimed inputs, so queue an operation
      // to add them if needed.
      if (node instanceof TmplAstElement) {
        this.opQueue.push(new TcbUnclaimedInputsOp(this.tcb, this, node, claimedInputs));
        this.opQueue.push(
            new TcbDomSchemaCheckerOp(this.tcb, node, /* checkElement */ true, claimedInputs));
      }
      return;
    }

    const dirMap = new Map<TypeCheckableDirectiveMeta, number>();
    for (const dir of directives) {
      let directiveOp: TcbOp;
      const host = this.tcb.env.reflector;
      const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;

      if (!dir.isGeneric) {
        // The most common case is that when a directive is not generic, we use the normal
        // `TcbNonDirectiveTypeOp`.
        directiveOp = new TcbNonGenericDirectiveTypeOp(this.tcb, this, node, dir);
      } else if (
          !requiresInlineTypeCtor(dirRef.node, host) ||
          this.tcb.env.config.useInlineTypeConstructors) {
        // For generic directives, we use a type constructor to infer types. If a directive requires
        // an inline type constructor, then inlining must be available to use the
        // `TcbDirectiveCtorOp`. If not we, we fallback to using `any` – see below.
        directiveOp = new TcbDirectiveCtorOp(this.tcb, this, node, dir);
      } else {
        // If inlining is not available, then we give up on infering the generic params, and use
        // `any` type for the directive's generic parameters.
        directiveOp = new TcbGenericDirectiveTypeWithAnyParamsOp(this.tcb, this, node, dir);
      }

      const dirIndex = this.opQueue.push(directiveOp) - 1;
      dirMap.set(dir, dirIndex);

      this.opQueue.push(new TcbDirectiveInputsOp(this.tcb, this, node, dir));
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

      this.opQueue.push(new TcbUnclaimedInputsOp(this.tcb, this, node, claimedInputs));
      // If there are no directives which match this element, then it's a "plain" DOM element (or a
      // web component), and should be checked against the DOM schema. If any directives match,
      // we must assume that the element could be custom (either a component, or a directive like
      // <router-outlet>) and shouldn't validate the element name itself.
      const checkElement = directives.length === 0;
      this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, checkElement, claimedInputs));
    }
  }

  private appendOutputsOfNode(node: TmplAstElement|TmplAstTemplate): void {
    // Collect all the outputs on the element.
    const claimedOutputs = new Set<string>();
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    if (directives === null || directives.length === 0) {
      // If there are no directives, then all outputs are unclaimed outputs, so queue an operation
      // to add them if needed.
      if (node instanceof TmplAstElement) {
        this.opQueue.push(new TcbUnclaimedOutputsOp(this.tcb, this, node, claimedOutputs));
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

      this.opQueue.push(new TcbUnclaimedOutputsOp(this.tcb, this, node, claimedOutputs));
    }
  }

  private appendDeepSchemaChecks(nodes: TmplAstNode[]): void {
    for (const node of nodes) {
      if (!(node instanceof TmplAstElement || node instanceof TmplAstTemplate)) {
        continue;
      }

      if (node instanceof TmplAstElement) {
        const claimedInputs = new Set<string>();
        const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
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
      this.opQueue.push(new TcbTextInterpolationOp(this.tcb, this, variable));
    }
    for (const placeholder of Object.values(node.placeholders)) {
      if (placeholder instanceof TmplAstBoundText) {
        this.opQueue.push(new TcbTextInterpolationOp(this.tcb, this, placeholder));
      }
    }
  }
}

interface TcbBoundInput {
  attribute: TmplAstBoundAttribute|TmplAstTextAttribute;
  fieldNames: ClassPropertyName[];
}

/**
 * Create the `ctx` parameter to the top-level TCB function.
 *
 * This is a parameter with a type equivalent to the component type, with all generic type
 * parameters listed (without their generic bounds).
 */
function tcbCtxParam(
    node: ClassDeclaration<ts.ClassDeclaration>, name: ts.EntityName,
    useGenericType: boolean): ts.ParameterDeclaration {
  let typeArguments: ts.TypeNode[]|undefined = undefined;
  // Check if the component is generic, and pass generic type parameters if so.
  if (node.typeParameters !== undefined) {
    if (useGenericType) {
      typeArguments =
          node.typeParameters.map(param => ts.createTypeReferenceNode(param.name, undefined));
    } else {
      typeArguments =
          node.typeParameters.map(() => ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
    }
  }
  const type = ts.createTypeReferenceNode(name, typeArguments);
  return ts.createParameter(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      /* dotDotDotToken */ undefined,
      /* name */ 'ctx',
      /* questionToken */ undefined,
      /* type */ type,
      /* initializer */ undefined);
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
  constructor(protected tcb: Context, protected scope: Scope) {}

  translate(ast: AST): ts.Expression {
    // `astToTypescript` actually does the conversion. A special resolver `tcbResolve` is passed
    // which interprets specific expression nodes that interact with the `ImplicitReceiver`. These
    // nodes actually refer to identifiers within the current scope.
    return astToTypescript(ast, ast => this.resolve(ast), this.tcb.env.config);
  }

  /**
   * Resolve an `AST` expression within the given scope.
   *
   * Some `AST` expressions refer to top-level concepts (references, variables, the component
   * context). This method assists in resolving those.
   */
  protected resolve(ast: AST): ts.Expression|null {
    if (ast instanceof PropertyRead && ast.receiver instanceof ImplicitReceiver) {
      // Try to resolve a bound target for this expression. If no such target is available, then
      // the expression is referencing the top-level component context. In that case, `null` is
      // returned here to let it fall through resolution so it will be caught when the
      // `ImplicitReceiver` is resolved in the branch below.
      return this.resolveTarget(ast);
    } else if (ast instanceof PropertyWrite && ast.receiver instanceof ImplicitReceiver) {
      const target = this.resolveTarget(ast);
      if (target === null) {
        return null;
      }

      const expr = this.translate(ast.value);
      const result = ts.createParen(ts.createBinary(target, ts.SyntaxKind.EqualsToken, expr));
      addParseSpanInfo(result, ast.sourceSpan);
      return result;
    } else if (ast instanceof ImplicitReceiver) {
      // AST instances representing variables and references look very similar to property reads
      // or method calls from the component context: both have the shape
      // PropertyRead(ImplicitReceiver, 'propName') or MethodCall(ImplicitReceiver, 'methodName').
      //
      // `translate` will first try to `resolve` the outer PropertyRead/MethodCall. If this works,
      // it's because the `BoundTarget` found an expression target for the whole expression, and
      // therefore `translate` will never attempt to `resolve` the ImplicitReceiver of that
      // PropertyRead/MethodCall.
      //
      // Therefore if `resolve` is called on an `ImplicitReceiver`, it's because no outer
      // PropertyRead/MethodCall resolved to a variable or reference, and therefore this is a
      // property read or method call on the component context itself.
      return ts.createIdentifier('ctx');
    } else if (ast instanceof BindingPipe) {
      const expr = this.translate(ast.exp);
      const pipeRef = this.tcb.getPipeByName(ast.name);
      let pipe: ts.Expression|null;
      if (pipeRef === null) {
        // No pipe by that name exists in scope. Record this as an error.
        this.tcb.oobRecorder.missingPipe(this.tcb.id, ast);

        // Use an 'any' value to at least allow the rest of the expression to be checked.
        pipe = NULL_AS_ANY;
      } else if (this.tcb.env.config.checkTypeOfPipes) {
        // Use a variable declared as the pipe's type.
        pipe = this.tcb.env.pipeInst(pipeRef);
      } else {
        // Use an 'any' value when not checking the type of the pipe.
        pipe = ts.createAsExpression(
            this.tcb.env.pipeInst(pipeRef), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
      }
      const args = ast.args.map(arg => this.translate(arg));
      const methodAccess = ts.createPropertyAccess(pipe, 'transform');
      addParseSpanInfo(methodAccess, ast.nameSpan);
      const result = ts.createCall(
          /* expression */ methodAccess,
          /* typeArguments */ undefined,
          /* argumentsArray */[expr, ...args]);
      addParseSpanInfo(result, ast.sourceSpan);
      return result;
    } else if (
        ast instanceof MethodCall && ast.receiver instanceof ImplicitReceiver &&
        !(ast.receiver instanceof ThisReceiver)) {
      // Resolve the special `$any(expr)` syntax to insert a cast of the argument to type `any`.
      // `$any(expr)` -> `expr as any`
      if (ast.name === '$any' && ast.args.length === 1) {
        const expr = this.translate(ast.args[0]);
        const exprAsAny =
            ts.createAsExpression(expr, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
        const result = ts.createParen(exprAsAny);
        addParseSpanInfo(result, ast.sourceSpan);
        return result;
      }

      // Attempt to resolve a bound target for the method, and generate the method call if a target
      // could be resolved. If no target is available, then the method is referencing the top-level
      // component context, in which case `null` is returned to let the `ImplicitReceiver` being
      // resolved to the component context.
      const receiver = this.resolveTarget(ast);
      if (receiver === null) {
        return null;
      }

      const method = wrapForDiagnostics(receiver);
      addParseSpanInfo(method, ast.nameSpan);
      const args = ast.args.map(arg => this.translate(arg));
      const node = ts.createCall(method, undefined, args);
      addParseSpanInfo(node, ast.sourceSpan);
      return node;
    } else {
      // This AST isn't special after all.
      return null;
    }
  }

  /**
   * Attempts to resolve a bound target for a given expression, and translates it into the
   * appropriate `ts.Expression` that represents the bound target. If no target is available,
   * `null` is returned.
   */
  protected resolveTarget(ast: AST): ts.Expression|null {
    const binding = this.tcb.boundTarget.getExpressionTarget(ast);
    if (binding === null) {
      return null;
    }

    const expr = this.scope.resolve(binding);
    addParseSpanInfo(expr, ast.sourceSpan);
    return expr;
  }
}

/**
 * Call the type constructor of a directive instance on a given template node, inferring a type for
 * the directive instance from any bound inputs.
 */
function tcbCallTypeCtor(
    dir: TypeCheckableDirectiveMeta, tcb: Context, inputs: TcbDirectiveInput[]): ts.Expression {
  const typeCtor = tcb.env.typeCtorFor(dir);

  // Construct an array of `ts.PropertyAssignment`s for each of the directive's inputs.
  const members = inputs.map(input => {
    const propertyName = ts.createStringLiteral(input.field);

    if (input.type === 'binding') {
      // For bound inputs, the property is assigned the binding expression.
      let expr = input.expression;
      if (!tcb.env.config.checkTypeOfInputBindings) {
        // If checking the type of bindings is disabled, cast the resulting expression to 'any'
        // before the assignment.
        expr = tsCastToAny(expr);
      } else if (!tcb.env.config.strictNullInputBindings) {
        // If strict null checks are disabled, erase `null` and `undefined` from the type by
        // wrapping the expression in a non-null assertion.
        expr = ts.createNonNullExpression(expr);
      }

      const assignment = ts.createPropertyAssignment(propertyName, wrapForDiagnostics(expr));
      addParseSpanInfo(assignment, input.sourceSpan);
      return assignment;
    } else {
      // A type constructor is required to be called with all input properties, so any unset
      // inputs are simply assigned a value of type `any` to ignore them.
      return ts.createPropertyAssignment(propertyName, NULL_AS_ANY);
    }
  });

  // Call the `ngTypeCtor` method on the directive class, with an object literal argument created
  // from the matched inputs.
  return ts.createCall(
      /* expression */ typeCtor,
      /* typeArguments */ undefined,
      /* argumentsArray */[ts.createObjectLiteral(members)]);
}

function getBoundInputs(
    directive: TypeCheckableDirectiveMeta, node: TmplAstTemplate|TmplAstElement,
    tcb: Context): TcbBoundInput[] {
  const boundInputs: TcbBoundInput[] = [];

  const processAttribute = (attr: TmplAstBoundAttribute|TmplAstTextAttribute) => {
    // Skip non-property bindings.
    if (attr instanceof TmplAstBoundAttribute && attr.type !== BindingType.Property) {
      return;
    }

    // Skip the attribute if the directive does not have an input for it.
    const inputs = directive.inputs.getByBindingPropertyName(attr.name);
    if (inputs === null) {
      return;
    }
    const fieldNames = inputs.map(input => input.classPropertyName);
    boundInputs.push({attribute: attr, fieldNames});
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
    attr: TmplAstBoundAttribute|TmplAstTextAttribute, tcb: Context, scope: Scope): ts.Expression {
  if (attr instanceof TmplAstBoundAttribute) {
    // Produce an expression representing the value of the binding.
    return tcbExpression(attr.value, tcb, scope);
  } else {
    // For regular attributes with a static string value, use the represented string literal.
    return ts.createStringLiteral(attr.value);
  }
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

type TcbDirectiveInput = TcbDirectiveBoundInput|TcbDirectiveUnsetInput;

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
    event: TmplAstBoundEvent, tcb: Context, scope: Scope,
    eventType: EventParamType|ts.TypeNode): ts.Expression {
  const handler = tcbEventHandlerExpression(event.handler, tcb, scope);

  let eventParamType: ts.TypeNode|undefined;
  if (eventType === EventParamType.Infer) {
    eventParamType = undefined;
  } else if (eventType === EventParamType.Any) {
    eventParamType = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  } else {
    eventParamType = eventType;
  }

  // Obtain all guards that have been applied to the scope and its parents, as they have to be
  // repeated within the handler function for their narrowing to be in effect within the handler.
  const guards = scope.guards();

  let body: ts.Statement = ts.createExpressionStatement(handler);
  if (guards !== null) {
    // Wrap the body in an `if` statement containing all guards that have to be applied.
    body = ts.createIf(guards, body);
  }

  const eventParam = ts.createParameter(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      /* dotDotDotToken */ undefined,
      /* name */ EVENT_PARAMETER,
      /* questionToken */ undefined,
      /* type */ eventParamType);
  addExpressionIdentifier(eventParam, ExpressionIdentifier.EVENT_PARAMETER);

  return ts.createFunctionExpression(
      /* modifier */ undefined,
      /* asteriskToken */ undefined,
      /* name */ undefined,
      /* typeParameters */ undefined,
      /* parameters */[eventParam],
      /* type */ ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      /* body */ ts.createBlock([body]));
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

class TcbEventHandlerTranslator extends TcbExpressionTranslator {
  protected resolve(ast: AST): ts.Expression|null {
    // Recognize a property read on the implicit receiver corresponding with the event parameter
    // that is available in event bindings. Since this variable is a parameter of the handler
    // function that the converted expression becomes a child of, just create a reference to the
    // parameter by its name.
    if (ast instanceof PropertyRead && ast.receiver instanceof ImplicitReceiver &&
        !(ast.receiver instanceof ThisReceiver) && ast.name === EVENT_PARAMETER) {
      const event = ts.createIdentifier(EVENT_PARAMETER);
      addParseSpanInfo(event, ast.nameSpan);
      return event;
    }

    return super.resolve(ast);
  }
}
