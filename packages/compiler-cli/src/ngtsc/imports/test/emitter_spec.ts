/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ExternalExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {LogicalFileSystem, absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {Declaration, TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {LogicalProjectStrategy} from '../src/emitter';
import {Reference} from '../src/references';

runInEachFileSystem(() => {
  describe('LogicalProjectStrategy', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => _ = absoluteFrom);

    it('should enumerate exports with the ReflectionHost', () => {
      // Use a modified ReflectionHost that prefixes all export names that it enumerates.
      class TestHost extends TypeScriptReflectionHost {
        getExportsOfModule(node: ts.Node): Map<string, Declaration>|null {
          const realExports = super.getExportsOfModule(node);
          if (realExports === null) {
            return null;
          }
          const fakeExports = new Map<string, Declaration>();
          realExports.forEach((decl, name) => { fakeExports.set(`test${name}`, decl); });
          return fakeExports;
        }
      }

      const {program} = makeProgram([
        {
          name: _('/index.ts'),
          contents: `export class Foo {}`,
        },
        {
          name: _('/context.ts'),
          contents: 'export class Context {}',
        }
      ]);
      const checker = program.getTypeChecker();
      const logicalFs = new LogicalFileSystem([_('/')]);
      const strategy = new LogicalProjectStrategy(new TestHost(checker), logicalFs);
      const decl = getDeclaration(program, _('/index.ts'), 'Foo', ts.isClassDeclaration);
      const context = program.getSourceFile(_('/context.ts')) !;
      const ref = strategy.emit(new Reference(decl), context);
      expect(ref).not.toBeNull();

      // Expect the prefixed name from the TestHost.
      expect((ref !as ExternalExpr).value.name).toEqual('testFoo');
    });
  });
});
