/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST, Lexer, Parser, RecursiveAstVisitor} from '../../index';
import {Call, ImplicitReceiver, PropertyRead} from '../../src/compiler';
import {getFakeSpan} from './utils/span';

describe('RecursiveAstVisitor', () => {
  it('should visit every node', () => {
    const parser = new Parser(new Lexer());
    const ast = parser.parseBinding('x.y()', getFakeSpan(), 0 /* absoluteOffset */);
    const visitor = new Visitor();
    const path: AST[] = [];
    visitor.visit(ast.ast, path);
    // If the visitor method of RecursiveAstVisitor is implemented correctly,
    // then we should have collected the full path from root to leaf.
    expect(path.length).toBe(4);
    const [call, yRead, xRead, implicitReceiver] = path;
    expectType(call, Call);
    expectType(yRead, PropertyRead);
    expectType(xRead, PropertyRead);
    expectType(implicitReceiver, ImplicitReceiver);
    expect(xRead.name).toBe('x');
    expect(yRead.name).toBe('y');
    expect(call.args).toEqual([]);
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
  expect(val instanceof t)
    .withContext(`expect ${val.constructor.name} to be ${t.name}`)
    .toBe(true);
}
