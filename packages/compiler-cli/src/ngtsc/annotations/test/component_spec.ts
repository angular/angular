import {NoopReferencesRegistry} from '..';
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CycleAnalyzer, ImportGraph} from '../../cycles';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {ModuleResolver, NOOP_DEFAULT_IMPORT_RECORDER, ReferenceEmitter, RelativePathStrategy} from '../../imports';
import {CompoundMetadataReader, CompoundMetadataRegistry, DtsMetadataReader, InjectableClassRegistry, LocalMetadataRegistry, ResourceRegistry} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../scope';
import {getDeclaration, makeProgram} from '../../testing';
import {ResourceLoader} from '../src/api';
import {ComponentDecoratorHandler} from '../src/component';
import {NgModuleDecoratorHandler} from '../src/ng_module';

export class StubResourceLoader implements ResourceLoader {
  resolve(v: string): string {
    return v;
  }
  canPreload = false;
  load(v: string): string {
    return '';
  }
  preload(): Promise<void>|undefined {
    throw new Error('Not implemented');
  }
}

function setup(program: ts.Program, options: ts.CompilerOptions, host: ts.CompilerHost) {
  const checker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(checker);
  const evaluator = new PartialEvaluator(reflectionHost, checker, /* dependencyTracker */ null);
  const moduleResolver =
      new ModuleResolver(program, options, host, /* moduleResolutionCache */ null);
  const importGraph = new ImportGraph(moduleResolver);
  const cycleAnalyzer = new CycleAnalyzer(importGraph);
  const localRegistry = new LocalMetadataRegistry();
  const dtsReader = new DtsMetadataReader(checker, reflectionHost);
  const scopeRegistry = new LocalModuleScopeRegistry(
      localRegistry, new MetadataDtsModuleScopeResolver(dtsReader, null), new ReferenceEmitter([]),
      null);
  const metaRegistry = new CompoundMetadataRegistry([localRegistry, scopeRegistry]);
  const metaReader = new CompoundMetadataReader([localRegistry, dtsReader]);
  const refEmitter = new ReferenceEmitter([new RelativePathStrategy(reflectionHost)]);
  const injectableRegistry = new InjectableClassRegistry(reflectionHost);
  const resourceRegistry = new ResourceRegistry();

  const handler = new ComponentDecoratorHandler(
      reflectionHost, evaluator, metaRegistry, metaReader, scopeRegistry, scopeRegistry,
      resourceRegistry,
      /* isCore */ false, new StubResourceLoader(), /* rootDirs */['/'],
      /* defaultPreserveWhitespaces */ false, /* i18nUseExternalIds */ true,
      /* enableI18nLegacyMessageIdFormat */ false,
      /* i18nNormalizeLineEndingsInICUs */ undefined, moduleResolver, cycleAnalyzer, refEmitter,
      NOOP_DEFAULT_IMPORT_RECORDER, /* depTracker */ null, injectableRegistry,
      /* annotateForClosureCompiler */ false);

  return {
    handler,

    reflectionHost,
    cycleAnalyzer,
    scopeRegistry,
    metaReader,
    evaluator,
    metaRegistry,
    refEmitter,
    injectableRegistry
  };
}

