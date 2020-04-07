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
import {AnalysisOutput, CompileResult, DecoratorHandler, HandlerPrecedence} from '../src/api';

runInEachFileSystem(() => {
  describe('TraitCompiler', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => _ = absoluteFrom);

    it('should not run decoration handlers against declaration files', () => {
      class FakeDecoratorHandler implements DecoratorHandler<{}|null, unknown, unknown> {
        name = 'FakeDecoratorHandler';
        precedence = HandlerPrecedence.PRIMARY;

        detect(): undefined {
          throw new Error('detect should not have been called');
        }
        analyze(): AnalysisOutput<unknown> {
          throw new Error('analyze should not have been called');
        }
        compile(): CompileResult {
          throw new Error('compile should not have been called');
        }
      }

      const {program} = makeProgram([{
        name: _('/lib.d.ts'),
        contents: `export declare class SomeDirective {}`,
      }]);
      const checker = program.getTypeChecker();
      const reflectionHost = new TypeScriptReflectionHost(checker);
      const compiler = new TraitCompiler(
          [new FakeDecoratorHandler()], reflectionHost, NOOP_PERF_RECORDER, NOOP_INCREMENTAL_BUILD,
          true, new DtsTransformRegistry());
      const sourceFile = program.getSourceFile('lib.d.ts')!;
      const analysis = compiler.analyzeSync(sourceFile);

      expect(sourceFile.isDeclarationFile).toBe(true);
      expect(analysis).toBeFalsy();
    });
  });
});
