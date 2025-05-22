/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import {Identifiers} from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
import {ViewCompilationUnit, type CompilationJob, type CompilationUnit} from '../compilation';
import * as ng from '../instruction';

/**
 * Map of target resolvers for event listeners.
 */
const GLOBAL_TARGET_RESOLVERS = new Map<string, o.ExternalReference>([
  ['window', Identifiers.resolveWindow],
  ['document', Identifiers.resolveDocument],
  ['body', Identifiers.resolveBody],
]);

/**
 * Compiles semantic operations across all views and generates output `o.Statement`s with actual
 * runtime calls in their place.
 *
 * Reification replaces semantic operations with selected Ivy instructions and other generated code
 * structures. After reification, the create/update operation lists of all views should only contain
 * `ir.StatementOp`s (which wrap generated `o.Statement`s).
 */
export function reify(job: CompilationJob): void {
  for (const unit of job.units) {
    reifyCreateOperations(unit, unit.create);
    reifyUpdateOperations(unit, unit.update);
  }
}

/**
 * This function can be used a sanity check -- it walks every expression in the const pool, and
 * every expression reachable from an op, and makes sure that there are no IR expressions
 * left. This is nice to use for debugging mysterious failures where an IR expression cannot be
 * output from the output AST code.
 */
function ensureNoIrForDebug(job: CompilationJob) {
  for (const stmt of job.pool.statements) {
    ir.transformExpressionsInStatement(
      stmt,
      (expr) => {
        if (ir.isIrExpression(expr)) {
          throw new Error(
            `AssertionError: IR expression found during reify: ${ir.ExpressionKind[expr.kind]}`,
          );
        }
        return expr;
      },
      ir.VisitorContextFlag.None,
    );
  }
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      ir.visitExpressionsInOp(op, (expr) => {
        if (ir.isIrExpression(expr)) {
          throw new Error(
            `AssertionError: IR expression found during reify: ${ir.ExpressionKind[expr.kind]}`,
          );
        }
      });
    }
  }
}

