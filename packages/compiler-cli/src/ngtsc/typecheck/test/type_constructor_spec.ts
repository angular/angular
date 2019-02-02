/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, ReferenceEmitter} from '../../imports';
import {LogicalFileSystem} from '../../path';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {getRootDirs} from '../../util/src/typescript';
import {TypeCheckContext} from '../src/context';
import {TypeCheckProgramHost} from '../src/host';

const LIB_D_TS = {
  name: 'lib.d.ts',
  contents: `
    type Partial<T> = { [P in keyof T]?: T[P]; };
    type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
    type NonNullable<T> = T extends null | undefined ? never : T;`
};

describe('ngtsc typechecking', () => {
  describe('ctors', () => {
    it('compiles a basic type constructor', () => {
      const files = [
        LIB_D_TS, {
          name: 'main.ts',
          contents: `
class TestClass<T extends string> {
  value: T;
}

TestClass.ngTypeCtor({value: 'test'});
        `
        }
      ];
      const {program, host, options} = makeProgram(files, undefined, undefined, false);
      const checker = program.getTypeChecker();
      const logicalFs = new LogicalFileSystem(getRootDirs(host, options));
      const emitter = new ReferenceEmitter([
        new LocalIdentifierStrategy(),
        new AbsoluteModuleStrategy(program, checker, options, host),
        new LogicalProjectStrategy(checker, logicalFs),
      ]);
      const ctx = new TypeCheckContext(emitter);
      const TestClass = getDeclaration(program, 'main.ts', 'TestClass', ts.isClassDeclaration);
      ctx.addTypeCtor(program.getSourceFile('main.ts') !, TestClass, {
        fnName: 'ngTypeCtor',
        body: true,
        fields: {
          inputs: ['value'],
          outputs: [],
          queries: [],
        },
      });
      const augHost = new TypeCheckProgramHost(program, host, ctx);
      makeProgram(files, undefined, augHost, true);
    });
  });
});
