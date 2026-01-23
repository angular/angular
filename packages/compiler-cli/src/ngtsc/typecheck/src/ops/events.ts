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
  ThisReceiver,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import type {Context} from './context';
import type {Scope} from './scope';
import {TypeCheckableDirectiveMeta} from '../../api';
import {addParseSpanInfo} from '../diagnostics';
import {TcbExpressionTranslator, unwrapWritableSignal} from './expression';
import {tsCreateVariable} from '../ts_util';
import {addExpressionIdentifier, ExpressionIdentifier} from '../comments';
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
export function tcbEventHandlerExpression(ast: AST, tcb: Context, scope: Scope): ts.Expression {
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

      if (output.type === ParsedEventType.LegacyAnimation) {
        // Animation output bindings always have an `$event` parameter of type `AnimationEvent`.
        const eventType = this.tcb.env.config.checkTypeOfAnimationEvents
          ? this.tcb.env.referenceExternalType('@angular/animations', 'AnimationEvent')
          : EventParamType.Any;

        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, eventType);
        this.scope.addStatement(ts.factory.createExpressionStatement(handler));
      } else if (output.type === ParsedEventType.Animation) {
        const eventType = this.tcb.env.referenceExternalType(
          '@angular/core',
          'AnimationCallbackEvent',
        );

        const handler = tcbCreateEventHandler(output, this.tcb, this.scope, eventType);
        this.scope.addStatement(ts.factory.createExpressionStatement(handler));
      } else if (this.tcb.env.config.checkTypeOfDomEvents) {
        // If strict checking of DOM events is enabled, generate a call to `addEventListener` on
        // the element instance so that TypeScript's type inference for
        // `HTMLElement.addEventListener` using `HTMLElementEventMap` to infer an accurate type for
        // `$event` depending on the event name. For unknown event names, TypeScript resorts to the
        // base `Event` type.
        let target: ts.Expression;
        let domEventAssertion: ts.Expression | undefined;

        // Only check for `window` and `document` since in theory any target can be passed.
        if (output.target === 'window' || output.target === 'document') {
          target = ts.factory.createIdentifier(output.target);
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
          ts.isIdentifier(target) &&
          this.tcb.env.config.allowDomEventAssertion
        ) {
          domEventAssertion = ts.factory.createCallExpression(
            this.tcb.env.referenceExternalSymbol('@angular/core', 'ɵassertType'),
            [ts.factory.createTypeQueryNode(target)],
            [
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(EVENT_PARAMETER),
                'target',
              ),
            ],
          );
        }

        const propertyAccess = ts.factory.createPropertyAccessExpression(
          target,
          'addEventListener',
        );
        addParseSpanInfo(propertyAccess, output.keySpan);
        const handler = tcbCreateEventHandler(
          output,
          this.tcb,
          this.scope,
          EventParamType.Infer,
          domEventAssertion,
        );
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

class TcbEventHandlerTranslator extends TcbExpressionTranslator {
  protected override resolve(ast: AST): ts.Expression | null {
    // Recognize a property read on the implicit receiver corresponding with the event parameter
    // that is available in event bindings. Since this variable is a parameter of the handler
    // function that the converted expression becomes a child of, just create a reference to the
    // parameter by its name.
    if (
      ast instanceof PropertyRead &&
      ast.receiver instanceof ImplicitReceiver &&
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
  assertionExpression?: ts.Expression,
): ts.Expression {
  const handler = tcbEventHandlerExpression(event.handler, tcb, scope);
  const statements: ts.Statement[] = [];

  if (assertionExpression !== undefined) {
    statements.push(ts.factory.createExpressionStatement(assertionExpression));
  }

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