function reifyCreateOperations(unit: CompilationUnit, ops: ir.OpList<ir.CreateOp>): void {
  for (const op of ops) {
    ir.transformExpressionsInOp(op, reifyIrExpression, ir.VisitorContextFlag.None);

    switch (op.kind) {
      case ir.OpKind.Text:
        ir.OpList.replace(op, ng.text(op.handle.slot!, op.initialValue, op.sourceSpan));
        break;
      case ir.OpKind.ElementStart:
        ir.OpList.replace(
          op,
          ng.elementStart(
            op.handle.slot!,
            op.tag!,
            op.attributes as number | null,
            op.localRefs as number | null,
            op.startSourceSpan,
          ),
        );
        break;
      case ir.OpKind.Element:
        ir.OpList.replace(
          op,
          ng.element(
            op.handle.slot!,
            op.tag!,
            op.attributes as number | null,
            op.localRefs as number | null,
            op.wholeSourceSpan,
          ),
        );
        break;
      case ir.OpKind.ElementEnd:
        ir.OpList.replace(op, ng.elementEnd(op.sourceSpan));
        break;
      case ir.OpKind.ContainerStart:
        ir.OpList.replace(
          op,
          ng.elementContainerStart(
            op.handle.slot!,
            op.attributes as number | null,
            op.localRefs as number | null,
            op.startSourceSpan,
          ),
        );
        break;
      case ir.OpKind.Container:
        ir.OpList.replace(
          op,
          ng.elementContainer(
            op.handle.slot!,
            op.attributes as number | null,
            op.localRefs as number | null,
            op.wholeSourceSpan,
          ),
        );
        break;
      case ir.OpKind.ContainerEnd:
        ir.OpList.replace(op, ng.elementContainerEnd());
        break;
      case ir.OpKind.I18nStart:
        ir.OpList.replace(
          op,
          ng.i18nStart(op.handle.slot!, op.messageIndex!, op.subTemplateIndex!, op.sourceSpan),
        );
        break;
      case ir.OpKind.I18nEnd:
        ir.OpList.replace(op, ng.i18nEnd(op.sourceSpan));
        break;
      case ir.OpKind.I18n:
        ir.OpList.replace(
          op,
          ng.i18n(op.handle.slot!, op.messageIndex!, op.subTemplateIndex!, op.sourceSpan),
        );
        break;
      case ir.OpKind.I18nAttributes:
        if (op.i18nAttributesConfig === null) {
          throw new Error(`AssertionError: i18nAttributesConfig was not set`);
        }
        ir.OpList.replace(op, ng.i18nAttributes(op.handle.slot!, op.i18nAttributesConfig));
        break;
      case ir.OpKind.Template:
        if (!(unit instanceof ViewCompilationUnit)) {
          throw new Error(`AssertionError: must be compiling a component`);
        }
        if (Array.isArray(op.localRefs)) {
          throw new Error(
            `AssertionError: local refs array should have been extracted into a constant`,
          );
        }
        const childView = unit.job.views.get(op.xref)!;
        ir.OpList.replace(
          op,
          ng.template(
            op.handle.slot!,
            o.variable(childView.fnName!),
            childView.decls!,
            childView.vars!,
            op.tag,
            op.attributes,
            op.localRefs,
            op.startSourceSpan,
          ),
        );
        break;
      case ir.OpKind.DisableBindings:
        ir.OpList.replace(op, ng.disableBindings());
        break;
      case ir.OpKind.EnableBindings:
        ir.OpList.replace(op, ng.enableBindings());
        break;
      case ir.OpKind.Pipe:
        ir.OpList.replace(op, ng.pipe(op.handle.slot!, op.name));
        break;
      case ir.OpKind.DeclareLet:
        ir.OpList.replace(op, ng.declareLet(op.handle.slot!, op.sourceSpan));
        break;
      case ir.OpKind.Listener:
        const listenerFn = reifyListenerHandler(
          unit,
          op.handlerFnName!,
          op.handlerOps,
          op.consumesDollarEvent,
        );
        const eventTargetResolver = op.eventTarget
          ? GLOBAL_TARGET_RESOLVERS.get(op.eventTarget)
          : null;
        if (eventTargetResolver === undefined) {
          throw new Error(
            `Unexpected global target '${op.eventTarget}' defined for '${op.name}' event. Supported list of global targets: window,document,body.`,
          );
        }
        ir.OpList.replace(
          op,
          ng.listener(
            op.name,
            listenerFn,
            eventTargetResolver,
            op.hostListener && op.isAnimationListener,
            op.sourceSpan,
          ),
        );
        break;
      case ir.OpKind.TwoWayListener:
        ir.OpList.replace(
          op,
          ng.twoWayListener(
            op.name,
            reifyListenerHandler(unit, op.handlerFnName!, op.handlerOps, true),
            op.sourceSpan,
          ),
        );
        break;
      case ir.OpKind.Variable:
        if (op.variable.name === null) {
          throw new Error(`AssertionError: unnamed variable ${op.xref}`);
        }
        ir.OpList.replace<ir.CreateOp>(
          op,
          ir.createStatementOp(
            new o.DeclareVarStmt(op.variable.name, op.initializer, undefined, o.StmtModifier.Final),
          ),
        );
        break;
      case ir.OpKind.Namespace:
        switch (op.active) {
          case ir.Namespace.HTML:
            ir.OpList.replace<ir.CreateOp>(op, ng.namespaceHTML());
            break;
          case ir.Namespace.SVG:
            ir.OpList.replace<ir.CreateOp>(op, ng.namespaceSVG());
            break;
          case ir.Namespace.Math:
            ir.OpList.replace<ir.CreateOp>(op, ng.namespaceMath());
            break;
        }
        break;
      case ir.OpKind.Defer:
        const timerScheduling =
          !!op.loadingMinimumTime || !!op.loadingAfterTime || !!op.placeholderMinimumTime;
        ir.OpList.replace(
          op,
          ng.defer(
            op.handle.slot!,
            op.mainSlot.slot!,
            op.resolverFn,
            op.loadingSlot?.slot ?? null,
            op.placeholderSlot?.slot! ?? null,
            op.errorSlot?.slot ?? null,
            op.loadingConfig,
            op.placeholderConfig,
            timerScheduling,
            op.sourceSpan,
            op.flags,
          ),
        );
        break;
      case ir.OpKind.DeferOn:
        let args: number[] = [];
        switch (op.trigger.kind) {
          case ir.DeferTriggerKind.Never:
          case ir.DeferTriggerKind.Idle:
          case ir.DeferTriggerKind.Immediate:
            break;
          case ir.DeferTriggerKind.Timer:
            args = [op.trigger.delay];
            break;
          case ir.DeferTriggerKind.Interaction:
          case ir.DeferTriggerKind.Hover:
          case ir.DeferTriggerKind.Viewport:
            // `hydrate` triggers don't support targets.
            if (op.modifier === ir.DeferOpModifierKind.HYDRATE) {
              args = [];
            } else {
              if (op.trigger.targetSlot?.slot == null || op.trigger.targetSlotViewSteps === null) {
                throw new Error(
                  `Slot or view steps not set in trigger reification for trigger kind ${op.trigger.kind}`,
                );
              }
              args = [op.trigger.targetSlot.slot];
              if (op.trigger.targetSlotViewSteps !== 0) {
                args.push(op.trigger.targetSlotViewSteps);
              }
            }
            break;
          default:
            throw new Error(
              `AssertionError: Unsupported reification of defer trigger kind ${
                (op.trigger as any).kind
              }`,
            );
        }
        ir.OpList.replace(op, ng.deferOn(op.trigger.kind, args, op.modifier, op.sourceSpan));
        break;
      case ir.OpKind.ProjectionDef:
        ir.OpList.replace<ir.CreateOp>(op, ng.projectionDef(op.def));
        break;
      case ir.OpKind.Projection:
        if (op.handle.slot === null) {
          throw new Error('No slot was assigned for project instruction');
        }
        let fallbackViewFnName: string | null = null;
        let fallbackDecls: number | null = null;
        let fallbackVars: number | null = null;
        if (op.fallbackView !== null) {
          if (!(unit instanceof ViewCompilationUnit)) {
            throw new Error(`AssertionError: must be compiling a component`);
          }
          const fallbackView = unit.job.views.get(op.fallbackView);
          if (fallbackView === undefined) {
            throw new Error(
              'AssertionError: projection had fallback view xref, but fallback view was not found',
            );
          }
          if (
            fallbackView.fnName === null ||
            fallbackView.decls === null ||
            fallbackView.vars === null
          ) {
            throw new Error(
              `AssertionError: expected projection fallback view to have been named and counted`,
            );
          }
          fallbackViewFnName = fallbackView.fnName;
          fallbackDecls = fallbackView.decls;
          fallbackVars = fallbackView.vars;
        }
        ir.OpList.replace<ir.CreateOp>(
          op,
          ng.projection(
            op.handle.slot!,
            op.projectionSlotIndex,
            op.attributes,
            fallbackViewFnName,
            fallbackDecls,
            fallbackVars,
            op.sourceSpan,
          ),
        );
        break;
      case ir.OpKind.ConditionalCreate:
        if (!(unit instanceof ViewCompilationUnit)) {
          throw new Error(`AssertionError: must be compiling a component`);
        }
        if (Array.isArray(op.localRefs)) {
          throw new Error(
            `AssertionError: local refs array should have been extracted into a constant`,
          );
        }
        const conditionalCreateChildView = unit.job.views.get(op.xref)!;
        ir.OpList.replace(
          op,
          ng.conditionalCreate(
            op.handle.slot!,
            o.variable(conditionalCreateChildView.fnName!),
            conditionalCreateChildView.decls!,
            conditionalCreateChildView.vars!,
            op.tag,
            op.attributes,
            op.localRefs,
            op.startSourceSpan,
          ),
        );
        break;
      case ir.OpKind.ConditionalBranchCreate:
        if (!(unit instanceof ViewCompilationUnit)) {
          throw new Error(`AssertionError: must be compiling a component`);
        }
        if (Array.isArray(op.localRefs)) {
          throw new Error(
            `AssertionError: local refs array should have been extracted into a constant`,
          );
        }
        const conditionalBranchCreateChildView = unit.job.views.get(op.xref)!;
        ir.OpList.replace(
          op,
          ng.conditionalBranchCreate(
            op.handle.slot!,
            o.variable(conditionalBranchCreateChildView.fnName!),
            conditionalBranchCreateChildView.decls!,
            conditionalBranchCreateChildView.vars!,
            op.tag,
            op.attributes,
            op.localRefs,
            op.startSourceSpan,
          ),
        );
        break;
      case ir.OpKind.RepeaterCreate:
        if (op.handle.slot === null) {
          throw new Error('No slot was assigned for repeater instruction');
        }
        if (!(unit instanceof ViewCompilationUnit)) {
          throw new Error(`AssertionError: must be compiling a component`);
        }
        const repeaterView = unit.job.views.get(op.xref)!;
        if (repeaterView.fnName === null) {
          throw new Error(`AssertionError: expected repeater primary view to have been named`);
        }

        let emptyViewFnName: string | null = null;
        let emptyDecls: number | null = null;
        let emptyVars: number | null = null;
        if (op.emptyView !== null) {
          const emptyView = unit.job.views.get(op.emptyView);
          if (emptyView === undefined) {
            throw new Error(
              'AssertionError: repeater had empty view xref, but empty view was not found',
            );
          }
          if (emptyView.fnName === null || emptyView.decls === null || emptyView.vars === null) {
            throw new Error(
              `AssertionError: expected repeater empty view to have been named and counted`,
            );
          }
          emptyViewFnName = emptyView.fnName;
          emptyDecls = emptyView.decls;
          emptyVars = emptyView.vars;
        }

        ir.OpList.replace(
          op,
          ng.repeaterCreate(
            op.handle.slot,
            repeaterView.fnName,
            op.decls!,
            op.vars!,
            op.tag,
            op.attributes,
            reifyTrackBy(unit, op),
            op.usesComponentInstance,
            emptyViewFnName,
            emptyDecls,
            emptyVars,
            op.emptyTag,
            op.emptyAttributes,
            op.wholeSourceSpan,
          ),
        );
        break;
      case ir.OpKind.SourceLocation:
        const locationsLiteral = o.literalArr(
          op.locations.map(({targetSlot, offset, line, column}) => {
            if (targetSlot.slot === null) {
              throw new Error('No slot was assigned for source location');
            }
            return o.literalArr([
              o.literal(targetSlot.slot),
              o.literal(offset),
              o.literal(line),
              o.literal(column),
            ]);
          }),
        );

        ir.OpList.replace(op, ng.attachSourceLocation(op.templatePath, locationsLiteral));
        break;
      case ir.OpKind.Statement:
        // Pass statement operations directly through.
        break;
      default:
        throw new Error(
          `AssertionError: Unsupported reification of create op ${ir.OpKind[op.kind]}`,
        );
    }
  }
}

