/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, AotCompilerHost, createAotCompiler} from '@angular/compiler';
import {async} from '@angular/core/testing';
import * as path from 'path';
import * as ts from 'typescript';

import {ReflectionCapabilities, reflector} from './private_import_core';
import {EmittingCompilerHost, MockAotCompilerHost, MockCompilerHost, MockData, settings} from './test_util';

const DTS = /\.d\.ts$/;

// These are the files that contain the well known annotations.
const CORE_FILES = [
  '@angular/core/src/metadata.ts', '@angular/core/src/di/metadata.ts',
  '@angular/core/src/di/injection_token.ts', '@angular/core/src/animation/metadata.ts',
  '@angular/core/src/di/provider.ts', '@angular/core/src/linker/view.ts'
];

describe('compiler', () => {
  let angularFiles: Map<string, string>;

  beforeAll(() => {
    const emittingHost = new EmittingCompilerHost(CORE_FILES);
    const emittingProgram = ts.createProgram(emittingHost.scripts, settings, emittingHost);
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
             .not.toBeUndefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .not.toBeUndefined();
       })));

    it('should compile using summaries',
       async(() => summaryCompile(host, aotHost).then(generatedFiles => {
         expect(generatedFiles.find(f => /app\.component\.ngfactory\.ts/.test(f.genFileUrl)))
             .not.toBeUndefined();
         expect(generatedFiles.find(f => /app\.module\.ngfactory\.ts/.test(f.genFileUrl)))
             .not.toBeUndefined();
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
    postCompile: (program: ts.Program) => void = expectNoDiagnostics) {
  const program = ts.createProgram(host.scriptNames, settings, host);
  if (preCompile) preCompile(program);
  const {compiler, reflector} = createAotCompiler(aotHost, {});
  return compiler.compileAll(program.getSourceFiles().map(sf => sf.fileName))
      .then(generatedFiles => {
        generatedFiles.forEach(
            file => isSource(file.genFileUrl) ? host.addScript(file.genFileUrl, file.source) :
                                                host.override(file.genFileUrl, file.source));
        const newProgram = ts.createProgram(host.scriptNames, settings, host, program);
        if (postCompile) postCompile(newProgram);
        return generatedFiles;
      });
}

const QUICKSTART = ['/quickstart/app/app.module.ts'];
const FILES: MockData = {
  quickstart: {
    app: {
      'app.component.ts': `
        import {Component} from '@angular/core/src/metadata';

        @Component({
          template: '<h1>Hello {{name}}</h1>'
        })
        export class AppComponent {
          name = 'Angular';
        }
      `,
      'app.module.ts': `
        import { NgModule }      from '@angular/core/src/metadata';

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
