/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import {ExpressionKind, OpKind} from './enums';
import {Interpolation} from './ops/update';
import {ConsumesVarsTrait, DependsOnSlotContext, UsesVarOffset} from './traits';
/**
 * Check whether a given `o.Expression` is a logical IR expression type.
 */
export function isIrExpression(expr) {
  return expr instanceof ExpressionBase;
}
/**
 * Base type used for all logical IR expressions.
 */
export class ExpressionBase extends o.Expression {
  constructor(sourceSpan = null) {
    super(null, sourceSpan);
  }
}
/**
 * Logical expression representing a lexical read of a variable name.
 */
export class LexicalReadExpr extends ExpressionBase {
  name;
  kind = ExpressionKind.LexicalRead;
  constructor(name) {
    super();
    this.name = name;
  }
  visitExpression(visitor, context) {}
  isEquivalent(other) {
    // We assume that the lexical reads are in the same context, which must be true for parent
    // expressions to be equivalent.
    // TODO: is this generally safe?
    return this.name === other.name;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    return new LexicalReadExpr(this.name);
  }
}
/**
 * Runtime operation to retrieve the value of a local reference.
 */
export class ReferenceExpr extends ExpressionBase {
  target;
  targetSlot;
  offset;
  kind = ExpressionKind.Reference;
  constructor(target, targetSlot, offset) {
    super();
    this.target = target;
    this.targetSlot = targetSlot;
    this.offset = offset;
  }
  visitExpression() {}
  isEquivalent(e) {
    return e instanceof ReferenceExpr && e.target === this.target;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    return new ReferenceExpr(this.target, this.targetSlot, this.offset);
  }
}
export class StoreLetExpr extends ExpressionBase {
  target;
  value;
  sourceSpan;
  kind = ExpressionKind.StoreLet;
  [ConsumesVarsTrait] = true;
  [DependsOnSlotContext] = true;
  constructor(target, value, sourceSpan) {
    super();
    this.target = target;
    this.value = value;
    this.sourceSpan = sourceSpan;
  }
  visitExpression() {}
  isEquivalent(e) {
    return (
      e instanceof StoreLetExpr && e.target === this.target && e.value.isEquivalent(this.value)
    );
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.value = transformExpressionsInExpression(this.value, transform, flags);
  }
  clone() {
    return new StoreLetExpr(this.target, this.value, this.sourceSpan);
  }
}
export class ContextLetReferenceExpr extends ExpressionBase {
  target;
  targetSlot;
  kind = ExpressionKind.ContextLetReference;
  constructor(target, targetSlot) {
    super();
    this.target = target;
    this.targetSlot = targetSlot;
  }
  visitExpression() {}
  isEquivalent(e) {
    return e instanceof ContextLetReferenceExpr && e.target === this.target;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    return new ContextLetReferenceExpr(this.target, this.targetSlot);
  }
}
/**
 * A reference to the current view context (usually the `ctx` variable in a template function).
 */
export class ContextExpr extends ExpressionBase {
  view;
  kind = ExpressionKind.Context;
  constructor(view) {
    super();
    this.view = view;
  }
  visitExpression() {}
  isEquivalent(e) {
    return e instanceof ContextExpr && e.view === this.view;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    return new ContextExpr(this.view);
  }
}
/**
 * A reference to the current view context inside a track function.
 */
export class TrackContextExpr extends ExpressionBase {
  view;
  kind = ExpressionKind.TrackContext;
  constructor(view) {
    super();
    this.view = view;
  }
  visitExpression() {}
  isEquivalent(e) {
    return e instanceof TrackContextExpr && e.view === this.view;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    return new TrackContextExpr(this.view);
  }
}
/**
 * Runtime operation to navigate to the next view context in the view hierarchy.
 */
export class NextContextExpr extends ExpressionBase {
  kind = ExpressionKind.NextContext;
  steps = 1;
  constructor() {
    super();
  }
  visitExpression() {}
  isEquivalent(e) {
    return e instanceof NextContextExpr && e.steps === this.steps;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    const expr = new NextContextExpr();
    expr.steps = this.steps;
    return expr;
  }
}
/**
 * Runtime operation to snapshot the current view context.
 *
 * The result of this operation can be stored in a variable and later used with the `RestoreView`
 * operation.
 */