function reifyUpdateOperations(_unit: CompilationUnit, ops: ir.OpList<ir.UpdateOp>): void {
  for (const op of ops) {
    ir.transformExpressionsInOp(op, reifyIrExpression, ir.VisitorContextFlag.None);

    switch (op.kind) {
      case ir.OpKind.Advance:
        ir.OpList.replace(op, ng.advance(op.delta, op.sourceSpan));
        break;
      case ir.OpKind.Property:
        if (op.expression instanceof ir.Interpolation) {
          ir.OpList.replace(
            op,
            ng.propertyInterpolate(
              op.name,
              op.expression.strings,
              op.expression.expressions,
              op.sanitizer,
              op.sourceSpan,
            ),
          );
        } else {
          ir.OpList.replace(op, ng.property(op.name, op.expression, op.sanitizer, op.sourceSpan));
        }
        break;
      case ir.OpKind.TwoWayProperty:
        ir.OpList.replace(
          op,
          ng.twoWayProperty(op.name, op.expression, op.sanitizer, op.sourceSpan),
        );
        break;
      case ir.OpKind.StyleProp:
        ir.OpList.replace(op, ng.styleProp(op.name, op.expression, op.unit, op.sourceSpan));
        break;
      case ir.OpKind.ClassProp:
        ir.OpList.replace(op, ng.classProp(op.name, op.expression, op.sourceSpan));
        break;
      case ir.OpKind.StyleMap:
        if (op.expression instanceof ir.Interpolation) {
          ir.OpList.replace(
            op,
            ng.styleMapInterpolate(op.expression.strings, op.expression.expressions, op.sourceSpan),
          );
        } else {
          ir.OpList.replace(op, ng.styleMap(op.expression, op.sourceSpan));
        }
        break;
      case ir.OpKind.ClassMap:
        if (op.expression instanceof ir.Interpolation) {
          ir.OpList.replace(
            op,
            ng.classMapInterpolate(op.expression.strings, op.expression.expressions, op.sourceSpan),
          );
        } else {
          ir.OpList.replace(op, ng.classMap(op.expression, op.sourceSpan));
        }
        break;
      case ir.OpKind.I18nExpression:
        ir.OpList.replace(op, ng.i18nExp(op.expression, op.sourceSpan));
        break;
      case ir.OpKind.I18nApply:
        ir.OpList.replace(op, ng.i18nApply(op.handle.slot!, op.sourceSpan));
        break;
      case ir.OpKind.InterpolateText:
        ir.OpList.replace(
          op,
          ng.textInterpolate(op.interpolation.strings, op.interpolation.expressions, op.sourceSpan),
        );
        break;
      case ir.OpKind.Attribute:
        ir.OpList.replace(
          op,
          ng.attribute(op.name, op.expression, op.sanitizer, op.namespace, op.sourceSpan),
        );
        break;
      case ir.OpKind.DomProperty:
        if (op.expression instanceof ir.Interpolation) {
          throw new Error('not yet handled');
        } else {
          if (op.isAnimationTrigger) {
            ir.OpList.replace(op, ng.syntheticHostProperty(op.name, op.expression, op.sourceSpan));
          } else {
            ir.OpList.replace(
              op,
              ng.domProperty(op.name, op.expression, op.sanitizer, op.sourceSpan),
            );
          }
        }
        break;
      case ir.OpKind.Variable:
        if (op.variable.name === null) {
          throw new Error(`AssertionError: unnamed variable ${op.xref}`);
        }
        ir.OpList.replace<ir.UpdateOp>(
          op,
          ir.createStatementOp(
            new o.DeclareVarStmt(op.variable.name, op.initializer, undefined, o.StmtModifier.Final),
          ),
        );
        break;
      case ir.OpKind.Conditional:
        if (op.processed === null) {
          throw new Error(`Conditional test was not set.`);
        }
        ir.OpList.replace(op, ng.conditional(op.processed, op.contextValue, op.sourceSpan));
        break;
      case ir.OpKind.Repeater:
        ir.OpList.replace(op, ng.repeater(op.collection, op.sourceSpan));
        break;
      case ir.OpKind.DeferWhen:
        ir.OpList.replace(op, ng.deferWhen(op.modifier, op.expr, op.sourceSpan));
        break;
      case ir.OpKind.StoreLet:
        throw new Error(`AssertionError: unexpected storeLet ${op.declaredName}`);
      case ir.OpKind.Statement:
        // Pass statement operations directly through.
        break;
      default:
        throw new Error(
          `AssertionError: Unsupported reification of update op ${ir.OpKind[op.kind]}`,
        );
    }
  }
}

