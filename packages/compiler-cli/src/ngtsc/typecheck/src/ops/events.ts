/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  DirectiveOwner,
  ImplicitReceiver,
  ParsedEventType,
  PropertyRead,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
} from '@angular/compiler';
import {TcbOp} from './base';
import {quoteAndEscape, getStatementsBlock, TcbExpr} from './codegen';
import type {Context} from './context';
import type {Scope} from './scope';
import {TcbDirectiveMetadata} from '../../api';
import {TcbExpressionTranslator, unwrapWritableSignal} from './expression';
import {ExpressionIdentifier} from '../comments';
import {checkSplitTwoWayBinding} from './bindings';
import {LocalSymbol} from './references';

const EVENT_PARAMETER = '$event';

const enum EventParamType {
  /* Generates code to infer the type of `$event` based on how the listener is registered. */
  Infer,

  /* Declares the type of the `$event` parameter as `any`. */
  Any,
}

/**
 * Similar to `tcbExpression`, this function converts the provided `AST` expression into a
 * `ts.Expression`, with special handling of the `$event` variable that can be used within event
 * bindings.
 */
export function tcbEventHandlerExpression(ast: AST, tcb: Context, scope: Scope): TcbExpr {
  const translator = new TcbEventHandlerTranslator(tcb, scope);
  return translator.translate(ast);
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
    private node: DirectiveOwner,
    private inputs: TmplAstBoundAttribute[] | null,
    private outputs: TmplAstBoundEvent[],
    private dir: TcbDirectiveMetadata,
  ) {
    super();
  }

  override get optional() {
    return false;
  }

  override execute(): null {
    let dirId: TcbExpr | null = null;
    const outputs = this.dir.outputs;

    for (const output of this.outputs) {
      if (
        output.type === ParsedEventType.LegacyAnimation ||
        !outputs.hasBindingPropertyName(output.name)
      ) {
        continue;
      }

      if (
        this.tcb.env.config.checkTypeOfOutputEvents &&
        this.inputs !== null &&
        output.name.endsWith('Change')
      ) {
        const inputName = output.name.slice(0, -6);
        checkSplitTwoWayBinding(inputName, output, this.inputs, this.tcb);
      }
      // TODO(alxhub): consider supporting multiple fields with the same property name for outputs.
      const field = outputs.getByBindingPropertyName(output.name)![0].classPropertyName;

      if (dirId === null) {
        dirId = this.scope.resolve(this.node, this.dir);
      }
      const outputField = new TcbExpr(`${dirId.print()}[${quoteAndEscape(field)}]`);
      outputField.addParseSpanInfo(output.keySpan);

      if (this.tcb.env.config.checkTypeOfOutputEvents) {
        // For strict checking of directive events, generate a call to the `subscribe` method
        // on the directive's output field to let type information flow into the handler function's
        // `$event` parameter.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Infer);
        const call = new TcbExpr(`${outputField.print()}.subscribe(${handler.print()})`);
        call.addParseSpanInfo(output.sourceSpan);
        this.scope.addStatement(call);
      } else {
        // If strict checking of directive events is disabled:
        //
        // * We still generate the access to the output field as a statement in the TCB so consumers
        //   of the `TemplateTypeChecker` can still find the node for the class member for the
        //   output.
        // * Emit a handler function where the `$event` parameter has an explicit `any` type.
        this.scope.addStatement(outputField);
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Any);
        this.scope.addStatement(handler);
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
export class TcbUnclaimedOutputsOp extends TcbOp {
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
    let elId: TcbExpr | null = null;

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

      if (output.type === ParsedEventType.LegacyAnimation) {
        // Animation output bindings always have an `$event` parameter of type `AnimationEvent`.
        const eventType = this.tcb.env.config.checkTypeOfAnimationEvents
          ? this.tcb.env.referenceExternalSymbol('@angular/animations', 'AnimationEvent').print()
          : EventParamType.Any;

        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, eventType);
        this.scope.addStatement(handler);
      } else if (output.type === ParsedEventType.Animation) {
        const eventType = this.tcb.env.referenceExternalSymbol(
          '@angular/core',
          'AnimationCallbackEvent',
        );

        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, eventType.print());
        this.scope.addStatement(handler);
      } else if (this.tcb.env.config.checkTypeOfDomEvents) {
        // If strict checking of DOM events is enabled, generate a call to `addEventListener` on
        // the element instance so that TypeScript's type inference for
        // `HTMLElement.addEventListener` using `HTMLElementEventMap` to infer an accurate type for
        // `$event` depending on the event name. For unknown event names, TypeScript resorts to the
        // base `Event` type.
        let target: TcbExpr;
        let domEventAssertion: TcbExpr | undefined;

        // Only check for `window` and `document` since in theory any target can be passed.
        if (output.target === 'window' || output.target === 'document') {
          target = new TcbExpr(output.target);
        } else if (elId === null) {
          target = elId = this.scope.resolve(this.target);
        } else {
          target = elId;
        }

        // By default the target of an event is `EventTarget | null`, because of bubbling
        // and custom events. This can be inconvenient in some common cases like `input` elements
        // since we don't have the ability to type cast in templates. We can improve the type
        // checking for some of these cases by inferring the target based on the element it was
        // bound to. We can only do this safely if the element is a void element (e.g. `input` or
        // `img`), because we know that it couldn't have bubbled from a child. The event handler
        // with the assertion would look as follows:
        //
        // ```
        // const _t1 = document.createElement('input');
        //
        // _t1.addEventListener('input', ($event) => {
        //   ɵassertType<typeof _t1>($event.target);
        //   handler($event.target);
        // });
        // ```
        if (
          this.target instanceof TmplAstElement &&
          this.target.isVoid &&
          this.tcb.env.config.allowDomEventAssertion
        ) {
          const assertUtil = this.tcb.env.referenceExternalSymbol('@angular/core', 'ɵassertType');
          domEventAssertion = new TcbExpr(
            `${assertUtil.print()}<typeof ${target.print()}>(${EVENT_PARAMETER}.target)`,
          );
        }

        const propertyAccess = new TcbExpr(`${target.print()}.addEventListener`).addParseSpanInfo(
          output.keySpan,
        );
        const handler = tcbCreateEventHandler(
          output,
          this.tcb,
          this.scope,
          EventParamType.Infer,
          domEventAssertion,
        );
        const call = new TcbExpr(
          `${propertyAccess.print()}(${quoteAndEscape(output.name)}, ${handler.print()})`,
        );
        call.addParseSpanInfo(output.sourceSpan);
        this.scope.addStatement(call);
      } else {
        // If strict checking of DOM inputs is disabled, emit a handler function where the `$event`
        // parameter has an explicit `any` type.
        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, EventParamType.Any);
        this.scope.addStatement(handler);
      }
    }

    return null;
  }
}

