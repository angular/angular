/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ErrorCode} from '../../../src/ngtsc/diagnostics';
import {ClassDeclaration, ClassSymbol, Decorator} from '../../../src/ngtsc/reflection';
import {AnalysisOutput, CompileResult, DecoratorHandler, DetectResult, HandlerPrecedence} from '../../../src/ngtsc/transform';
import {DefaultMigrationHost} from '../../src/analysis/migration_host';
import {AnalyzedClass, AnalyzedFile} from '../../src/analysis/types';

describe('DefaultMigrationHost', () => {
  describe('injectSyntheticDecorator()', () => {
    const mockHost: any = {
      getClassSymbol: (node: any): ClassSymbol | undefined =>
                          ({ valueDeclaration: node, name: node.name.text } as any),
    };
    const mockMetadata: any = {};
    const mockEvaluator: any = {};
    const mockClazz: any = {
      name: {text: 'MockClazz'},
      getSourceFile: () => { fileName: 'test-file.js'; },
    };
    const mockDecorator: any = {name: 'MockDecorator'};

    it('should call `detect()` on each of the provided handlers', () => {
      const log: string[] = [];
      const handler1 = new TestHandler('handler1', log);
      const handler2 = new TestHandler('handler2', log);
      const host =
          new DefaultMigrationHost(mockHost, mockMetadata, mockEvaluator, [handler1, handler2], []);
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
             mockHost, mockMetadata, mockEvaluator, [handler1, handler2, handler3], []);
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
      const host =
          new DefaultMigrationHost(mockHost, mockMetadata, mockEvaluator, [handler], analyzedFiles);
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
      const host =
          new DefaultMigrationHost(mockHost, mockMetadata, mockEvaluator, [handler], analyzedFiles);
      host.injectSyntheticDecorator(mockClazz, mockDecorator);
      expect(analyzedFiles.length).toEqual(1);
      expect(analyzedFiles[0].analyzedClasses.length).toEqual(3);
      expect(analyzedFiles[0].analyzedClasses[2].name).toEqual('MockClazz');
    });

    it('should add a new decorator into an already existing `AnalyzedClass`', () => {
      const analyzedClass: AnalyzedClass = {
        name: 'MockClazz',
        declaration: mockClazz,
        matches: [],
        decorators: null,
      };
      const log: string[] = [];
      const handler = new AlwaysDetectHandler('handler', log);
      const analyzedFiles: AnalyzedFile[] = [{
        sourceFile: mockClazz.getSourceFile(),
        analyzedClasses: [analyzedClass],
      }];
      const host =
          new DefaultMigrationHost(mockHost, mockMetadata, mockEvaluator, [handler], analyzedFiles);
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
           matches: [],
           decorators: [{name: 'OtherDecorator'} as Decorator],
         };
         const log: string[] = [];
         const handler = new AlwaysDetectHandler('handler', log);
         const analyzedFiles: AnalyzedFile[] = [{
           sourceFile: mockClazz.getSourceFile(),
           analyzedClasses: [analyzedClass],
         }];
         const host = new DefaultMigrationHost(
             mockHost, mockMetadata, mockEvaluator, [handler], analyzedFiles);
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
        matches: [],
        decorators: [{name: 'MockDecorator'} as Decorator],
      };
      const log: string[] = [];
      const handler = new AlwaysDetectHandler('handler', log);
      const analyzedFiles: AnalyzedFile[] = [{
        sourceFile: mockClazz.getSourceFile(),
        analyzedClasses: [analyzedClass],
      }];
      const host =
          new DefaultMigrationHost(mockHost, mockMetadata, mockEvaluator, [handler], analyzedFiles);
      expect(() => host.injectSyntheticDecorator(mockClazz, mockDecorator))
          .toThrow(
              jasmine.objectContaining({code: ErrorCode.NGCC_MIGRATION_DECORATOR_INJECTION_ERROR}));
    });
  });
});

class TestHandler implements DecoratorHandler<any, any> {
  constructor(protected name: string, protected log: string[]) {}

  precedence = HandlerPrecedence.PRIMARY;
  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<any>|undefined {
    this.log.push(`${this.name}:detect:${node.name.text}:${decorators !.map(d => d.name)}`);
    return undefined;
  }
  analyze(node: ClassDeclaration): AnalysisOutput<any> {
    this.log.push(this.name + ':analyze:' + node.name.text);
    return {};
  }
  compile(node: ClassDeclaration): CompileResult|CompileResult[] {
    this.log.push(this.name + ':compile:' + node.name.text);
    return [];
  }
}

class AlwaysDetectHandler extends TestHandler {
  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<any>|undefined {
    super.detect(node, decorators);
    return {trigger: node, metadata: {}};
  }
}