export class GetCurrentViewExpr extends ExpressionBase {
  kind = ExpressionKind.GetCurrentView;
  constructor() {
    super();
  }
  visitExpression() {}
  isEquivalent(e) {
    return e instanceof GetCurrentViewExpr;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    return new GetCurrentViewExpr();
  }
}
/**
 * Runtime operation to restore a snapshotted view.
 */
export class RestoreViewExpr extends ExpressionBase {
  view;
  kind = ExpressionKind.RestoreView;
  constructor(view) {
    super();
    this.view = view;
  }
  visitExpression(visitor, context) {
    if (typeof this.view !== 'number') {
      this.view.visitExpression(visitor, context);
    }
  }
  isEquivalent(e) {
    if (!(e instanceof RestoreViewExpr) || typeof e.view !== typeof this.view) {
      return false;
    }
    if (typeof this.view === 'number') {
      return this.view === e.view;
    } else {
      return this.view.isEquivalent(e.view);
    }
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    if (typeof this.view !== 'number') {
      this.view = transformExpressionsInExpression(this.view, transform, flags);
    }
  }
  clone() {
    return new RestoreViewExpr(this.view instanceof o.Expression ? this.view.clone() : this.view);
  }
}
/**
 * Runtime operation to reset the current view context after `RestoreView`.
 */
export class ResetViewExpr extends ExpressionBase {
  expr;
  kind = ExpressionKind.ResetView;
  constructor(expr) {
    super();
    this.expr = expr;
  }
  visitExpression(visitor, context) {
    this.expr.visitExpression(visitor, context);
  }
  isEquivalent(e) {
    return e instanceof ResetViewExpr && this.expr.isEquivalent(e.expr);
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.expr = transformExpressionsInExpression(this.expr, transform, flags);
  }
  clone() {
    return new ResetViewExpr(this.expr.clone());
  }
}
export class TwoWayBindingSetExpr extends ExpressionBase {
  target;
  value;
  kind = ExpressionKind.TwoWayBindingSet;
  constructor(target, value) {
    super();
    this.target = target;
    this.value = value;
  }
  visitExpression(visitor, context) {
    this.target.visitExpression(visitor, context);
    this.value.visitExpression(visitor, context);
  }
  isEquivalent(other) {
    return this.target.isEquivalent(other.target) && this.value.isEquivalent(other.value);
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.target = transformExpressionsInExpression(this.target, transform, flags);
    this.value = transformExpressionsInExpression(this.value, transform, flags);
  }
  clone() {
    return new TwoWayBindingSetExpr(this.target, this.value);
  }
}
/**
 * Read of a variable declared as an `ir.VariableOp` and referenced through its `ir.XrefId`.
 */