function reifyIrExpression(expr: o.Expression): o.Expression {
  if (!ir.isIrExpression(expr)) {
    return expr;
  }

  switch (expr.kind) {
    case ir.ExpressionKind.NextContext:
      return ng.nextContext(expr.steps);
    case ir.ExpressionKind.Reference:
      return ng.reference(expr.targetSlot.slot! + 1 + expr.offset);
    case ir.ExpressionKind.LexicalRead:
      throw new Error(`AssertionError: unresolved LexicalRead of ${expr.name}`);
    case ir.ExpressionKind.TwoWayBindingSet:
      throw new Error(`AssertionError: unresolved TwoWayBindingSet`);
    case ir.ExpressionKind.RestoreView:
      if (typeof expr.view === 'number') {
        throw new Error(`AssertionError: unresolved RestoreView`);
      }
      return ng.restoreView(expr.view);
    case ir.ExpressionKind.ResetView:
      return ng.resetView(expr.expr);
    case ir.ExpressionKind.GetCurrentView:
      return ng.getCurrentView();
    case ir.ExpressionKind.ReadVariable:
      if (expr.name === null) {
        throw new Error(`Read of unnamed variable ${expr.xref}`);
      }
      return o.variable(expr.name);
    case ir.ExpressionKind.ReadTemporaryExpr:
      if (expr.name === null) {
        throw new Error(`Read of unnamed temporary ${expr.xref}`);
      }
      return o.variable(expr.name);
    case ir.ExpressionKind.AssignTemporaryExpr:
      if (expr.name === null) {
        throw new Error(`Assign of unnamed temporary ${expr.xref}`);
      }
      return o.variable(expr.name).set(expr.expr);
    case ir.ExpressionKind.PureFunctionExpr:
      if (expr.fn === null) {
        throw new Error(`AssertionError: expected PureFunctions to have been extracted`);
      }
      return ng.pureFunction(expr.varOffset!, expr.fn, expr.args);
    case ir.ExpressionKind.PureFunctionParameterExpr:
      throw new Error(`AssertionError: expected PureFunctionParameterExpr to have been extracted`);
    case ir.ExpressionKind.PipeBinding:
      return ng.pipeBind(expr.targetSlot.slot!, expr.varOffset!, expr.args);
    case ir.ExpressionKind.PipeBindingVariadic:
      return ng.pipeBindV(expr.targetSlot.slot!, expr.varOffset!, expr.args);
    case ir.ExpressionKind.SlotLiteralExpr:
      return o.literal(expr.slot.slot!);
    case ir.ExpressionKind.ContextLetReference:
      return ng.readContextLet(expr.targetSlot.slot!);
    case ir.ExpressionKind.StoreLet:
      return ng.storeLet(expr.value, expr.sourceSpan);
    case ir.ExpressionKind.TrackContext:
      return o.variable('this');
    default:
      throw new Error(
        `AssertionError: Unsupported reification of ir.Expression kind: ${
          ir.ExpressionKind[(expr as ir.Expression).kind]
        }`,
      );
  }
}

