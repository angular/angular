/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BindingPipe, BindingType, BoundTarget, DYNAMIC_TYPE, ImplicitReceiver, MethodCall, ParsedEventType, ParseSourceSpan, PropertyRead, PropertyWrite, SchemaMetadata, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstBoundText, TmplAstElement, TmplAstNode, TmplAstReference, TmplAstTemplate, TmplAstTextAttribute, TmplAstVariable} from '@angular/compiler';
import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';

import {TemplateId, TypeCheckableDirectiveMeta, TypeCheckBlockMetadata} from './api';
import {addParseSpanInfo, addTemplateId, ignoreDiagnostics, wrapForDiagnostics} from './diagnostics';
import {DomSchemaChecker} from './dom';
import {Environment} from './environment';
import {astToTypescript, NULL_AS_ANY} from './expression';
import {OutOfBandDiagnosticRecorder} from './oob';
import {ExpressionSemanticVisitor} from './template_semantics';
import {checkIfClassIsExported, checkIfGenericTypesAreUnbound, tsCallMethod, tsCastToAny, tsCreateElement, tsCreateVariable, tsDeclareVariable} from './ts_util';



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

  execute(): ts.Identifier {
    // Look for a context variable for the template.
    const ctx = this.scope.resolve(this.template);

    // Allocate an identifier for the TmplAstVariable, and initialize it to a read of the variable
    // on the template context.
    const id = this.tcb.allocateId();
    const initializer = ts.createPropertyAccess(
        /* expression */ ctx,
        /* name */ this.variable.value || '$implicit');
    addParseSpanInfo(initializer, this.variable.sourceSpan);

    // Declare the variable, and return its identifier.
    this.scope.addStatement(tsCreateVariable(id, initializer));
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
            ignoreDiagnostics(expr);

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
        if (dir.hasNgTemplateContextGuard && this.tcb.env.config.applyTemplateContextGuards) {
          const ctx = this.scope.resolve(this.template);
          const guardInvoke = tsCallMethod(dirId, 'ngTemplateContextGuard', [dirInstId, ctx]);
          addParseSpanInfo(guardInvoke, this.template.sourceSpan);
          directiveGuards.push(guardInvoke);
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

    // Render the template's `Scope` into a block.
    let tmplBlock: ts.Statement = ts.createBlock(tmplScope.render());
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

  execute(): null {
    const expr = tcbExpression(this.binding.value, this.tcb, this.scope);
    this.scope.addStatement(ts.createExpressionStatement(expr));
    return null;
  }
}

/**
 * A `TcbOp` which constructs an instance of a directive with types inferred from its inputs, which
 * also checks the bindings to the directive in the process.
 *
 * Executing this operation returns a reference to the directive instance variable with its inferred
 * type.
 */
class TcbDirectiveOp extends TcbOp {
  constructor(
      private tcb: Context, private scope: Scope, private node: TmplAstTemplate|TmplAstElement,
      private dir: TypeCheckableDirectiveMeta) {
    super();
  }

  execute(): ts.Identifier {
    const id = this.tcb.allocateId();
    // Process the directive and construct expressions for each of its bindings.
    const inputs = tcbGetDirectiveInputs(this.node, this.dir, this.tcb, this.scope);

    // Call the type constructor of the directive to infer a type, and assign the directive
    // instance.
    const typeCtor = tcbCallTypeCtor(this.dir, this.tcb, inputs);
    addParseSpanInfo(typeCtor, this.node.sourceSpan);
    this.scope.addStatement(tsCreateVariable(id, typeCtor));
    return id;
  }

  circularFallback(): TcbOp {
    return new TcbDirectiveCircularFallbackOp(this.tcb, this.scope, this.node, this.dir);
  }
}

/**
 * A `TcbOp` which is used to generate a fallback expression if the inference of a directive type
 * via `TcbDirectiveOp` requires a reference to its own type. This can happen using a template
 * reference:
 *
 * ```html
 * <some-cmp #ref [prop]="ref.foo"></some-cmp>
 * ```
 *
 * In this case, `TcbDirectiveCircularFallbackOp` will add a second inference of the directive type
 * to the type-check block, this time calling the directive's type constructor without any input
 * expressions. This infers the widest possible supertype for the directive, which is used to
 * resolve any recursive references required to infer the real type.
 */
class TcbDirectiveCircularFallbackOp extends TcbOp {
  constructor(
      private tcb: Context, private scope: Scope, private node: TmplAstTemplate|TmplAstElement,
      private dir: TypeCheckableDirectiveMeta) {
    super();
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

  execute(): null {
    // `this.inputs` contains only those bindings not matched by any directive. These bindings go to
    // the element itself.
    const elId = this.scope.resolve(this.element);

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
class TcbDirectiveOutputsOp extends TcbOp {
  constructor(
      private tcb: Context, private scope: Scope, private node: TmplAstTemplate|TmplAstElement,
      private dir: TypeCheckableDirectiveMeta) {
    super();
  }

  execute(): null {
    const dirId = this.scope.resolve(this.node, this.dir);

    // `dir.outputs` is an object map of field names on the directive class to event names.
    // This is backwards from what's needed to match event handlers - a map of event names to field
    // names is desired. Invert `dir.outputs` into `fieldByEventName` to create this map.
    const fieldByEventName = new Map<string, string>();
    const outputs = this.dir.outputs;
    for (const key of Object.keys(outputs)) {
      fieldByEventName.set(outputs[key], key);
    }

    for (const output of this.node.outputs) {
      if (output.type !== ParsedEventType.Regular || !fieldByEventName.has(output.name)) {
        continue;
      }
      const field = fieldByEventName.get(output.name)!;

      if (this.tcb.env.config.checkTypeOfOutputEvents) {
        // For strict checking of directive events, generate a call to the `subscribe` method
        // on the directive's output field to let type information flow into the handler function's
        // `$event` parameter.
        //
        // Note that the `EventEmitter<T>` type from '@angular/core' that is typically used for
        // outputs has a typings deficiency in its `subscribe` method. The generic type `T` is not
        // carried into the handler function, which is vital for inference of the type of `$event`.
        // As a workaround, the directive's field is passed into a helper function that has a
        // specially crafted set of signatures, to effectively cast `EventEmitter<T>` to something
        // that has a `subscribe` method that properly carries the `T` into the handler function.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Infer);

        const outputField = ts.createElementAccess(dirId, ts.createStringLiteral(field));
        const outputHelper =
            ts.createCall(this.tcb.env.declareOutputHelper(), undefined, [outputField]);
        const subscribeFn = ts.createPropertyAccess(outputHelper, 'subscribe');
        const call = ts.createCall(subscribeFn, /* typeArguments */ undefined, [handler]);
        addParseSpanInfo(call, output.sourceSpan);
        this.scope.addStatement(ts.createExpressionStatement(call));
      } else {
        // If strict checking of directive events is disabled, emit a handler function where the
        // `$event` parameter has an explicit `any` type.
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

  execute(): null {
    const elId = this.scope.resolve(this.element);

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

        const call = ts.createCall(
            /* expression */ ts.createPropertyAccess(elId, 'addEventListener'),
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

  getPipeByName(name: string): ts.Expression|null {
    if (!this.pipes.has(name)) {
      return null;
    }
    return this.env.pipeInst(this.pipes.get(name)!);
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
   * A map of maps which tracks the index of `TcbDirectiveOp`s in the `opQueue` for each directive
   * on a `TmplAstElement` or `TmplAstTemplate` node.
   */
  private directiveOpMap =
      new Map<TmplAstElement|TmplAstTemplate, Map<TypeCheckableDirectiveMeta, number>>();

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
   * including any parent scope(s).
   *
   * @param node a `TmplAstNode` of the operation in question. The lookup performed will depend on
   * the type of this node:
   *
   * Assuming `directive` is not present, then `resolve` will return:
   *
   * * `TmplAstElement` - retrieve the expression for the element DOM node
   * * `TmplAstTemplate` - retrieve the template context variable
   * * `TmplAstVariable` - retrieve a template let- variable
   *
   * @param directive if present, a directive type on a `TmplAstElement` or `TmplAstTemplate` to
   * look up instead of the default for an element or template node.
   */
  resolve(
      node: TmplAstElement|TmplAstTemplate|TmplAstVariable,
      directive?: TypeCheckableDirectiveMeta): ts.Expression {
    // Attempt to resolve the operation locally.
    const res = this.resolveLocal(node, directive);
    if (res !== null) {
      return res;
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
      this.executeOp(i);
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
      ref: TmplAstElement|TmplAstTemplate|TmplAstVariable,
      directive?: TypeCheckableDirectiveMeta): ts.Expression|null {
    if (ref instanceof TmplAstVariable && this.varMap.has(ref)) {
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
    const res = this.executeOp(opIndex);
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
  private executeOp(opIndex: number): ts.Expression|null {
    const op = this.opQueue[opIndex];
    if (!(op instanceof TcbOp)) {
      return op;
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
      this.checkReferencesOfNode(node);
    } else if (node instanceof TmplAstTemplate) {
      // Template children are rendered in a child scope.
      this.appendDirectivesAndInputsOfNode(node);
      this.appendOutputsOfNode(node);
      if (this.tcb.env.config.checkTemplateBodies) {
        const ctxIndex = this.opQueue.push(new TcbTemplateContextOp(this.tcb, this)) - 1;
        this.templateCtxOpMap.set(node, ctxIndex);
        this.opQueue.push(new TcbTemplateBodyOp(this.tcb, this, node));
      }
      this.checkReferencesOfNode(node);
    } else if (node instanceof TmplAstBoundText) {
      this.opQueue.push(new TcbTextInterpolationOp(this.tcb, this, node));
    }
  }

  private checkReferencesOfNode(node: TmplAstElement|TmplAstTemplate): void {
    for (const ref of node.references) {
      if (this.tcb.boundTarget.getReferenceTarget(ref) === null) {
        this.tcb.oobRecorder.missingReferenceTarget(this.tcb.id, ref);
      }
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
      const dirIndex = this.opQueue.push(new TcbDirectiveOp(this.tcb, this, node, dir)) - 1;
      dirMap.set(dir, dirIndex);
    }
    this.directiveOpMap.set(node, dirMap);

    // After expanding the directives, we might need to queue an operation to check any unclaimed
    // inputs.
    if (node instanceof TmplAstElement) {
      // Go through the directives and remove any inputs that it claims from `elementInputs`.
      for (const dir of directives) {
        for (const fieldName of Object.keys(dir.inputs)) {
          const value = dir.inputs[fieldName];
          claimedInputs.add(Array.isArray(value) ? value[0] : value);
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
        for (const outputField of Object.keys(dir.outputs)) {
          claimedOutputs.add(dir.outputs[outputField]);
        }
      }

      this.opQueue.push(new TcbUnclaimedOutputsOp(this.tcb, this, node, claimedOutputs));
    }
  }
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
      let pipe: ts.Expression|null;
      if (this.tcb.env.config.checkTypeOfPipes) {
        pipe = this.tcb.getPipeByName(ast.name);
        if (pipe === null) {
          // No pipe by that name exists in scope. Record this as an error.
          this.tcb.oobRecorder.missingPipe(this.tcb.id, ast);

          // Return an 'any' value to at least allow the rest of the expression to be checked.
          pipe = NULL_AS_ANY;
        }
      } else {
        pipe = ts.createParen(ts.createAsExpression(
            ts.createNull(), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)));
      }
      const args = ast.args.map(arg => this.translate(arg));
      const result = tsCallMethod(pipe, 'transform', [expr, ...args]);
      addParseSpanInfo(result, ast.sourceSpan);
      return result;
    } else if (ast instanceof MethodCall && ast.receiver instanceof ImplicitReceiver) {
      // Resolve the special `$any(expr)` syntax to insert a cast of the argument to type `any`.
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

      const method = ts.createPropertyAccess(wrapForDiagnostics(receiver), ast.name);
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

    // This expression has a binding to some variable or reference in the template. Resolve it.
    if (binding instanceof TmplAstVariable) {
      const expr = ts.getMutableClone(this.scope.resolve(binding));
      addParseSpanInfo(expr, ast.sourceSpan);
      return expr;
    } else if (binding instanceof TmplAstReference) {
      const target = this.tcb.boundTarget.getReferenceTarget(binding);
      if (target === null) {
        // This reference is unbound. Traversal of the `TmplAstReference` itself should have
        // recorded the error in the `OutOfBandDiagnosticRecorder`.
        // Still check the rest of the expression if possible by using an `any` value.
        return NULL_AS_ANY;
      }

      // The reference is either to an element, an <ng-template> node, or to a directive on an
      // element or template.

      if (target instanceof TmplAstElement) {
        if (!this.tcb.env.config.checkTypeOfDomReferences) {
          // References to DOM nodes are pinned to 'any'.
          return NULL_AS_ANY;
        }

        const expr = ts.getMutableClone(this.scope.resolve(target));
        addParseSpanInfo(expr, ast.sourceSpan);
        return expr;
      } else if (target instanceof TmplAstTemplate) {
        if (!this.tcb.env.config.checkTypeOfNonDomReferences) {
          // References to `TemplateRef`s pinned to 'any'.
          return NULL_AS_ANY;
        }

        // Direct references to an <ng-template> node simply require a value of type
        // `TemplateRef<any>`. To get this, an expression of the form
        // `(null as any as TemplateRef<any>)` is constructed.
        let value: ts.Expression = ts.createNull();
        value = ts.createAsExpression(value, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
        value = ts.createAsExpression(
            value,
            this.tcb.env.referenceExternalType('@angular/core', 'TemplateRef', [DYNAMIC_TYPE]));
        value = ts.createParen(value);
        addParseSpanInfo(value, ast.sourceSpan);
        return value;
      } else {
        if (!this.tcb.env.config.checkTypeOfNonDomReferences) {
          // References to directives are pinned to 'any'.
          return NULL_AS_ANY;
        }

        const expr = ts.getMutableClone(this.scope.resolve(target.node, target.directive));
        addParseSpanInfo(expr, ast.sourceSpan);
        return expr;
      }
    } else {
      throw new Error(`Unreachable: ${binding}`);
    }
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

type TcbDirectiveInput = {
  type: 'binding'; field: string; expression: ts.Expression; sourceSpan: ParseSourceSpan;
}|{
  type: 'unset';
  field: string;
};

function tcbGetDirectiveInputs(
    el: TmplAstElement|TmplAstTemplate, dir: TypeCheckableDirectiveMeta, tcb: Context,
    scope: Scope): TcbDirectiveInput[] {
  // Only the first binding to a property is written.
  // TODO(alxhub): produce an error for duplicate bindings to the same property, independently of
  // this logic.
  const directiveInputs = new Map<string, TcbDirectiveInput>();
  // `dir.inputs` is an object map of field names on the directive class to property names.
  // This is backwards from what's needed to match bindings - a map of properties to field names
  // is desired. Invert `dir.inputs` into `propMatch` to create this map.
  const propMatch = new Map<string, string>();
  const inputs = dir.inputs;
  Object.keys(inputs).forEach(key => {
    Array.isArray(inputs[key]) ? propMatch.set(inputs[key][0], key) :
                                 propMatch.set(inputs[key] as string, key);
  });

  el.inputs.forEach(processAttribute);
  el.attributes.forEach(processAttribute);
  if (el instanceof TmplAstTemplate) {
    el.templateAttrs.forEach(processAttribute);
  }

  // Add unset directive inputs for each of the remaining unset fields.
  // Note: it's actually important here that `propMatch.values()` isn't used, as there can be
  // multiple fields which share the same property name and only one of them will be listed as a
  // value in `propMatch`.
  for (const field of Object.keys(inputs)) {
    if (!directiveInputs.has(field)) {
      directiveInputs.set(field, {type: 'unset', field});
    }
  }

  return Array.from(directiveInputs.values());

  /**
   * Add a binding expression to the map for each input/template attribute of the directive that has
   * a matching binding.
   */
  function processAttribute(attr: TmplAstBoundAttribute|TmplAstTextAttribute): void {
    // Skip non-property bindings.
    if (attr instanceof TmplAstBoundAttribute && attr.type !== BindingType.Property) {
      return;
    }

    // Skip text attributes if configured to do so.
    if (!tcb.env.config.checkTypeOfAttributes && attr instanceof TmplAstTextAttribute) {
      return;
    }

    // Skip the attribute if the directive does not have an input for it.
    if (!propMatch.has(attr.name)) {
      return;
    }
    const field = propMatch.get(attr.name)!;

    // Skip the attribute if a previous binding also wrote to it.
    if (directiveInputs.has(field)) {
      return;
    }

    let expr: ts.Expression;
    if (attr instanceof TmplAstBoundAttribute) {
      // Produce an expression representing the value of the binding.
      expr = tcbExpression(attr.value, tcb, scope);
    } else {
      // For regular attributes with a static string value, use the represented string literal.
      expr = ts.createStringLiteral(attr.value);
    }

    directiveInputs.set(field, {
      type: 'binding',
      field: field,
      expression: expr,
      sourceSpan: attr.sourceSpan,
    });
  }
}

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
        ast.name === EVENT_PARAMETER) {
      const event = ts.createIdentifier(EVENT_PARAMETER);
      addParseSpanInfo(event, ast.sourceSpan);
      return event;
    }

    return super.resolve(ast);
  }
}

export function requiresInlineTypeCheckBlock(node: ClassDeclaration<ts.ClassDeclaration>): boolean {
  // In order to qualify for a declared TCB (not inline) two conditions must be met:
  // 1) the class must be exported
  // 2) it must not have constrained generic types
  if (!checkIfClassIsExported(node)) {
    // Condition 1 is false, the class is not exported.
    return true;
  } else if (!checkIfGenericTypesAreUnbound(node)) {
    // Condition 2 is false, the class has constrained generic types
    return true;
  } else {
    return false;
  }
}