export class ReadVariableExpr extends ExpressionBase {
  xref;
  kind = ExpressionKind.ReadVariable;
  name = null;
  constructor(xref) {
    super();
    this.xref = xref;
  }
  visitExpression() {}
  isEquivalent(other) {
    return other instanceof ReadVariableExpr && other.xref === this.xref;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions() {}
  clone() {
    const expr = new ReadVariableExpr(this.xref);
    expr.name = this.name;
    return expr;
  }
}
export class PureFunctionExpr extends ExpressionBase {
  kind = ExpressionKind.PureFunctionExpr;
  [ConsumesVarsTrait] = true;
  [UsesVarOffset] = true;
  varOffset = null;
  /**
   * The expression which should be memoized as a pure computation.
   *
   * This expression contains internal `PureFunctionParameterExpr`s, which are placeholders for the
   * positional argument expressions in `args.
   */
  body;
  /**
   * Positional arguments to the pure function which will memoize the `body` expression, which act
   * as memoization keys.
   */
  args;
  /**
   * Once extracted to the `ConstantPool`, a reference to the function which defines the computation
   * of `body`.
   */
  fn = null;
  constructor(expression, args) {
    super();
    this.body = expression;
    this.args = args;
  }
  visitExpression(visitor, context) {
    this.body?.visitExpression(visitor, context);
    for (const arg of this.args) {
      arg.visitExpression(visitor, context);
    }
  }
  isEquivalent(other) {
    if (!(other instanceof PureFunctionExpr) || other.args.length !== this.args.length) {
      return false;
    }
    return (
      other.body !== null &&
      this.body !== null &&
      other.body.isEquivalent(this.body) &&
      other.args.every((arg, idx) => arg.isEquivalent(this.args[idx]))
    );
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    if (this.body !== null) {
      // TODO: figure out if this is the right flag to pass here.
      this.body = transformExpressionsInExpression(
        this.body,
        transform,
        flags | VisitorContextFlag.InChildOperation,
      );
    } else if (this.fn !== null) {
      this.fn = transformExpressionsInExpression(this.fn, transform, flags);
    }
    for (let i = 0; i < this.args.length; i++) {
      this.args[i] = transformExpressionsInExpression(this.args[i], transform, flags);
    }
  }
  clone() {
    const expr = new PureFunctionExpr(
      this.body?.clone() ?? null,
      this.args.map((arg) => arg.clone()),
    );
    expr.fn = this.fn?.clone() ?? null;
    expr.varOffset = this.varOffset;
    return expr;
  }
}
export class PureFunctionParameterExpr extends ExpressionBase {
  index;
  kind = ExpressionKind.PureFunctionParameterExpr;
  constructor(index) {
    super();
    this.index = index;
  }
  visitExpression() {}
  isEquivalent(other) {
    return other instanceof PureFunctionParameterExpr && other.index === this.index;
  }
  isConstant() {
    return true;
  }
  transformInternalExpressions() {}
  clone() {
    return new PureFunctionParameterExpr(this.index);
  }
}
export class PipeBindingExpr extends ExpressionBase {
  target;
  targetSlot;
  name;
  args;
  kind = ExpressionKind.PipeBinding;
  [ConsumesVarsTrait] = true;
  [UsesVarOffset] = true;
  varOffset = null;
  constructor(target, targetSlot, name, args) {
    super();
    this.target = target;
    this.targetSlot = targetSlot;
    this.name = name;
    this.args = args;
  }
  visitExpression(visitor, context) {
    for (const arg of this.args) {
      arg.visitExpression(visitor, context);
    }
  }
  isEquivalent() {
    return false;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    for (let idx = 0; idx < this.args.length; idx++) {
      this.args[idx] = transformExpressionsInExpression(this.args[idx], transform, flags);
    }
  }
  clone() {
    const r = new PipeBindingExpr(
      this.target,
      this.targetSlot,
      this.name,
      this.args.map((a) => a.clone()),
    );
    r.varOffset = this.varOffset;
    return r;
  }
}
export class PipeBindingVariadicExpr extends ExpressionBase {
  target;
  targetSlot;
  name;
  args;
  numArgs;
  kind = ExpressionKind.PipeBindingVariadic;
  [ConsumesVarsTrait] = true;
  [UsesVarOffset] = true;
  varOffset = null;
  constructor(target, targetSlot, name, args, numArgs) {
    super();
    this.target = target;
    this.targetSlot = targetSlot;
    this.name = name;
    this.args = args;
    this.numArgs = numArgs;
  }
  visitExpression(visitor, context) {
    this.args.visitExpression(visitor, context);
  }
  isEquivalent() {
    return false;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.args = transformExpressionsInExpression(this.args, transform, flags);
  }
  clone() {
    const r = new PipeBindingVariadicExpr(
      this.target,
      this.targetSlot,
      this.name,
      this.args.clone(),
      this.numArgs,
    );
    r.varOffset = this.varOffset;
    return r;
  }
}
export class SafePropertyReadExpr extends ExpressionBase {
  receiver;
  name;
  kind = ExpressionKind.SafePropertyRead;
  constructor(receiver, name) {
    super();
    this.receiver = receiver;
    this.name = name;
  }
  // An alias for name, which allows other logic to handle property reads and keyed reads together.
  get index() {
    return this.name;
  }
  visitExpression(visitor, context) {
    this.receiver.visitExpression(visitor, context);
  }
  isEquivalent() {
    return false;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.receiver = transformExpressionsInExpression(this.receiver, transform, flags);
  }
  clone() {
    return new SafePropertyReadExpr(this.receiver.clone(), this.name);
  }
}
export class SafeKeyedReadExpr extends ExpressionBase {
  receiver;
  index;
  kind = ExpressionKind.SafeKeyedRead;
  constructor(receiver, index, sourceSpan) {
    super(sourceSpan);
    this.receiver = receiver;
    this.index = index;
  }
  visitExpression(visitor, context) {
    this.receiver.visitExpression(visitor, context);
    this.index.visitExpression(visitor, context);
  }
  isEquivalent() {
    return false;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.receiver = transformExpressionsInExpression(this.receiver, transform, flags);
    this.index = transformExpressionsInExpression(this.index, transform, flags);
  }
  clone() {
    return new SafeKeyedReadExpr(this.receiver.clone(), this.index.clone(), this.sourceSpan);
  }
}
export class SafeInvokeFunctionExpr extends ExpressionBase {
  receiver;
  args;
  kind = ExpressionKind.SafeInvokeFunction;
  constructor(receiver, args) {
    super();
    this.receiver = receiver;
    this.args = args;
  }
  visitExpression(visitor, context) {
    this.receiver.visitExpression(visitor, context);
    for (const a of this.args) {
      a.visitExpression(visitor, context);
    }
  }
  isEquivalent() {
    return false;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.receiver = transformExpressionsInExpression(this.receiver, transform, flags);
    for (let i = 0; i < this.args.length; i++) {
      this.args[i] = transformExpressionsInExpression(this.args[i], transform, flags);
    }
  }
  clone() {
    return new SafeInvokeFunctionExpr(
      this.receiver.clone(),
      this.args.map((a) => a.clone()),
    );
  }
}
export class SafeTernaryExpr extends ExpressionBase {
  guard;
  expr;
  kind = ExpressionKind.SafeTernaryExpr;
  constructor(guard, expr) {
    super();
    this.guard = guard;
    this.expr = expr;
  }
  visitExpression(visitor, context) {
    this.guard.visitExpression(visitor, context);
    this.expr.visitExpression(visitor, context);
  }
  isEquivalent() {
    return false;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.guard = transformExpressionsInExpression(this.guard, transform, flags);
    this.expr = transformExpressionsInExpression(this.expr, transform, flags);
  }
  clone() {
    return new SafeTernaryExpr(this.guard.clone(), this.expr.clone());
  }
}
export class EmptyExpr extends ExpressionBase {
  kind = ExpressionKind.EmptyExpr;
  visitExpression(visitor, context) {}
  isEquivalent(e) {
    return e instanceof EmptyExpr;
  }
  isConstant() {
    return true;
  }
  clone() {
    return new EmptyExpr();
  }
  transformInternalExpressions() {}
}
export class AssignTemporaryExpr extends ExpressionBase {
  expr;
  xref;
  kind = ExpressionKind.AssignTemporaryExpr;
  name = null;
  constructor(expr, xref) {
    super();
    this.expr = expr;
    this.xref = xref;
  }
  visitExpression(visitor, context) {
    this.expr.visitExpression(visitor, context);
  }
  isEquivalent() {
    return false;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {
    this.expr = transformExpressionsInExpression(this.expr, transform, flags);
  }
  clone() {
    const a = new AssignTemporaryExpr(this.expr.clone(), this.xref);
    a.name = this.name;
    return a;
  }
}
export class ReadTemporaryExpr extends ExpressionBase {
  xref;
  kind = ExpressionKind.ReadTemporaryExpr;
  name = null;
  constructor(xref) {
    super();
    this.xref = xref;
  }
  visitExpression(visitor, context) {}
  isEquivalent() {
    return this.xref === this.xref;
  }
  isConstant() {
    return false;
  }
  transformInternalExpressions(transform, flags) {}
  clone() {
    const r = new ReadTemporaryExpr(this.xref);
    r.name = this.name;
    return r;
  }
}
export class SlotLiteralExpr extends ExpressionBase {
  slot;
  kind = ExpressionKind.SlotLiteralExpr;
  constructor(slot) {
    super();
    this.slot = slot;
  }
  visitExpression(visitor, context) {}
  isEquivalent(e) {
    return e instanceof SlotLiteralExpr && e.slot === this.slot;
  }
  isConstant() {
    return true;
  }
  clone() {
    return new SlotLiteralExpr(this.slot);
  }
  transformInternalExpressions() {}
}
export class ConditionalCaseExpr extends ExpressionBase {
  expr;
  target;
  targetSlot;
  alias;
  kind = ExpressionKind.ConditionalCase;
  /**
   * Create an expression for one branch of a conditional.
   * @param expr The expression to be tested for this case. Might be null, as in an `else` case.
   * @param target The Xref of the view to be displayed if this condition is true.
   */
  constructor(expr, target, targetSlot, alias = null) {
    super();
    this.expr = expr;
    this.target = target;
    this.targetSlot = targetSlot;
    this.alias = alias;
  }
  visitExpression(visitor, context) {
    if (this.expr !== null) {
      this.expr.visitExpression(visitor, context);
    }
  }
  isEquivalent(e) {
    return e instanceof ConditionalCaseExpr && e.expr === this.expr;
  }
  isConstant() {
    return true;
  }
  clone() {
    return new ConditionalCaseExpr(this.expr, this.target, this.targetSlot);
  }
  transformInternalExpressions(transform, flags) {
    if (this.expr !== null) {
      this.expr = transformExpressionsInExpression(this.expr, transform, flags);
    }
  }
}
export class ConstCollectedExpr extends ExpressionBase {
  expr;
  kind = ExpressionKind.ConstCollected;
  constructor(expr) {
    super();
    this.expr = expr;
  }
  transformInternalExpressions(transform, flags) {
    this.expr = transform(this.expr, flags);
  }
  visitExpression(visitor, context) {
    this.expr.visitExpression(visitor, context);
  }
  isEquivalent(e) {
    if (!(e instanceof ConstCollectedExpr)) {
      return false;
    }
    return this.expr.isEquivalent(e.expr);
  }
  isConstant() {
    return this.expr.isConstant();
  }
  clone() {
    return new ConstCollectedExpr(this.expr);
  }
}
/**
 * Visits all `Expression`s in the AST of `op` with the `visitor` function.
 */
export function visitExpressionsInOp(op, visitor) {
  transformExpressionsInOp(
    op,
    (expr, flags) => {
      visitor(expr, flags);
      return expr;
    },
    VisitorContextFlag.None,
  );
}
export var VisitorContextFlag;
(function (VisitorContextFlag) {
  VisitorContextFlag[(VisitorContextFlag['None'] = 0)] = 'None';
  VisitorContextFlag[(VisitorContextFlag['InChildOperation'] = 1)] = 'InChildOperation';
})(VisitorContextFlag || (VisitorContextFlag = {}));
function transformExpressionsInInterpolation(interpolation, transform, flags) {
  for (let i = 0; i < interpolation.expressions.length; i++) {
    interpolation.expressions[i] = transformExpressionsInExpression(
      interpolation.expressions[i],
      transform,
      flags,
    );
  }
}
/**
 * Transform all `Expression`s in the AST of `op` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInOp(op, transform, flags) {
  switch (op.kind) {
    case OpKind.StyleProp:
    case OpKind.StyleMap:
    case OpKind.ClassProp:
    case OpKind.ClassMap:
    case OpKind.AnimationString:
    case OpKind.AnimationBinding:
    case OpKind.Binding:
      if (op.expression instanceof Interpolation) {
        transformExpressionsInInterpolation(op.expression, transform, flags);
      } else {
        op.expression = transformExpressionsInExpression(op.expression, transform, flags);
      }
      break;
    case OpKind.Property:
    case OpKind.DomProperty:
    case OpKind.Attribute:
      if (op.expression instanceof Interpolation) {
        transformExpressionsInInterpolation(op.expression, transform, flags);
      } else {
        op.expression = transformExpressionsInExpression(op.expression, transform, flags);
      }
      op.sanitizer =
        op.sanitizer && transformExpressionsInExpression(op.sanitizer, transform, flags);
      break;
    case OpKind.TwoWayProperty:
      op.expression = transformExpressionsInExpression(op.expression, transform, flags);
      op.sanitizer =
        op.sanitizer && transformExpressionsInExpression(op.sanitizer, transform, flags);
      break;
    case OpKind.I18nExpression:
      op.expression = transformExpressionsInExpression(op.expression, transform, flags);
      break;
    case OpKind.InterpolateText:
      transformExpressionsInInterpolation(op.interpolation, transform, flags);
      break;
    case OpKind.Statement:
      transformExpressionsInStatement(op.statement, transform, flags);
      break;
    case OpKind.Variable:
      op.initializer = transformExpressionsInExpression(op.initializer, transform, flags);
      break;
    case OpKind.Conditional:
      for (const condition of op.conditions) {
        if (condition.expr === null) {
          // This is a default case.
          continue;
        }
        condition.expr = transformExpressionsInExpression(condition.expr, transform, flags);
      }
      if (op.processed !== null) {
        op.processed = transformExpressionsInExpression(op.processed, transform, flags);
      }
      if (op.contextValue !== null) {
        op.contextValue = transformExpressionsInExpression(op.contextValue, transform, flags);
      }
      break;
    case OpKind.Animation:
    case OpKind.AnimationListener:
    case OpKind.Listener:
    case OpKind.TwoWayListener:
      for (const innerOp of op.handlerOps) {
        transformExpressionsInOp(innerOp, transform, flags | VisitorContextFlag.InChildOperation);
      }
      break;
    case OpKind.ExtractedAttribute:
      op.expression =
        op.expression && transformExpressionsInExpression(op.expression, transform, flags);
      op.trustedValueFn =
        op.trustedValueFn && transformExpressionsInExpression(op.trustedValueFn, transform, flags);
      break;
    case OpKind.RepeaterCreate:
      if (op.trackByOps === null) {
        op.track = transformExpressionsInExpression(op.track, transform, flags);
      } else {
        for (const innerOp of op.trackByOps) {
          transformExpressionsInOp(innerOp, transform, flags | VisitorContextFlag.InChildOperation);
        }
      }
      if (op.trackByFn !== null) {
        op.trackByFn = transformExpressionsInExpression(op.trackByFn, transform, flags);
      }
      break;
    case OpKind.Repeater:
      op.collection = transformExpressionsInExpression(op.collection, transform, flags);
      break;
    case OpKind.Defer:
      if (op.loadingConfig !== null) {
        op.loadingConfig = transformExpressionsInExpression(op.loadingConfig, transform, flags);
      }
      if (op.placeholderConfig !== null) {
        op.placeholderConfig = transformExpressionsInExpression(
          op.placeholderConfig,
          transform,
          flags,
        );
      }
      if (op.resolverFn !== null) {
        op.resolverFn = transformExpressionsInExpression(op.resolverFn, transform, flags);
      }
      break;
    case OpKind.I18nMessage:
      for (const [placeholder, expr] of op.params) {
        op.params.set(placeholder, transformExpressionsInExpression(expr, transform, flags));
      }
      for (const [placeholder, expr] of op.postprocessingParams) {
        op.postprocessingParams.set(
          placeholder,
          transformExpressionsInExpression(expr, transform, flags),
        );
      }
      break;
    case OpKind.DeferWhen:
      op.expr = transformExpressionsInExpression(op.expr, transform, flags);
      break;
    case OpKind.StoreLet:
      op.value = transformExpressionsInExpression(op.value, transform, flags);
      break;
    case OpKind.Advance:
    case OpKind.Container:
    case OpKind.ContainerEnd:
    case OpKind.ContainerStart:
    case OpKind.DeferOn:
    case OpKind.DisableBindings:
    case OpKind.Element:
    case OpKind.ElementEnd:
    case OpKind.ElementStart:
    case OpKind.EnableBindings:
    case OpKind.I18n:
    case OpKind.I18nApply:
    case OpKind.I18nContext:
    case OpKind.I18nEnd:
    case OpKind.I18nStart:
    case OpKind.IcuEnd:
    case OpKind.IcuStart:
    case OpKind.Namespace:
    case OpKind.Pipe:
    case OpKind.Projection:
    case OpKind.ProjectionDef:
    case OpKind.Template:
    case OpKind.Text:
    case OpKind.I18nAttributes:
    case OpKind.IcuPlaceholder:
    case OpKind.DeclareLet:
    case OpKind.SourceLocation:
    case OpKind.ConditionalCreate:
    case OpKind.ConditionalBranchCreate:
      // These operations contain no expressions.
      break;
    default:
      throw new Error(`AssertionError: transformExpressionsInOp doesn't handle ${OpKind[op.kind]}`);
  }
}
/**
 * Transform all `Expression`s in the AST of `expr` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInExpression(expr, transform, flags) {
  if (expr instanceof ExpressionBase) {
    expr.transformInternalExpressions(transform, flags);
  } else if (expr instanceof o.BinaryOperatorExpr) {
    expr.lhs = transformExpressionsInExpression(expr.lhs, transform, flags);
    expr.rhs = transformExpressionsInExpression(expr.rhs, transform, flags);
  } else if (expr instanceof o.UnaryOperatorExpr) {
    expr.expr = transformExpressionsInExpression(expr.expr, transform, flags);
  } else if (expr instanceof o.ReadPropExpr) {
    expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
  } else if (expr instanceof o.ReadKeyExpr) {
    expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
    expr.index = transformExpressionsInExpression(expr.index, transform, flags);
  } else if (expr instanceof o.InvokeFunctionExpr) {
    expr.fn = transformExpressionsInExpression(expr.fn, transform, flags);
    for (let i = 0; i < expr.args.length; i++) {
      expr.args[i] = transformExpressionsInExpression(expr.args[i], transform, flags);
    }
  } else if (expr instanceof o.LiteralArrayExpr) {
    for (let i = 0; i < expr.entries.length; i++) {
      expr.entries[i] = transformExpressionsInExpression(expr.entries[i], transform, flags);
    }
  } else if (expr instanceof o.LiteralMapExpr) {
    for (let i = 0; i < expr.entries.length; i++) {
      expr.entries[i].value = transformExpressionsInExpression(
        expr.entries[i].value,
        transform,
        flags,
      );
    }
  } else if (expr instanceof o.ConditionalExpr) {
    expr.condition = transformExpressionsInExpression(expr.condition, transform, flags);
    expr.trueCase = transformExpressionsInExpression(expr.trueCase, transform, flags);
    if (expr.falseCase !== null) {
      expr.falseCase = transformExpressionsInExpression(expr.falseCase, transform, flags);
    }
  } else if (expr instanceof o.TypeofExpr) {
    expr.expr = transformExpressionsInExpression(expr.expr, transform, flags);
  } else if (expr instanceof o.VoidExpr) {
    expr.expr = transformExpressionsInExpression(expr.expr, transform, flags);
  } else if (expr instanceof o.LocalizedString) {
    for (let i = 0; i < expr.expressions.length; i++) {
      expr.expressions[i] = transformExpressionsInExpression(expr.expressions[i], transform, flags);
    }
  } else if (expr instanceof o.NotExpr) {
    expr.condition = transformExpressionsInExpression(expr.condition, transform, flags);
  } else if (expr instanceof o.TaggedTemplateLiteralExpr) {
    expr.tag = transformExpressionsInExpression(expr.tag, transform, flags);
    expr.template.expressions = expr.template.expressions.map((e) =>
      transformExpressionsInExpression(e, transform, flags),
    );
  } else if (expr instanceof o.ArrowFunctionExpr) {
    if (Array.isArray(expr.body)) {
      for (let i = 0; i < expr.body.length; i++) {
        transformExpressionsInStatement(expr.body[i], transform, flags);
      }
    } else {
      expr.body = transformExpressionsInExpression(expr.body, transform, flags);
    }
  } else if (expr instanceof o.WrappedNodeExpr) {
    // TODO: Do we need to transform any TS nodes nested inside of this expression?
  } else if (expr instanceof o.TemplateLiteralExpr) {
    for (let i = 0; i < expr.expressions.length; i++) {
      expr.expressions[i] = transformExpressionsInExpression(expr.expressions[i], transform, flags);
    }
  } else if (expr instanceof o.ParenthesizedExpr) {
    expr.expr = transformExpressionsInExpression(expr.expr, transform, flags);
  } else if (
    expr instanceof o.ReadVarExpr ||
    expr instanceof o.ExternalExpr ||
    expr instanceof o.LiteralExpr ||
    expr instanceof o.RegularExpressionLiteral
  ) {
    // No action for these types.
  } else {
    throw new Error(`Unhandled expression kind: ${expr.constructor.name}`);
  }
  return transform(expr, flags);
}
/**
 * Transform all `Expression`s in the AST of `stmt` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInStatement(stmt, transform, flags) {
  if (stmt instanceof o.ExpressionStatement) {
    stmt.expr = transformExpressionsInExpression(stmt.expr, transform, flags);
  } else if (stmt instanceof o.ReturnStatement) {
    stmt.value = transformExpressionsInExpression(stmt.value, transform, flags);
  } else if (stmt instanceof o.DeclareVarStmt) {
    if (stmt.value !== undefined) {
      stmt.value = transformExpressionsInExpression(stmt.value, transform, flags);
    }
  } else if (stmt instanceof o.IfStmt) {
    stmt.condition = transformExpressionsInExpression(stmt.condition, transform, flags);
    for (const caseStatement of stmt.trueCase) {
      transformExpressionsInStatement(caseStatement, transform, flags);
    }
    for (const caseStatement of stmt.falseCase) {
      transformExpressionsInStatement(caseStatement, transform, flags);
    }
  } else {
    throw new Error(`Unhandled statement kind: ${stmt.constructor.name}`);
  }
}
/**
 * Checks whether the given expression is a string literal.
 */
export function isStringLiteral(expr) {
  return expr instanceof o.LiteralExpr && typeof expr.value === 'string';
}
//# sourceMappingURL=expression.js.map
