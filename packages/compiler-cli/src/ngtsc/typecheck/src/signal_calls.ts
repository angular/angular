/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AST,
  AstVisitor,
  ASTWithSource,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  PrefixNot,
  PropertyRead,
  PropertyWrite,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  ThisReceiver,
  Unary,
} from '@angular/compiler';

/**
 * The types of nodes potentially corresponding with a signal call in a template. Any call
 * expression without arguments is potentially a signal call, as signal calls cannot be
 * differentiated from regular method calls syntactically.
 */
export type PotentialSignalCall = (Call | SafeCall) & {args: []};

/**
 * Tests whether the given call expression may correspond with a signal call.
 */
export function isPotentialSignalCall(ast: Call | SafeCall): ast is PotentialSignalCall {
  return ast.args.length === 0;
}

/**
 * Represents a string that identifies a call expression that may represent a signal call.
 */
export type SignalCallIdentity = string & {__brand: 'SignalCallIdentity'};

/**
 * Computes the string identity of the provided call expression. Any expression that is witnessed
 * when evaluating the call expression is included in the identity. For implicit reads (e.g.
 * property accesses with `ImplicitReceiver` as receiver) an external identity is requested, to
 * ensure that each local template variable is assigned its own unique identifier. This is important
 * for scenarios like
 *
 * ```
 * @Component({
 *   template: `
 *   @if (persons[selectedPerson](); as selectedPerson) {
 *     {{ persons[selectedPerson]() }}
 *   }`
 * })
 * export class ShadowCmp {
 *   persons = {
 *     admin: signal('admin');
 *     guest: signal('guest');
 *   };
 *   selectedPerson: keyof ShadowCmp['persons'];
 * }
 * ```
 *
 * Here, the local alias `selectedPerson` shadows the `ShadowCmp.selectedPerson` field, such that
 * the call expression in the @if's condition expression is not equivalent to the syntactically
 * identical expression within its block. Consequently, different identities have to be computed for
 * both call expressions, which is achieved by letting `identifyImplicitRead` resolve any implicit
 * accesses to a unique identifier for local template variables.
 *
 * @param call The call expression to compute the identity for.
 * @param recurse Callback function to compute the identity of nested signal calls.
 * @param identifyImplicitRead Callback function to determine the identity of implicit reads.
 */
export function computeSignalCallIdentity(
  call: PotentialSignalCall,
  recurse: (receiverCall: PotentialSignalCall) => string | null,
  identifyImplicitRead: (expr: AST) => string | null,
): SignalCallIdentity | null {
  return call.receiver.visit(new SignalCallIdentification(recurse, identifyImplicitRead));
}

class SignalCallIdentification implements AstVisitor {
  constructor(
    private recurse: (receiverCall: PotentialSignalCall) => string | null,
    private identifyImplicitRead: (expr: AST) => string | null,
  ) {}

  visitUnary(ast: Unary): string | null {
    const expr = this.forAst(ast.expr);
    if (expr === null) {
      return null;
    }
    return `${ast.operator}${expr}`;
  }

  visitBinary(ast: Binary): string | null {
    const left = this.forAst(ast.left);
    const right = this.forAst(ast.right);
    if (left === null || right === null) {
      return null;
    }
    return `${left}${ast.operation}${right}`;
  }

  visitChain(ast: Chain): string | null {
    return null;
  }

  visitConditional(ast: Conditional): string | null {
    return null;
  }

  visitThisReceiver(ast: ThisReceiver): string | null {
    return 'this';
  }

  visitImplicitReceiver(ast: ImplicitReceiver): string | null {
    return 'this';
  }

  visitInterpolation(ast: Interpolation): string | null {
    return null;
  }

  visitKeyedRead(ast: KeyedRead): string | null {
    const receiver = this.forAst(ast.receiver);
    const key = this.forAst(ast.key);
    if (receiver === null || key === null) {
      return null;
    }
    return `${receiver}[${key}]`;
  }

  visitKeyedWrite(ast: KeyedWrite): string | null {
    return null;
  }

  visitLiteralArray(ast: LiteralArray): string | null {
    return null;
  }

  visitLiteralMap(ast: LiteralMap): string | null {
    return null;
  }

  visitLiteralPrimitive(ast: LiteralPrimitive): string | null {
    return `${ast.value}`;
  }

  visitPipe(ast: BindingPipe): string | null {
    // Don't enable narrowing when pipes are being evaluated.
    return null;
  }

  visitPrefixNot(ast: PrefixNot): string | null {
    const expression = this.forAst(ast.expression);
    if (expression === null) {
      return expression;
    }
    return `!${expression}`;
  }

  visitNonNullAssert(ast: NonNullAssert): string | null {
    return this.forAst(ast.expression);
  }

  visitPropertyRead(ast: PropertyRead): string | null {
    const receiver = this.identifyReceiver(ast);
    if (receiver === null) {
      return null;
    }
    return `${receiver}.${ast.name}`;
  }

  visitPropertyWrite(ast: PropertyWrite): string | null {
    return null;
  }

  visitSafePropertyRead(ast: SafePropertyRead): string | null {
    const receiver = this.identifyReceiver(ast);
    if (receiver === null) {
      return null;
    }
    return `${receiver}?.${ast.name}`;
  }

  visitSafeKeyedRead(ast: SafeKeyedRead): string | null {
    const receiver = this.forAst(ast.receiver);
    if (receiver === null) {
      return null;
    }
    return `${receiver}?.[${this.forAst(ast.key)}]`;
  }

  visitCall(ast: Call): string | null {
    if (ast.args.length > 0) {
      // Don't enable narrowing for complex calls.
      return null;
    }
    const receiver = this.forAst(ast.receiver);
    if (receiver === null) {
      return null;
    }
    return `${receiver}()`;
  }

  visitSafeCall(ast: SafeCall): string | null {
    if (ast.args.length > 0) {
      // Don't enable narrowing for complex calls.
      return null;
    }
    const receiver = this.forAst(ast.receiver);
    if (receiver === null) {
      return null;
    }
    return `${receiver}?.()`;
  }

  visitASTWithSource(ast: ASTWithSource): string | null {
    return this.forAst(ast.ast);
  }

  private identifyReceiver(ast: PropertyRead | SafePropertyRead): string | null {
    const receiver = ast.receiver;
    if (receiver instanceof ImplicitReceiver && !(receiver instanceof ThisReceiver)) {
      const implicitIdentity = this.identifyImplicitRead(ast);
      if (implicitIdentity !== null) {
        return implicitIdentity;
      }
    }
    return this.forAst(receiver);
  }

  private forAst(ast: AST): string | null {
    if ((ast instanceof Call || ast instanceof SafeCall) && isPotentialSignalCall(ast)) {
      const result = this.recurse(ast);
      if (result !== null) {
        return `ɵ${result}`;
      }
    }
    return ast.visit(this);
  }
}