runInEachFileSystem(() => {
  describe('ComponentDecoratorHandler', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => _ = absoluteFrom);

    it('should produce a diagnostic when @Component has non-literal argument', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          const TEST = '';
          @Component(TEST) class TestCmp {}
      `
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      try {
        handler.analyze(TestCmp, detected.metadata);
        return fail('Analysis should have failed');
      } catch (err) {
        if (!(err instanceof FatalDiagnosticError)) {
          return fail('Error should be a FatalDiagnosticError');
        }
        const diag = err.toDiagnostic();
        expect(diag.code).toEqual(ivyCode(ErrorCode.DECORATOR_ARG_NOT_LITERAL));
        expect(diag.file.fileName.endsWith('entry.ts')).toBe(true);
        expect(diag.start).toBe(detected.metadata.args![0].getStart());
      }
    });

    it('should keep track of inline template', () => {
      const template = '<span>inline</span>';
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '${template}',
          }) class TestCmp {}
      `
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.template.path).toBeNull();
      expect(analysis?.resources.template.expression.getText()).toEqual(`'${template}'`);
    });

    it('should keep track of external template', () => {
      const templateUrl = '/myTemplate.ng.html';
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _(templateUrl),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: '${templateUrl}',
          }) class TestCmp {}
      `
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.template.path).toContain(templateUrl);
      expect(analysis?.resources.template.expression.getText()).toContain(`'${templateUrl}'`);
    });

    it('should keep track of internal and external styles', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/myStyle.css'),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          // These are ignored because we only attempt to store string literals
          const ignoredStyleUrl = 'asdlfkj';
          const ignoredStyle = '';
          @Component({
            template: '',
            styleUrls: ['/myStyle.css', ignoredStyleUrl],
            styles: ['a { color: red; }', 'b { color: blue; }', ignoredStyle, ...[ignoredStyle]],
          }) class TestCmp {}
      `
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles.size).toBe(3);
    });

    describe('remote scoping', () => {
      it('should mark components that need remote scoping as such', () => {
        const {
          testModule,
          simpleCmp,
          triggerCmp,
          ngModuleHandler,
          componentHandler,
          scopeRegistry
        } = createTriggerProject();

        const testModuleAnalysis =
            ngModuleHandler.analyze(testModule.node, testModule.detected.metadata).analysis!;
        ngModuleHandler.register(testModule.node, testModuleAnalysis);

        const simpleCmpAnalysis =
            componentHandler.analyze(simpleCmp.node, simpleCmp.detected.metadata).analysis!;
        componentHandler.register(simpleCmp.node, simpleCmpAnalysis);

        const triggerCmpAnalysis =
            componentHandler.analyze(triggerCmp.node, triggerCmp.detected.metadata).analysis!;
        componentHandler.register(triggerCmp.node, triggerCmpAnalysis);

        ngModuleHandler.resolve(testModule.node, testModuleAnalysis);
        componentHandler.resolve(simpleCmp.node, simpleCmpAnalysis);
        componentHandler.resolve(triggerCmp.node, triggerCmpAnalysis);

        // SimpleCmp does not introduce a cyclic import, but TriggerCmp does.
        expect(scopeRegistry.getRequiresRemoteScope(simpleCmp.node)).toBeFalse();
        expect(scopeRegistry.getRequiresRemoteScope(triggerCmp.node)).toBeTrue();
      });

      /**
       * Creates a project where the "Trigger" component requires remote
       * scoping.
       */
      function createTriggerProject() {
        const {program, options, host} = makeProgram([
          {
            name: _('/node_modules/@angular/core/index.d.ts'),
            contents: `
              export const Component: any;
              export const NgModule: any;
            `,
          },
          {
            name: _('/index.ts'),
            contents: `
              import {Component, NgModule} from '@angular/core';
              import {Trigger} from './trigger';

              @Component({
                template: '<div></div>',
                selector: 'app-cmp',
              })
              export class SimpleCmp {}

              @NgModule({
                declarations: [SimpleCmp, Trigger],
              })
              export class TestModule {}
            `
          },
          {
            name: _('/trigger.ts'),
            // Note that Trigger would introduce a cyclic import - index.ts imports trigger.ts for
            // the NgModule, but also Trigger uses SimpleCmp in its template which would be an
            // import without remote scoping.
            contents: `
              import {Component} from '@angular/core';

              @Component({
                template: '<app-cmp></app-cmp>',
              })
              export class Trigger {}
            `
          },
        ]);

        const {
          reflectionHost,
          handler: componentHandler,
          scopeRegistry,
          evaluator,
          metaReader,
          metaRegistry,
          refEmitter,
          injectableRegistry
        } = setup(program, options, host);
        const ngModuleHandler = new NgModuleDecoratorHandler(
            reflectionHost, evaluator, metaReader, metaRegistry, scopeRegistry,
            new NoopReferencesRegistry(),
            /* isCore */ false, /* routeAnalyzer */ null, refEmitter, /* factoryTracker */ null,
            NOOP_DEFAULT_IMPORT_RECORDER,
            /* annotateForClosureCompiler */ false, injectableRegistry);

        const TestModule =
            getDeclaration(program, _('/index.ts'), 'TestModule', isNamedClassDeclaration);
        const SimpleCmp =
            getDeclaration(program, _('/index.ts'), 'SimpleCmp', isNamedClassDeclaration);
        const TriggerCmp =
            getDeclaration(program, _('/trigger.ts'), 'Trigger', isNamedClassDeclaration);
        const detectedTestModule = ngModuleHandler.detect(
            TestModule, reflectionHost.getDecoratorsOfDeclaration(TestModule));
        const detectedSimpleCmp = componentHandler.detect(
            SimpleCmp, reflectionHost.getDecoratorsOfDeclaration(SimpleCmp));
        const detectedTriggerCmp = componentHandler.detect(
            TriggerCmp, reflectionHost.getDecoratorsOfDeclaration(TriggerCmp));
        if (!detectedTestModule) {
          throw new Error('Failed to recognize TestModule');
        }
        if (!detectedSimpleCmp) {
          throw new Error('Failed to recognize SimpleCmp');
        }
        if (!detectedTriggerCmp) {
          throw new Error('Failed to recognize Trigger');
        }

        return {
          testModule: {node: TestModule, detected: detectedTestModule},
          simpleCmp: {node: SimpleCmp, detected: detectedSimpleCmp},
          triggerCmp: {node: TriggerCmp, detected: detectedTriggerCmp},
          ngModuleHandler,
          componentHandler,
          scopeRegistry,
        };
      }
    });
  });

  function ivyCode(code: ErrorCode): number {
    return Number('-99' + code.valueOf());
  }
});
