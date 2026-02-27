/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TmplAstBoundAttribute, TmplAstDirective, TmplAstTemplate} from '@angular/compiler';
import ts from 'typescript';
import {tsCallMethod, tsDeclareVariable} from '../ts_util';
import {addParseSpanInfo} from '../diagnostics';
import {TcbOp} from './base';
import type {Context} from './context';
import type {Scope} from './scope';
import {TcbDirectiveMetadata} from '../../api';
import {Reference} from '../../../imports';
import {ClassDeclaration} from '../../../reflection';
import {markIgnoreDiagnostics} from '../comments';
import {tcbExpression} from './expression';

/**
 * A `TcbOp` which generates a variable for a `TmplAstTemplate`'s context.
 *
 * Executing this operation returns a reference to the template's context variable.
 */
export class TcbTemplateContextOp extends TcbOp {
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
 * A `TcbOp` which descends into a `TmplAstTemplate`'s children and generates type-checking code for
 * them.
 *
 * This operation wraps the children's type-checking code in an `if` block, which may include one
 * or more type guard conditions that narrow types within the template body.
 */
export class TcbTemplateBodyOp extends TcbOp {
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
    const tmplScope = this.scope.createChildScope(
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
    directives: TcbDirectiveMetadata[] | null,
  ) {
    if (directives === null || directives.length === 0) {
      return;
    }

    const isTemplate = hostNode instanceof TmplAstTemplate;

    for (const dir of directives) {
      const dirInstId = this.scope.resolve(hostNode, dir);
      const dirId = this.tcb.env.referenceTcbValue(dir.ref);

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
          markIgnoreDiagnostics(guardInvoke);
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
