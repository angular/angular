/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, AotCompilerHost, AotCompilerOptions, GeneratedFile, createAotCompiler} from '@angular/compiler';
import {RenderComponentType, ɵReflectionCapabilities as ReflectionCapabilities, ɵreflector as reflector} from '@angular/core';
import {async, fakeAsync, tick} from '@angular/core/testing';
import {MetadataBundler, MetadataCollector, ModuleMetadata, privateEntriesToIndex} from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {extractSourceMap, originalPositionFor} from '../output/source_map_util';

import {EmittingCompilerHost, MockAotCompilerHost, MockCompilerHost, MockData, MockDirectory, MockMetadataBundlerHost, settings} from './test_util';

const DTS = /\.d\.ts$/;

const minCoreIndex = `
  export * from './src/application_module';
  export * from './src/change_detection';
  export * from './src/metadata';
  export * from './src/di/metadata';
  export * from './src/di/injector';
  export * from './src/di/injection_token';
  export * from './src/linker';
  export * from './src/render';
  export * from './src/codegen_private_exports';
`;

describe('compiler (unbundled Angular)', () => {
  let angularFiles: Map<string, string>;

  beforeAll(() => {
    const emittingHost = new EmittingCompilerHost([], {emitMetadata: true});
    emittingHost.addScript('@angular/core/index.ts', minCoreIndex);
    const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
    emittingProgram.emit();

    angularFiles = emittingHost.written;
  });

  // Restore reflector since AoT compiler will update it with a new static reflector
  afterEach(() => { reflector.updateCapabilities(new ReflectionCapabilities()); });

  describe('Quickstart', () => {
    let host: MockCompilerHost;
    let aotHost: MockAotCompilerHost;

    beforeEach(() => {
      host = new MockCompilerHost(QUICKSTART, FILES, angularFiles);
      aotHost = new MockAotCompilerHost(host);
    });

    it('should compile',
       async(() => compile(host, aotHost, expectNoDiagnostics).then(generatedFiles => {
         expect(generatedFiles.find(f => /app\.component\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
       })));

    it('should compile using summaries',
       async(() => summaryCompile(host, aotHost).then(generatedFiles => {
         expect(generatedFiles.find(f => /app\.component\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
       })));
  });

  describe('aot source mapping', () => {
    const componentPath = '/app/app.component.ts';

    let rootDir: MockDirectory;
    let appDir: MockDirectory;

    beforeEach(() => {
      appDir = {
        'app.module.ts': `
              import { NgModule }      from '@angular/core';

              import { AppComponent }  from './app.component';

              @NgModule({
                declarations: [ AppComponent ],
                bootstrap:    [ AppComponent ]
              })
              export class AppModule { }
            `
      };
      rootDir = {'app': appDir};
    });

    function compileApp(): GeneratedFile {
      const host = new MockCompilerHost(['/app/app.module.ts'], rootDir, angularFiles);
      const aotHost = new MockAotCompilerHost(host);
      let result: GeneratedFile[];
      let error: Error;
      compile(host, aotHost, expectNoDiagnostics, expectNoDiagnostics)
          .then((files) => result = files, (err) => error = err);
      tick();
      if (error) {
        throw error;
      }
      return result.find(genFile => genFile.srcFileUrl === componentPath);
      ;
    }

    function findLineAndColumn(file: string, token: string): {line: number, column: number} {
      const index = file.indexOf(token);
      if (index === -1) {
        return {line: null, column: null};
      }
      const linesUntilToken = file.slice(0, index).split('\n');
      const line = linesUntilToken.length;
      const column = linesUntilToken[linesUntilToken.length - 1].length;
      return {line, column};
    }

    function createComponentSource(componentDecorator: string) {
      return `
        import { NgModule, Component } from '@angular/core';

        @Component({
          ${componentDecorator}
        })
        export class AppComponent {
          someMethod() {}
        }
      `;
    }

    describe('inline templates', () => {
      const templateUrl = componentPath;

      function templateDecorator(template: string) { return `template: \`${template}\`,`; }

      declareTests({templateUrl, templateDecorator});
    });

    describe('external templates', () => {
      const templateUrl = '/app/app.component.html';

      function templateDecorator(template: string) {
        appDir['app.component.html'] = template;
        return `templateUrl: 'app.component.html',`;
      }

      declareTests({templateUrl, templateDecorator});
    });

    function declareTests(
        {templateUrl, templateDecorator}:
            {templateUrl: string, templateDecorator: (template: string) => string}) {
      it('should use the right source url in html parse errors', fakeAsync(() => {
           appDir['app.component.ts'] =
               createComponentSource(templateDecorator('<div>\n  </error>'));

           expect(() => compileApp())
               .toThrowError(new RegExp(`Template parse errors[\\s\\S]*${templateUrl}@1:2`));
         }));

      it('should use the right source url in template parse errors', fakeAsync(() => {
           appDir['app.component.ts'] = createComponentSource(
               templateDecorator('<div>\n  <div unknown="{{ctxProp}}"></div>'));

           expect(() => compileApp())
               .toThrowError(new RegExp(`Template parse errors[\\s\\S]*${templateUrl}@1:7`));
         }));

      it('should create a sourceMap for the template', fakeAsync(() => {
           const template = 'Hello World!';

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           const genFile = compileApp();
           const sourceMap = extractSourceMap(genFile.source);
           expect(sourceMap.file).toEqual(genFile.genFileUrl);
           // the generated file contains the host view and the component view.
           // we are only interested in the component view.
           const sourceIndex = sourceMap.sources.indexOf(templateUrl);
           expect(sourceMap.sourcesContent[sourceIndex]).toEqual(template);
         }));

      it('should map elements correctly to the source', fakeAsync(() => {
           const template = '<div>\n   <span></span></div>';

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           const genFile = compileApp();
           const sourceMap = extractSourceMap(genFile.source);
           expect(originalPositionFor(sourceMap, findLineAndColumn(genFile.source, `'span'`)))
               .toEqual({line: 2, column: 3, source: templateUrl});
         }));

      it('should map bindings correctly to the source', fakeAsync(() => {
           const template = `<div>\n   <span [title]="someMethod()"></span></div>`;

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           const genFile = compileApp();
           const sourceMap = extractSourceMap(genFile.source);
           expect(originalPositionFor(sourceMap, findLineAndColumn(genFile.source, `someMethod()`)))
               .toEqual({line: 2, column: 9, source: templateUrl});
         }));

      it('should map events correctly to the source', fakeAsync(() => {
           const template = `<div>\n   <span (click)="someMethod()"></span></div>`;

           appDir['app.component.ts'] = createComponentSource(templateDecorator(template));

           const genFile = compileApp();
           const sourceMap = extractSourceMap(genFile.source);
           expect(originalPositionFor(sourceMap, findLineAndColumn(genFile.source, `someMethod()`)))
               .toEqual({line: 2, column: 9, source: templateUrl});
         }));
    }
  });
});

describe('compiler (bundled Angular)', () => {
  let angularFiles: Map<string, string>;

  beforeAll(() => {
    const emittingHost = new EmittingCompilerHost(['@angular/core/index'], {emitMetadata: false});

    // Create the metadata bundled
    const indexModule = emittingHost.effectiveName('@angular/core/index');
    const bundler = new MetadataBundler(
        indexModule, '@angular/core', new MockMetadataBundlerHost(emittingHost));
    const bundle = bundler.getMetadataBundle();
    const metadata = JSON.stringify(bundle.metadata, null, ' ');
    const bundleIndexSource = privateEntriesToIndex('./index', bundle.privates);
    emittingHost.override('@angular/core/bundle_index.ts', bundleIndexSource);
    emittingHost.addWrittenFile(
        '@angular/core/package.json', JSON.stringify({typings: 'bundle_index.d.ts'}));
    emittingHost.addWrittenFile('@angular/core/bundle_index.metadata.json', metadata);

    // Emit the sources
    const bundleIndexName = emittingHost.effectiveName('@angular/core/bundle_index.ts');
    const emittingProgram = ts.createProgram([bundleIndexName], settings, emittingHost);
    emittingProgram.emit();
    angularFiles = emittingHost.written;
  });

  describe('Quickstart', () => {
    let host: MockCompilerHost;
    let aotHost: MockAotCompilerHost;

    beforeEach(() => {
      host = new MockCompilerHost(QUICKSTART, FILES, angularFiles);
      aotHost = new MockAotCompilerHost(host);
    });

    // Restore reflector since AoT compiler will update it with a new static reflector
    afterEach(() => { reflector.updateCapabilities(new ReflectionCapabilities()); });

    it('should compile',
       async(() => compile(host, aotHost, expectNoDiagnostics).then(generatedFiles => {
         expect(generatedFiles.find(f => /app\.component\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .toBeDefined();
       })));
  });
});

function expectNoDiagnostics(program: ts.Program) {
  function fileInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      return `${diagnostic.file.fileName}(${diagnostic.start}): `;
    }
    return '';
  }

  function chars(len: number, ch: string): string { return new Array(len).fill(ch).join(''); }

  function lineNoOf(offset: number, text: string): number {
    let result = 1;
    for (let i = 0; i < offset; i++) {
      if (text[i] == '\n') result++;
    }
    return result;
  }

  function lineInfo(diagnostic: ts.Diagnostic): string {
    if (diagnostic.file) {
      const start = diagnostic.start;
      let end = diagnostic.start + diagnostic.length;
      const source = diagnostic.file.text;
      let lineStart = start;
      let lineEnd = end;
      while (lineStart > 0 && source[lineStart] != '\n') lineStart--;
      if (lineStart < start) lineStart++;
      while (lineEnd < source.length && source[lineEnd] != '\n') lineEnd++;
      let line = source.substring(lineStart, lineEnd);
      const lineIndex = line.indexOf('/n');
      if (lineIndex > 0) {
        line = line.substr(0, lineIndex);
        end = start + lineIndex;
      }
      const lineNo = lineNoOf(start, source) + ': ';
      return '\n' + lineNo + line + '\n' + chars(start - lineStart + lineNo.length, ' ') +
          chars(end - start, '^');
    }
    return '';
  }

  function expectNoDiagnostics(diagnostics: ts.Diagnostic[]) {
    if (diagnostics && diagnostics.length) {
      throw new Error(
          'Errors from TypeScript:\n' +
          diagnostics.map(d => `${fileInfo(d)}${d.messageText}${lineInfo(d)}`).join(' \n'));
    }
  }
  expectNoDiagnostics(program.getOptionsDiagnostics());
  expectNoDiagnostics(program.getSyntacticDiagnostics());
  expectNoDiagnostics(program.getSemanticDiagnostics());
}

function isDTS(fileName: string): boolean {
  return /\.d\.ts$/.test(fileName);
}

function isSource(fileName: string): boolean {
  return /\.ts$/.test(fileName);
}

function isFactory(fileName: string): boolean {
  return /\.ngfactory\./.test(fileName);
}

function summaryCompile(
    host: MockCompilerHost, aotHost: MockAotCompilerHost,
    preCompile?: (program: ts.Program) => void) {
  // First compile the program to generate the summary files.
  return compile(host, aotHost).then(generatedFiles => {
    // Remove generated files that were not generated from a DTS file
    host.remove(generatedFiles.filter(f => !isDTS(f.srcFileUrl)).map(f => f.genFileUrl));

    // Next compile the program shrowding metadata and only treating .ts files as source.
    aotHost.hideMetadata();
    aotHost.tsFilesOnly();

    return compile(host, aotHost);
  });
}

function compile(
    host: MockCompilerHost, aotHost: AotCompilerHost, preCompile?: (program: ts.Program) => void,
    postCompile: (program: ts.Program) => void = expectNoDiagnostics,
    options: AotCompilerOptions = {}) {
  const scripts = host.scriptNames.slice(0);
  const program = ts.createProgram(scripts, settings, host);
  if (preCompile) preCompile(program);
  const {compiler, reflector} = createAotCompiler(aotHost, options);
  return compiler.compileAll(program.getSourceFiles().map(sf => sf.fileName))
      .then(generatedFiles => {
        generatedFiles.forEach(
            file => isSource(file.genFileUrl) ? host.addScript(file.genFileUrl, file.source) :
                                                host.override(file.genFileUrl, file.source));
        const scripts = host.scriptNames.slice(0);
        const newProgram = ts.createProgram(scripts, settings, host);
        if (postCompile) postCompile(newProgram);
        return generatedFiles;
      });
}

const QUICKSTART = ['/quickstart/app/app.module.ts'];
const FILES: MockData = {
  quickstart: {
    app: {
      'app.component.ts': `
        import {Component} from '@angular/core';

        @Component({
          template: '<h1>Hello {{name}}</h1>'
        })
        export class AppComponent {
          name = 'Angular';
        }
      `,
      'app.module.ts': `
        import { NgModule }      from '@angular/core';

        import { AppComponent }  from './app.component';

        @NgModule({
          declarations: [ AppComponent ],
          bootstrap:    [ AppComponent ]
        })
        export class AppModule { }
      `
    }
  }
};
