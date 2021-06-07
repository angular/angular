/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, Lexer, Parser, RecursiveAstVisitor} from '@angular/compiler';
import {ImplicitReceiver, MethodCall, PropertyRead} from '@angular/compiler/src/compiler';

describe('RecursiveAstVisitor', () => {
  it('should visit every node', () => {
    const parser = new Parser(new Lexer());
    const ast = parser.parseBinding('x.y()', '', 0 /* absoluteOffset */);
    const visitor = new Visitor();
    const path: AST[] = [];
    visitor.visit(ast.ast, path);
    // If the visitor method of RecursiveAstVisitor is implemented correctly,
    // then we should have collected the full path from root to leaf.
    expect(path.length).toBe(3);
    const [methodCall, propertyRead, implicitReceiver] = path;
    expectType(methodCall, MethodCall);
    expectType(propertyRead, PropertyRead);
    expectType(implicitReceiver, ImplicitReceiver);
    expect(methodCall.name).toBe('y');
    expect(methodCall.args).toEqual([]);
    expect(propertyRead.name).toBe('x');
  });
});

class Visitor extends RecursiveAstVisitor {
  override visit(node: AST, path: AST[]) {
    path.push(node);
    node.visit(this, path);
  }
}

type Newable = new (...args: any) => any;
function expectType<T extends Newable>(val: any, t: T): asserts val is InstanceType<T> {
  expect(val instanceof t).toBe(true, `expect ${val.constructor.name} to be ${t.name}`);
}
