/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {makeProgram} from '../../testing/in_memory_typescript';
import {VisitListEntryResult, Visitor, visit} from '../src/visitor';

class TestAstVisitor extends Visitor {
  visitClassDeclaration(node: ts.ClassDeclaration):
      VisitListEntryResult<ts.Statement, ts.ClassDeclaration> {
    const name = node.name !.text;
    const statics =
        node.members.filter(member => (member.modifiers as ReadonlyArray<ts.Modifier>|| [
                                      ]).some(mod => mod.kind === ts.SyntaxKind.StaticKeyword));
    const idStatic = statics
                         .find(
                             el => ts.isPropertyDeclaration(el) && ts.isIdentifier(el.name) &&
                                 el.name.text === 'id') as ts.PropertyDeclaration |
        undefined;
    if (idStatic !== undefined) {
      return {
        node,
        before: [
          ts.createVariableStatement(
              undefined,
              [
                ts.createVariableDeclaration(`${name}_id`, undefined, idStatic.initializer),
              ]),
        ],
      };
    }
    return {node};
  }
}

function testTransformerFactory(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
  return (file: ts.SourceFile) => visit(file, new TestAstVisitor(), context);
}

describe('AST Visitor', () => {
  it('should add a statement before class in plain file', () => {
    const {program, host} =
        makeProgram([{name: 'main.ts', contents: `class A { static id = 3; }`}]);
    const sf = program.getSourceFile('main.ts') !;
    program.emit(sf, undefined, undefined, undefined, {before: [testTransformerFactory]});
    const main = host.readFile('/main.js');
    expect(main).toMatch(/^var A_id = 3;/);
  });

  it('should add a statement before class inside function definition', () => {
    const {program, host} = makeProgram([{
      name: 'main.ts',
      contents: `
      export function foo() {
        var x = 3;
        class A { static id = 2; }
        return A;
      }
    `
    }]);
    const sf = program.getSourceFile('main.ts') !;
    program.emit(sf, undefined, undefined, undefined, {before: [testTransformerFactory]});
    const main = host.readFile('/main.js');
    expect(main).toMatch(/var x = 3;\s+var A_id = 2;\s+var A =/);
  });

  it('handles nested statements', () => {
    const {program, host} = makeProgram([{
      name: 'main.ts',
      contents: `
      export class A {
        static id = 3;

        foo() {
          class B {
            static id = 4;
          }
          return B;
        }
    }`
    }]);
    const sf = program.getSourceFile('main.ts') !;
    program.emit(sf, undefined, undefined, undefined, {before: [testTransformerFactory]});
    const main = host.readFile('/main.js');
    expect(main).toMatch(/var A_id = 3;\s+var A = /);
    expect(main).toMatch(/var B_id = 4;\s+var B = /);
  });
});