/**
 * Listeners get turned into a function expression, which may or may not have the `$event`
 * parameter defined.
 */
function reifyListenerHandler(
  unit: CompilationUnit,
  name: string,
  handlerOps: ir.OpList<ir.UpdateOp>,
  consumesDollarEvent: boolean,
): o.FunctionExpr {
  // First, reify all instruction calls within `handlerOps`.
  reifyUpdateOperations(unit, handlerOps);

  // Next, extract all the `o.Statement`s from the reified operations. We can expect that at this
  // point, all operations have been converted to statements.
  const handlerStmts: o.Statement[] = [];
  for (const op of handlerOps) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(
        `AssertionError: expected reified statements, but found op ${ir.OpKind[op.kind]}`,
      );
    }
    handlerStmts.push(op.statement);
  }

  // If `$event` is referenced, we need to generate it as a parameter.
  const params: o.FnParam[] = [];
  if (consumesDollarEvent) {
    // We need the `$event` parameter.
    params.push(new o.FnParam('$event'));
  }

  return o.fn(params, handlerStmts, undefined, undefined, name);
}

/** Reifies the tracking expression of a `RepeaterCreateOp`. */
function reifyTrackBy(unit: CompilationUnit, op: ir.RepeaterCreateOp): o.Expression {
  // If the tracking function was created already, there's nothing left to do.
  if (op.trackByFn !== null) {
    return op.trackByFn;
  }

  const params: o.FnParam[] = [new o.FnParam('$index'), new o.FnParam('$item')];
  let fn: o.FunctionExpr | o.ArrowFunctionExpr;

  if (op.trackByOps === null) {
    // If there are no additional ops related to the tracking function, we just need
    // to turn it into a function that returns the result of the expression.
    fn = op.usesComponentInstance
      ? o.fn(params, [new o.ReturnStatement(op.track)])
      : o.arrowFn(params, op.track);
  } else {
    // Otherwise first we need to reify the track-related ops.
    reifyUpdateOperations(unit, op.trackByOps);

    const statements: o.Statement[] = [];
    for (const trackOp of op.trackByOps) {
      if (trackOp.kind !== ir.OpKind.Statement) {
        throw new Error(
          `AssertionError: expected reified statements, but found op ${ir.OpKind[trackOp.kind]}`,
        );
      }
      statements.push(trackOp.statement);
    }

    // Afterwards we can create the function from those ops.
    fn =
      op.usesComponentInstance ||
      statements.length !== 1 ||
      !(statements[0] instanceof o.ReturnStatement)
        ? o.fn(params, statements)
        : o.arrowFn(params, statements[0].value);
  }

  op.trackByFn = unit.job.pool.getSharedFunctionReference(fn, '_forTrack');
  return op.trackByFn;
}