class TcbEventHandlerTranslator extends TcbExpressionTranslator {
  protected override resolve(ast: AST): TcbExpr | null {
    // Recognize a property read on the implicit receiver corresponding with the event parameter
    // that is available in event bindings. Since this variable is a parameter of the handler
    // function that the converted expression becomes a child of, just create a reference to the
    // parameter by its name.
    if (
      ast instanceof PropertyRead &&
      ast.receiver instanceof ImplicitReceiver &&
      ast.name === EVENT_PARAMETER
    ) {
      return new TcbExpr(EVENT_PARAMETER).addParseSpanInfo(ast.nameSpan);
    }

    return super.resolve(ast);
  }

  protected override isValidLetDeclarationAccess(): boolean {
    // Event listeners are allowed to read `@let` declarations before
    // they're declared since the callback won't be executed immediately.
    return true;
  }
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
  eventType: EventParamType | string,
  assertionExpression?: TcbExpr,
): TcbExpr {
  const handler = tcbEventHandlerExpression(event.handler, tcb, scope);
  const statements: TcbExpr[] = [];

  if (assertionExpression !== undefined) {
    statements.push(assertionExpression);
  }

  // TODO(crisbeto): remove the `checkTwoWayBoundEvents` check in v20.
  if (event.type === ParsedEventType.TwoWay && tcb.env.config.checkTwoWayBoundEvents) {
    // If we're dealing with a two-way event, we create a variable initialized to the unwrapped
    // signal value of the expression and then we assign `$event` to it. Note that in most cases
    // this will already be covered by the corresponding input binding, however it allows us to
    // handle the case where the input has a wider type than the output (see #58971).
    const target = tcb.allocateId();
    const initializer = tcb.env.config.allowSignalsInTwoWayBindings
      ? unwrapWritableSignal(handler, tcb)
      : handler;

    statements.push(
      new TcbExpr(`var ${target} = ${initializer.print()}`),
      new TcbExpr(`${target} = ${EVENT_PARAMETER}`),
    );
  } else {
    statements.push(handler);
  }

  let eventParamType: string | undefined;
  if (eventType === EventParamType.Infer) {
    eventParamType = undefined;
  } else if (eventType === EventParamType.Any) {
    eventParamType = 'any';
  } else {
    eventParamType = eventType;
  }

  // Obtain all guards that have been applied to the scope and its parents, as they have to be
  // repeated within the handler function for their narrowing to be in effect within the handler.
  const guards = scope.guards();
  let body = `{\n${getStatementsBlock(statements)} }`;

  if (guards !== null) {
    // Wrap the body in an `if` statement containing all guards that have to be applied.
    body = `{ if (${guards.print()}) ${body} }`;
  }

  const eventParam = new TcbExpr(
    `${EVENT_PARAMETER}${eventParamType === undefined ? '' : ': ' + eventParamType}`,
  );
  eventParam.addExpressionIdentifier(ExpressionIdentifier.EVENT_PARAMETER);

  // Return an arrow function instead of a function expression to preserve the `this` context.
  return new TcbExpr(`(${eventParam.print()}): any => ${body}`);
}
