/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NOOP_INCREMENTAL_BUILD} from '../../incremental';
import {NOOP_PERF_RECORDER} from '../../perf';
import {ClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {makeProgram} from '../../testing';
import {DtsTransformRegistry, TraitCompiler} from '../../transform';
import {DecoratorHandler, HandlerPrecedence} from '../src/api';

runInEachFileSystem(() => {
  describe('TraitCompiler', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => _ = absoluteFrom);

    it('should not run decoration handlers against declaration files', () => {
      const {program} = makeProgram([{
        name: _('/lib.d.ts'),
        contents: `export declare class SomeDirective {}`,
      }]);

      const checker = program.getTypeChecker();
      const reflectionHost = new TypeScriptReflectionHost(checker);
      const fakeDecoratorHandler: DecoratorHandler<{}|null, unknown, unknown> = {
        name: 'FakeDecoratorHandler',
        precedence: HandlerPrecedence.PRIMARY,
        detect: jasmine.createSpy('detect').and.callFake(
            (node: ClassDeclaration) => ({trigger: node, metadata: {}})),
        analyze: jasmine.createSpy('analyze').and.returnValue({}),
        compile: jasmine.createSpy('compile').and.returnValue([])
      };
      const compiler = new TraitCompiler(
          [fakeDecoratorHandler], reflectionHost, NOOP_PERF_RECORDER, NOOP_INCREMENTAL_BUILD, true,
          new DtsTransformRegistry());
      const sourceFile = program.getSourceFile('lib.d.ts') !;
      const analysis = compiler.analyzeSync(sourceFile);

      expect(sourceFile.isDeclarationFile).toBe(true);
      expect(analysis).toBeFalsy();
      expect(fakeDecoratorHandler.detect).not.toHaveBeenCalled();
      expect(fakeDecoratorHandler.analyze).not.toHaveBeenCalled();
      expect(fakeDecoratorHandler.compile).not.toHaveBeenCalled();
    });
  });
});
