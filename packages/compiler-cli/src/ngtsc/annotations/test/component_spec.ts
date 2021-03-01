/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '@angular/compiler';
import * as ts from 'typescript';

import {CycleAnalyzer, CycleHandlingStrategy, ImportGraph} from '../../cycles';
import {ErrorCode, FatalDiagnosticError} from '../../diagnostics';
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {ModuleResolver, NOOP_DEFAULT_IMPORT_RECORDER, ReferenceEmitter} from '../../imports';
import {CompoundMetadataReader, DtsMetadataReader, InjectableClassRegistry, LocalMetadataRegistry, ResourceRegistry} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {NOOP_PERF_RECORDER} from '../../perf';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver, TypeCheckScopeRegistry} from '../../scope';
import {getDeclaration, makeProgram} from '../../testing';
import {ResourceLoader, ResourceLoaderContext} from '../src/api';
import {ComponentDecoratorHandler} from '../src/component';

export class StubResourceLoader implements ResourceLoader {
  resolve(v: string): string {
    return v;
  }
  canPreload = false;
  canPreprocess = false;
  load(v: string): string {
    return '';
  }
  preload(): Promise<void>|undefined {
    throw new Error('Not implemented');
  }
  preprocessInline(_data: string, _context: ResourceLoaderContext): Promise<string> {
    throw new Error('Not implemented');
  }
}

function setup(program: ts.Program, options: ts.CompilerOptions, host: ts.CompilerHost) {
  const checker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(checker);
  const evaluator = new PartialEvaluator(reflectionHost, checker, /* dependencyTracker */ null);
  const moduleResolver =
      new ModuleResolver(program, options, host, /* moduleResolutionCache */ null);
  const importGraph = new ImportGraph(checker, NOOP_PERF_RECORDER);
  const cycleAnalyzer = new CycleAnalyzer(importGraph);
  const metaRegistry = new LocalMetadataRegistry();
  const dtsReader = new DtsMetadataReader(checker, reflectionHost);
  const scopeRegistry = new LocalModuleScopeRegistry(
      metaRegistry, new MetadataDtsModuleScopeResolver(dtsReader, null), new ReferenceEmitter([]),
      null);
  const metaReader = new CompoundMetadataReader([metaRegistry, dtsReader]);
  const refEmitter = new ReferenceEmitter([]);
  const injectableRegistry = new InjectableClassRegistry(reflectionHost);
  const resourceRegistry = new ResourceRegistry();
  const typeCheckScopeRegistry = new TypeCheckScopeRegistry(scopeRegistry, metaReader);
  const resourceLoader = new StubResourceLoader();

  const handler = new ComponentDecoratorHandler(
      reflectionHost,
      evaluator,
      metaRegistry,
      metaReader,
      scopeRegistry,
      scopeRegistry,
      typeCheckScopeRegistry,
      resourceRegistry,
      /* isCore */ false,
      resourceLoader,
      /* rootDirs */['/'],
      /* defaultPreserveWhitespaces */ false,
      /* i18nUseExternalIds */ true,
      /* enableI18nLegacyMessageIdFormat */ false,
      /* usePoisonedData */ false,
      /* i18nNormalizeLineEndingsInICUs */ undefined,
      moduleResolver,
      cycleAnalyzer,
      CycleHandlingStrategy.UseRemoteScoping,
      refEmitter,
      NOOP_DEFAULT_IMPORT_RECORDER,
      /* depTracker */ null,
      injectableRegistry,
      /* semanticDepGraphUpdater */ null,
      /* annotateForClosureCompiler */ false,
      NOOP_PERF_RECORDER,
  );
  return {reflectionHost, handler, resourceLoader};
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

    it('does not emit a program with template parse errors', () => {
      const template = '{{x ? y }}';
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
      const symbol = handler.symbol(TestCmp, analysis!);
      const resolution = handler.resolve(TestCmp, analysis!, symbol);

      const compileResult =
          handler.compileFull(TestCmp, analysis!, resolution.data!, new ConstantPool());
      expect(compileResult).toEqual([]);
    });

    it('should replace inline style content with transformed content', async () => {
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
            template: '',
            styles: ['.abc {}']
          }) class TestCmp {}
      `
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host);
      resourceLoader.canPreload = true;
      resourceLoader.canPreprocess = true;
      resourceLoader.preprocessInline = async function(data, context) {
        expect(data).toBe('.abc {}');
        expect(context.containingFile).toBe(_('/entry.ts').toLowerCase());
        expect(context.type).toBe('style');

        return '.xyz {}';
      };

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      await handler.preanalyze(TestCmp, detected.metadata);

      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.inlineStyles).toEqual(jasmine.arrayWithExactContents(['.xyz {}']));
    });
  });

  function ivyCode(code: ErrorCode): number {
    return Number('-99' + code.valueOf());
  }
});
