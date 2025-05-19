/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ResourceLoader,
  SourceMap,
  JitEvaluator,
  CompilerFacadeImpl,
  escapeRegExp,
} from '@angular/compiler';
import {Attribute, Component, Directive, ErrorHandler} from '../../src/core';
import {CompilerFacade, ExportedCompilerFacade} from '../../src/compiler/compiler_facade';
import {resolveComponentResources} from '../../src/metadata/resource_loading';
import {TestBed} from '../../testing';

import {MockResourceLoader} from './resource_loader_mock';
import {extractSourceMap, originalPositionFor} from './source_map_util';

describe('jit source mapping', () => {
  let resourceLoader: MockResourceLoader;
  let jitEvaluator: MockJitEvaluator;

  beforeEach(() => {
    resourceLoader = new MockResourceLoader();
    jitEvaluator = new MockJitEvaluator();
    TestBed.configureCompiler({
      providers: [
        {
          provide: ResourceLoader,
          useValue: resourceLoader,
        },
        {
          provide: JitEvaluator,
          useValue: jitEvaluator,
        },
      ],
    });
  });

  describe('generated filenames and stack traces', () => {
    beforeEach(() => overrideCompilerFacade());
    afterEach(() => restoreCompilerFacade());

    describe('inline templates', () => {
      const ngUrl = 'ng:///MyComp/template.html';
      function templateDecorator(template: string) {
        return {template};
      }
      declareTests({ngUrl, templateDecorator});
    });

    describe('external templates', () => {
      const templateUrl = 'http://localhost:1234/some/url.html';
      const ngUrl = templateUrl;
      function templateDecorator(template: string) {
        resourceLoader.expect(templateUrl, template);
        return {templateUrl};
      }

      declareTests({ngUrl, templateDecorator});
    });

    function declareTests({ngUrl, templateDecorator}: TestConfig) {
      const generatedUrl = 'ng:///MyComp.js';

      it('should use the right source url in html parse errors', async () => {
        const template = '<div>\n  </error>';
        @Component({
          ...templateDecorator(template),
          standalone: false,
        })
        class MyComp {}

        await expectAsync(resolveCompileAndCreateComponent(MyComp, template)).toBeRejectedWithError(
          new RegExp(`${escapeRegExp(ngUrl)}@1:2`),
        );
      });

      it('should create a sourceMap for templates', async () => {
        const template = `Hello World!`;

        @Component({
          ...templateDecorator(template),
          standalone: false,
        })
        class MyComp {}

        await resolveCompileAndCreateComponent(MyComp, template);

        const sourceMap = jitEvaluator.getSourceMap(generatedUrl);
        expect(sourceMap.sources).toEqual([generatedUrl, ngUrl]);
        expect(sourceMap.sourcesContent).toEqual([' ', template]);
      });

      xit('should report source location for di errors', async () => {
        const template = `<div>\n    <div   someDir></div></div>`;

        @Component({
          ...templateDecorator(template),
          standalone: false,
        })
        class MyComp {}

        @Directive({
          selector: '[someDir]',
          standalone: false,
        })
        class SomeDir {
          constructor() {
            throw new Error('Test');
          }
        }

        TestBed.configureTestingModule({declarations: [SomeDir]});
        let error: any;
        try {
          await resolveCompileAndCreateComponent(MyComp, template);
        } catch (e) {
          error = e;
        }
        // The error should be logged from the element
        expect(await jitEvaluator.getSourcePositionForStack(error.stack, generatedUrl)).toEqual({
          line: 2,
          column: 4,
          source: ngUrl,
        });
      });

      xit('should report di errors with multiple elements and directives', async () => {
        const template = `<div someDir></div>|<div someDir="throw"></div>`;

        @Component({
          ...templateDecorator(template),
          standalone: false,
        })
        class MyComp {}

        @Directive({
          selector: '[someDir]',
          standalone: false,
        })
        class SomeDir {
          constructor(@Attribute('someDir') someDir: string) {
            if (someDir === 'throw') {
              throw new Error('Test');
            }
          }
        }

        TestBed.configureTestingModule({declarations: [SomeDir]});
        let error: any;
        try {
          await resolveCompileAndCreateComponent(MyComp, template);
        } catch (e) {
          error = e;
        }
        // The error should be logged from the 2nd-element
        expect(await jitEvaluator.getSourcePositionForStack(error.stack, generatedUrl)).toEqual({
          line: 1,
          column: 20,
          source: ngUrl,
        });
      });

      it('should report source location for binding errors', async () => {
        const template = `<div>\n    <span   [title]="createError()"></span></div>`;

        @Component({
          ...templateDecorator(template),
          standalone: false,
        })
        class MyComp {
          createError() {
            throw new Error('Test');
          }
        }

        const comp = await resolveCompileAndCreateComponent(MyComp, template);

        let error: any;
        try {
          comp.detectChanges();
        } catch (e) {
          error = e;
        }
        // the stack should point to the binding
        expect(await jitEvaluator.getSourcePositionForStack(error.stack, generatedUrl)).toEqual({
          line: 2,
          column: 12,
          source: ngUrl,
        });
      });

      it('should report source location for event errors', async () => {
        const template = `<div>\n    <span   (click)="createError()"></span></div>`;

        @Component({
          ...templateDecorator(template),
          standalone: false,
        })
        class MyComp {
          createError() {
            throw new Error('Test');
          }
        }

        const comp = await resolveCompileAndCreateComponent(MyComp, template);

        let error: any;
        const errorHandler = TestBed.inject(ErrorHandler);
        spyOn(errorHandler, 'handleError').and.callFake((e: any) => (error = e));
        try {
          comp.debugElement.children[0].children[0].triggerEventHandler('click', 'EVENT');
        } catch (e) {
          error = e;
        }
        expect(error).toBeTruthy();
        // the stack should point to the binding
        expect(await jitEvaluator.getSourcePositionForStack(error.stack, generatedUrl)).toEqual({
          line: 2,
          column: 21,
          source: ngUrl,
        });
      });
    }
  });

  async function compileAndCreateComponent(comType: any) {
    TestBed.configureTestingModule({declarations: [comType]});

    await TestBed.compileComponents();

    if (resourceLoader.hasPendingRequests()) {
      resourceLoader.flush();
    }

    return TestBed.createComponent(comType);
  }

  function createResolver(contents: string) {
    return (_url: string) => Promise.resolve(contents);
  }

  async function resolveCompileAndCreateComponent(comType: any, template: string) {
    await resolveComponentResources(createResolver(template));
    return await compileAndCreateComponent(comType);
  }

  let ɵcompilerFacade: CompilerFacade;
  function overrideCompilerFacade() {
    const ng: ExportedCompilerFacade = (global as any).ng;
    if (ng) {
      ɵcompilerFacade = ng.ɵcompilerFacade;
      ng.ɵcompilerFacade = new CompilerFacadeImpl(jitEvaluator);
    }
  }
  function restoreCompilerFacade() {
    if (ɵcompilerFacade) {
      const ng: ExportedCompilerFacade = (global as any).ng;
      ng.ɵcompilerFacade = ɵcompilerFacade;
    }
  }

  interface TestConfig {
    ngUrl: string;
    templateDecorator: (template: string) => {
      [key: string]: any;
    };
  }

  interface SourcePos {
    source: string | null;
    line: number | null;
    column: number | null;
  }

  /**
   * A helper class that captures the sources that have been JIT compiled.
   */
  class MockJitEvaluator extends JitEvaluator {
    sources: string[] = [];

    override executeFunction(fn: Function, args: any[]) {
      // Capture the source that has been generated.
      this.sources.push(fn.toString());
      // Then execute it anyway.
      return super.executeFunction(fn, args);
    }

    /**
     * Get the source-map for a specified JIT compiled file.
     * @param genFile the URL of the file whose source-map we want.
     */
    getSourceMap(genFile: string): SourceMap {
      return this.sources
        .map((source) => extractSourceMap(source))
        .find((map) => !!(map && map.file === genFile))!;
    }

    async getSourcePositionForStack(stack: string, genFile: string): Promise<SourcePos> {
      const urlRegexp = new RegExp(`(${escapeRegExp(genFile)}):(\\d+):(\\d+)`);
      const pos = stack
        .split('\n')
        .map((line) => urlRegexp.exec(line))
        .filter((match) => !!match)
        .map((match) => ({
          file: match![1],
          line: parseInt(match![2], 10),
          column: parseInt(match![3], 10),
        }))
        .shift();
      if (!pos) {
        throw new Error(`${genFile} was not mentioned in this stack:\n${stack}`);
      }
      const sourceMap = this.getSourceMap(pos.file);
      return await originalPositionFor(sourceMap, pos);
    }
  }
});
