/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ErrorCode, makeDiagnostic} from '../../../src/ngtsc/diagnostics';
import {AbsoluteFsPath, absoluteFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, ErroredTrait, HandlerPrecedence, TraitState} from '../../../src/ngtsc/transform';
import {DefaultMigrationHost} from '../../src/analysis/migration_host';
import {AnalyzedClass, AnalyzedFile} from '../../src/analysis/types';
import {NgccClassSymbol} from '../../src/host/ngcc_host';
import {createComponentDecorator} from '../../src/migrations/utils';

runInEachFileSystem(() => {
  describe('DefaultMigrationHost', () => {
    let _: typeof absoluteFrom;
    let entryPointPath: AbsoluteFsPath;
    let mockHost: any;
    let mockMetadata: any = {};
    let mockEvaluator: any = {};
    let mockClazz: any;
    let mockDecorator: any = {name: 'MockDecorator'};
    let diagnosticHandler = () => {};
    beforeEach(() => {
      _ = absoluteFrom;
      entryPointPath = _('/node_modules/some-package/entry-point');
      mockHost = {
        getClassSymbol: (node: any): NgccClassSymbol | undefined => {
          const symbol = { valueDeclaration: node, name: node.name.text } as any;
          return {
            name: node.name.text,
            declaration: symbol,
            implementation: symbol,
          };
        },
      };
      const mockSourceFile: any = {
        fileName: _('/node_modules/some-package/entry-point/test-file.js'),
      };
      mockClazz = {
        name: {text: 'MockClazz'},
        getSourceFile: () => mockSourceFile,
      };
    });

    describe('injectSyntheticDecorator()', () => {
      it('should call `detect()` on each of the provided handlers', () => {
        const log: string[] = [];
        const handler1 = new TestHandler('handler1', log);
        const handler2 = new TestHandler('handler2', log);
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler1, handler2], entryPointPath, []);
        host.injectSyntheticDecorator(mockClazz, mockDecorator);
        expect(log).toEqual([
          `handler1:detect:MockClazz:MockDecorator`,
          `handler2:detect:MockClazz:MockDecorator`,
        ]);
      });

      it('should call `analyze()` on each of the provided handlers whose `detect()` call returns a result',
         () => {
           const log: string[] = [];
           const handler1 = new TestHandler('handler1', log);
           const handler2 = new AlwaysDetectHandler('handler2', log);
           const handler3 = new TestHandler('handler3', log);
           const host = new DefaultMigrationHost(
               mockHost, mockMetadata, mockEvaluator, [handler1, handler2, handler3],
               entryPointPath, []);
           host.injectSyntheticDecorator(mockClazz, mockDecorator);
           expect(log).toEqual([
             `handler1:detect:MockClazz:MockDecorator`,
             `handler2:detect:MockClazz:MockDecorator`,
             `handler3:detect:MockClazz:MockDecorator`,
             'handler2:analyze:MockClazz',
           ]);
         });

      it('should add a newly `AnalyzedFile` to the `analyzedFiles` object', () => {
        const log: string[] = [];
        const handler = new AlwaysDetectHandler('handler', log);
        const analyzedFiles: AnalyzedFile[] = [];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);
        host.injectSyntheticDecorator(mockClazz, mockDecorator);
        expect(analyzedFiles.length).toEqual(1);
        expect(analyzedFiles[0].analyzedClasses.length).toEqual(1);
        expect(analyzedFiles[0].analyzedClasses[0].name).toEqual('MockClazz');
      });

      it('should add a newly `AnalyzedClass` to an existing `AnalyzedFile` object', () => {
        const DUMMY_CLASS_1: any = {};
        const DUMMY_CLASS_2: any = {};
        const log: string[] = [];
        const handler = new AlwaysDetectHandler('handler', log);
        const analyzedFiles: AnalyzedFile[] = [{
          sourceFile: mockClazz.getSourceFile(),
          analyzedClasses: [DUMMY_CLASS_1, DUMMY_CLASS_2],
        }];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);
        host.injectSyntheticDecorator(mockClazz, mockDecorator);
        expect(analyzedFiles.length).toEqual(1);
        expect(analyzedFiles[0].analyzedClasses.length).toEqual(3);
        expect(analyzedFiles[0].analyzedClasses[2].name).toEqual('MockClazz');
      });

      it('should add a new decorator into an already existing `AnalyzedClass`', () => {
        const analyzedClass: AnalyzedClass = {
          name: 'MockClazz',
          declaration: mockClazz,
          traits: [],
          decorators: null,
        };
        const log: string[] = [];
        const handler = new AlwaysDetectHandler('handler', log);
        const analyzedFiles: AnalyzedFile[] = [{
          sourceFile: mockClazz.getSourceFile(),
          analyzedClasses: [analyzedClass],
        }];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);
        host.injectSyntheticDecorator(mockClazz, mockDecorator);
        expect(analyzedFiles.length).toEqual(1);
        expect(analyzedFiles[0].analyzedClasses.length).toEqual(1);
        expect(analyzedFiles[0].analyzedClasses[0]).toBe(analyzedClass);
        expect(analyzedClass.decorators !.length).toEqual(1);
        expect(analyzedClass.decorators ![0].name).toEqual('MockDecorator');
      });

      it('should merge a new decorator into pre-existing decorators an already existing `AnalyzedClass`',
         () => {
           const analyzedClass: AnalyzedClass = {
             name: 'MockClazz',
             declaration: mockClazz,
             traits: [],
             decorators: [{name: 'OtherDecorator'} as Decorator],
           };
           const log: string[] = [];
           const handler = new AlwaysDetectHandler('handler', log);
           const analyzedFiles: AnalyzedFile[] = [{
             sourceFile: mockClazz.getSourceFile(),
             analyzedClasses: [analyzedClass],
           }];
           const host = new DefaultMigrationHost(
               mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);
           host.injectSyntheticDecorator(mockClazz, mockDecorator);
           expect(analyzedFiles.length).toEqual(1);
           expect(analyzedFiles[0].analyzedClasses.length).toEqual(1);
           expect(analyzedFiles[0].analyzedClasses[0]).toBe(analyzedClass);
           expect(analyzedClass.decorators !.length).toEqual(2);
           expect(analyzedClass.decorators ![1].name).toEqual('MockDecorator');
         });

      it('should throw an error if the injected decorator already exists', () => {
        const analyzedClass: AnalyzedClass = {
          name: 'MockClazz',
          declaration: mockClazz,
          traits: [],
          decorators: [{name: 'MockDecorator'} as Decorator],
        };
        const log: string[] = [];
        const handler = new AlwaysDetectHandler('handler', log);
        const analyzedFiles: AnalyzedFile[] = [{
          sourceFile: mockClazz.getSourceFile(),
          analyzedClasses: [analyzedClass],
        }];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);
        expect(() => host.injectSyntheticDecorator(mockClazz, mockDecorator))
            .toThrow(jasmine.objectContaining(
                {code: ErrorCode.NGCC_MIGRATION_DECORATOR_INJECTION_ERROR}));
      });

      it('should report diagnostics from handlers', () => {
        const log: string[] = [];
        const handler = new DiagnosticProducingHandler('handler', log);
        const analyzedFiles: AnalyzedFile[] = [];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);
        mockClazz.getStart = () => 0;
        mockClazz.getWidth = () => 0;

        const decorator = createComponentDecorator(mockClazz, {selector: 'comp', exportAs: null});
        host.injectSyntheticDecorator(mockClazz, decorator);

        expect(analyzedFiles.length).toBe(1);
        expect(analyzedFiles[0].analyzedClasses.length).toBe(1);
        const migratedClass = analyzedFiles[0].analyzedClasses[0];
        expect(migratedClass.traits.length).toBe(1);
        const migratedTrait = migratedClass.traits[0];
        if (migratedTrait.state !== TraitState.ERRORED) {
          return fail('Expected migrated class trait to be in an error state');
        }

        expect(migratedTrait.diagnostics.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(migratedTrait.diagnostics[0].messageText, '\n'))
            .toEqual(
                `test diagnostic\n` +
                `  Occurs for @Component decorator inserted by an automatic migration\n` +
                `  @Component({ template: "", selector: "comp" })`);
      });
    });

    describe('getAllDecorators', () => {
      it('should be null for unknown source files', () => {
        const log: string[] = [];
        const handler = new AlwaysDetectHandler('handler', log);
        const analyzedFiles: AnalyzedFile[] = [];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);

        const decorators = host.getAllDecorators(mockClazz);
        expect(decorators).toBeNull();
      });

      it('should be null for unknown classes', () => {
        const log: string[] = [];
        const handler = new AlwaysDetectHandler('handler', log);
        const analyzedFiles: AnalyzedFile[] = [];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);

        const sourceFile: any = {};
        const unrelatedClass: any = {
          getSourceFile: () => sourceFile,
        };
        analyzedFiles.push({sourceFile, analyzedClasses: [unrelatedClass]});

        const decorators = host.getAllDecorators(mockClazz);
        expect(decorators).toBeNull();
      });

      it('should include injected decorators', () => {
        const log: string[] = [];
        const handler = new AlwaysDetectHandler('handler', log);
        const existingDecorator = { name: 'ExistingDecorator' } as Decorator;
        const analyzedClass: AnalyzedClass = {
          name: 'MockClazz',
          declaration: mockClazz,
          traits: [],
          decorators: [existingDecorator],
        };
        const analyzedFiles: AnalyzedFile[] = [{
          sourceFile: mockClazz.getSourceFile(),
          analyzedClasses: [analyzedClass],
        }];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [handler], entryPointPath, analyzedFiles);
        host.injectSyntheticDecorator(mockClazz, mockDecorator);

        const decorators = host.getAllDecorators(mockClazz) !;
        expect(decorators.length).toBe(2);
        expect(decorators[0]).toBe(existingDecorator);
        expect(decorators[1]).toBe(mockDecorator);
      });
    });

    describe('isInScope', () => {
      it('should be true for nodes within the entry-point', () => {
        const analyzedFiles: AnalyzedFile[] = [];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [], entryPointPath, analyzedFiles);

        const sourceFile: any = {
          fileName: _('/node_modules/some-package/entry-point/relative.js'),
        };
        const clazz: any = {
          getSourceFile: () => sourceFile,
        };
        expect(host.isInScope(clazz)).toBe(true);
      });

      it('should be false for nodes outside the entry-point', () => {
        const analyzedFiles: AnalyzedFile[] = [];
        const host = new DefaultMigrationHost(
            mockHost, mockMetadata, mockEvaluator, [], entryPointPath, analyzedFiles);

        const sourceFile: any = {
          fileName: _('/node_modules/some-package/other-entry/index.js'),
        };
        const clazz: any = {
          getSourceFile: () => sourceFile,
        };
        expect(host.isInScope(clazz)).toBe(false);
      });
    });
  });
});

class TestHandler implements DecoratorHandler<unknown, unknown, unknown> {
  constructor(readonly name: string, protected log: string[]) {}

  precedence = HandlerPrecedence.PRIMARY;
  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
    this.log.push(`${this.name}:detect:${node.name.text}:${decorators !.map(d => d.name)}`);
    return undefined;
  }
  analyze(node: ClassDeclaration): AnalysisOutput<unknown> {
    this.log.push(this.name + ':analyze:' + node.name.text);
    return {};
  }
  compile(node: ClassDeclaration): CompileResult|CompileResult[] {
    this.log.push(this.name + ':compile:' + node.name.text);
    return [];
  }
}

class AlwaysDetectHandler extends TestHandler {
  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<unknown>|undefined {
    super.detect(node, decorators);
    return {trigger: node, metadata: {}};
  }
}

class DiagnosticProducingHandler extends AlwaysDetectHandler {
  analyze(node: ClassDeclaration): AnalysisOutput<any> {
    super.analyze(node);
    return {diagnostics: [makeDiagnostic(9999, node, 'test diagnostic')]};
  }
}
