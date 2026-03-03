/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  Binary,
  BindingPipe,
  Call,
  ImplicitReceiver,
  PropertyRead,
  R3Identifiers,
  SafeCall,
  SafePropertyRead,
  TemplateEntity,
  ThisReceiver,
  TmplAstLetDeclaration,
} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import {TcbExpr} from './codegen';
import type {Context} from './context';
import type {Scope} from './scope';
import {astToTcbExpr} from '../expression';
import {Reference} from '../../../imports';
import {ClassDeclaration} from '../../../reflection';

/**
 * Process an `AST` expression and convert it into a `ts.Expression`, generating references to the
 * correct identifiers in the current scope.
 */
export function tcbExpression(ast: AST, tcb: Context, scope: Scope): TcbExpr {
  const translator = new TcbExpressionTranslator(tcb, scope);
  return translator.translate(ast);
}

/**
 * Wraps an expression in an `unwrapSignal` call which extracts the signal's value.
 */
export function unwrapWritableSignal(expression: TcbExpr, tcb: Context): TcbExpr {
  const unwrapRef = tcb.env.referenceExternalSymbol(
    R3Identifiers.unwrapWritableSignal.moduleName,
    R3Identifiers.unwrapWritableSignal.name,
  );
  return new TcbExpr(`${unwrapRef.print()}(${expression.print()})`);
}

/**
 * A `TcbOp` which renders an Angular expression (e.g. `{{foo() && bar.baz}}`).
 *
 * Executing this operation returns nothing.
 */
export class TcbExpressionOp extends TcbOp {
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
    this.scope.addStatement(expr);
    return null;
  }
}

/**
 * A `TcbOp` which renders an Angular expression inside a conditional context.
 * This is used for `@defer` triggers (`when`, `prefetch when`, `hydrate when`)
 * to enable TypeScript's TS2774 diagnostic for uninvoked functions/signals.
 *
 * Executing this operation returns nothing.
 */
export class TcbConditionOp extends TcbOp {
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
    // Wrap in an if-statement to enable TS2774 for uninvoked signals/functions.
    this.scope.addStatement(new TcbExpr(`if (${expr.print()}) {}`));
    return null;
  }
}

export class TcbExpressionTranslator {
  constructor(
    protected tcb: Context,
    protected scope: Scope,
  ) {}

  translate(ast: AST): TcbExpr {
    // `astToTcbExpr` actually does the conversion. A special resolver `tcbResolve` is passed
    // which interprets specific expression nodes that interact with the `ImplicitReceiver`. These
    // nodes actually refer to identifiers within the current scope.
    return astToTcbExpr(ast, (ast) => this.resolve(ast), this.tcb.env.config);
  }

  /**
   * Resolve an `AST` expression within the given scope.
   *
   * Some `AST` expressions refer to top-level concepts (references, variables, the component
   * context). This method assists in resolving those.
   */
  protected resolve(ast: AST): TcbExpr | null {
    if (ast instanceof PropertyRead && ast.receiver instanceof ImplicitReceiver) {
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
          return new TcbExpr(`${targetExpression.print()} as any`);
        }
      }
      return targetExpression;
    } else if (
      ast instanceof Binary &&
      Binary.isAssignmentOperation(ast.operation) &&
      ast.left instanceof PropertyRead &&
      (ast.left.receiver instanceof ImplicitReceiver || ast.left.receiver instanceof ThisReceiver)
    ) {
      const read = ast.left;
      const target = this.tcb.boundTarget.getExpressionTarget(read);
      if (target === null) {
        return null;
      }

      const targetExpression = this.getTargetNodeExpression(target, read);
      const expr = this.translate(ast.right);
      const result = new TcbExpr(`(${targetExpression.print()} = ${expr.print()})`);
      result.addParseSpanInfo(read.sourceSpan);

      // Ignore diagnostics from TS produced for writes to `@let` and re-report them using
      // our own infrastructure. We can't rely on the TS reporting, because it includes
      // the name of the auto-generated TCB variable name.
      if (target instanceof TmplAstLetDeclaration) {
        result.markIgnoreDiagnostics();
        this.tcb.oobRecorder.illegalWriteToLetDeclaration(this.tcb.id, read, target);
      }

      return result;
    } else if (ast instanceof ImplicitReceiver || ast instanceof ThisReceiver) {
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
      return new TcbExpr('this');
    } else if (ast instanceof BindingPipe) {
      const expr = this.translate(ast.exp);
      const pipeMeta = this.tcb.getPipeByName(ast.name);
      let pipe: TcbExpr | null;
      if (pipeMeta === null) {
        // No pipe by that name exists in scope. Record this as an error.
        this.tcb.oobRecorder.missingPipe(this.tcb.id, ast, this.tcb.hostIsStandalone);

        // Use an 'any' value to at least allow the rest of the expression to be checked.
        pipe = new TcbExpr('(0 as any)');
      } else if (
        pipeMeta.isExplicitlyDeferred &&
        this.tcb.boundTarget.getEagerlyUsedPipes().includes(ast.name)
      ) {
        // This pipe was defer-loaded (included into `@Component.deferredImports`),
        // but was used outside of a `@defer` block, which is the error.
        this.tcb.oobRecorder.deferredPipeUsedEagerly(this.tcb.id, ast);

        // Use an 'any' value to at least allow the rest of the expression to be checked.
        pipe = new TcbExpr('(0 as any)');
      } else {
        // Use a variable declared as the pipe's type.
        pipe = this.tcb.env.pipeInst(
          pipeMeta.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>,
        );
      }
      const args = ast.args.map((arg) => this.translate(arg).print());
      let methodAccess = new TcbExpr(`${pipe.print()}.transform`).addParseSpanInfo(ast.nameSpan);

      if (!this.tcb.env.config.checkTypeOfPipes) {
        methodAccess = new TcbExpr(`(${methodAccess.print()} as any)`);
      }

      const result = new TcbExpr(`${methodAccess.print()}(${[expr.print(), ...args].join(', ')})`);
      return result.addParseSpanInfo(ast.sourceSpan);
    } else if (
      (ast instanceof Call || ast instanceof SafeCall) &&
      (ast.receiver instanceof PropertyRead || ast.receiver instanceof SafePropertyRead)
    ) {
      // Resolve the special `$any(expr)` syntax to insert a cast of the argument to type `any`.
      // `$any(expr)` -> `expr as any`
      if (
        ast.receiver.receiver instanceof ImplicitReceiver &&
        ast.receiver.name === '$any' &&
        ast.args.length === 1
      ) {
        const expr = this.translate(ast.args[0]);
        const result = new TcbExpr(`(${expr.print()} as any)`);
        result.addParseSpanInfo(ast.sourceSpan);
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

      const method = this.getTargetNodeExpression(target, ast);
      method.addParseSpanInfo(ast.receiver.nameSpan).wrapForTypeChecker();
      const args = ast.args.map((arg) => this.translate(arg).print());
      const node = new TcbExpr(`${method.print()}(${args.join(', ')})`);
      node.addParseSpanInfo(ast.sourceSpan);
      return node;
    } else {
      // This AST isn't special after all.
      return null;
    }
  }

  private getTargetNodeExpression(targetNode: TemplateEntity, expressionNode: AST): TcbExpr {
    const expr = this.scope.resolve(targetNode);
    expr.addParseSpanInfo(expressionNode.sourceSpan);
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
