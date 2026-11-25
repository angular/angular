/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';

import {resolveFixtureNodeModules, runPipeline} from './utils.js';

function typecheckAndEmit(files: Record<string, string>): {
  diagnostics: ts.Diagnostic[];
  emitted: Map<string, string>;
} {
  const nodeModulesDir = resolveFixtureNodeModules();
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    declaration: true,
    experimentalDecorators: true,
    skipLibCheck: true,
    outDir: '/emit',
    rootDir: '/src',
  };

  const defaultHost = ts.createCompilerHost(compilerOptions);
  const emitted = new Map<string, string>();
  const mapNodeModulesPath = (fileName: string): string | null => {
    const nmIdx = fileName.indexOf('/node_modules/');
    if (nmIdx === -1) {
      return null;
    }
    return path.join(nodeModulesDir, fileName.slice(nmIdx + '/node_modules/'.length));
  };
  const resolveVirtualOrReal = (fileName: string): string | null => {
    if (fileName in files) {
      return files[fileName];
    }
    const realPath = mapNodeModulesPath(fileName);
    if (realPath !== null && fs.existsSync(realPath) && fs.statSync(realPath).isFile()) {
      return fs.readFileSync(realPath, 'utf8');
    }
    return null;
  };

  const host: ts.CompilerHost = {
    ...defaultHost,
    getCurrentDirectory: () => '/',
    directoryExists: (dirName) => {
      if (dirName === '/src' || dirName === '/node_modules') {
        return true;
      }
      const realPath = mapNodeModulesPath(dirName);
      if (realPath !== null) {
        return fs.existsSync(realPath) && fs.statSync(realPath).isDirectory();
      }
      return defaultHost.directoryExists?.(dirName) ?? false;
    },
    fileExists: (fileName) =>
      resolveVirtualOrReal(fileName) !== null || defaultHost.fileExists(fileName),
    readFile: (fileName) => resolveVirtualOrReal(fileName) ?? defaultHost.readFile(fileName),
    getSourceFile: (fileName, languageVersion) => {
      const virtual = resolveVirtualOrReal(fileName);
      if (virtual !== null) {
        return ts.createSourceFile(fileName, virtual, languageVersion);
      }
      return defaultHost.getSourceFile(fileName, languageVersion);
    },
    writeFile: (fileName, data) => {
      emitted.set(fileName, data);
    },
  };

  const rootNames = Object.keys(files);
  const program = ts.createProgram(rootNames, compilerOptions, host);
  const emitResult = program.emit();
  const diagnostics = [...ts.getPreEmitDiagnostics(program), ...emitResult.diagnostics];
  return {diagnostics, emitted};
}

describe('partial compilation', () => {
  it('type-checks and emits .d.ts cleanly for abstract and private-constructor directives in strict mode', async () => {
    const outputs = await runPipeline(
      [
        {
          path: '/tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {
              target: 'ES2022',
              module: 'ES2022',
              strict: true,
              declaration: true,
              experimentalDecorators: true,
            },
            angularCompilerOptions: {
              compilationMode: 'partial',
            },
            files: ['/src/directives.ts'],
          }),
        },
        {
          path: '/src/directives.ts',
          content: `
            import {Directive, Injectable, Input, NgModule, Pipe, PipeTransform} from '@angular/core';

            @Directive()
            export abstract class BaseDir {
              @Input() value = '';
              abstract compute(): string;
            }

            @Directive({selector: '[privDir]'})
            export class PrivateCtorDir {
              private constructor() {}
            }

            @Injectable({providedIn: 'root'})
            export abstract class BaseService {
              abstract run(): void;
            }

            @Pipe({name: 'myPipe'})
            export class MyPipe implements PipeTransform {
              private constructor() {}
              transform(v: string): string { return v; }
            }

            @NgModule({
              declarations: [],
              imports: [PrivateCtorDir, MyPipe],
              exports: [PrivateCtorDir, MyPipe],
            })
            export class MyModule {}
          `,
        },
      ],
      {optimize: true, format: false},
    );

    const emittedNgTs = outputs.find((f) => f.path === '/out/src/directives.ts');
    expect(emittedNgTs).toBeDefined();
    expect(emittedNgTs!.content).toContain('ɵɵngDeclareDirective');
    expect(emittedNgTs!.content).toContain('ɵɵngDeclareFactory');
    expect(emittedNgTs!.content).toContain('ɵɵngDeclareInjectable');
    expect(emittedNgTs!.content).toContain('ɵɵngDeclarePipe');
    expect(emittedNgTs!.content).toContain('ɵɵngDeclareNgModule');
    expect(emittedNgTs!.content).toContain('ɵɵngDeclareInjector');
    expect(emittedNgTs!.content).toContain('ɵɵngDeclareClassMetadata');
    expect(emittedNgTs!.content).not.toContain('/*@__PURE__*/');

    const {diagnostics, emitted} = typecheckAndEmit({'/src/directives.ts': emittedNgTs!.content});
    expect(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual(
      [],
    );

    const js = emitted.get('/emit/directives.js');
    const dts = emitted.get('/emit/directives.d.ts');
    expect(js).toBeDefined();
    expect(js).not.toContain('as any');
    expect(dts).toBeDefined();
    expect(dts).toContain('ɵɵDirectiveDeclaration<BaseDir');
    expect(dts).toContain('ɵɵDirectiveDeclaration<PrivateCtorDir');
    expect(dts).toContain('ɵɵInjectableDeclaration<any>');
    expect(dts).toContain('ɵɵPipeDeclaration<MyPipe');
    expect(dts).toContain('ɵɵNgModuleDeclaration<MyModule');
  });
});
