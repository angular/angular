/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {signalMetadataTransform} from '../src/implicit_signal_debug_name_transform';

describe('implicit signal debug name transform', () => {
  const ANGULAR_CORE_DTS = `
    export declare function signal<T>(value: T, config?: unknown): unknown;
    export declare function computed<T>(fn: () => T, config?: unknown): unknown;
  `;

  function emitWithTransform(fileName: string, contents: string): string {
    const files = new Map<string, string>();
    files.set(fileName, contents);
    files.set('/node_modules/@angular/core/index.d.ts', ANGULAR_CORE_DTS);

    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      skipLibCheck: true,
      noEmitOnError: false,
    };

    const host = ts.createCompilerHost(compilerOptions);
    const originalGetSourceFile = host.getSourceFile.bind(host);

    host.getSourceFile = (fn, languageVersion, ...rest) => {
      const content = files.get(fn);
      if (content !== undefined) {
        return ts.createSourceFile(fn, content, languageVersion, true);
      }
      return originalGetSourceFile(fn, languageVersion, ...rest);
    };

    host.readFile = (fn) => files.get(fn) ?? undefined;
    host.fileExists = (fn) => files.has(fn) || ts.sys.fileExists(fn);

    let output = '';
    const program = ts.createProgram([fileName], compilerOptions, host);
    program.emit(
      undefined,
      (fn, data) => {
        if (fn.endsWith('.js')) {
          output = data;
        }
      },
      undefined,
      undefined,
      {before: [signalMetadataTransform(program)]},
    );

    return output;
  }

  it('does not prefix user code', () => {
    const output = emitWithTransform(
      '/workspace/packages/ui-lib/src/file.ts',
      `
        import {signal} from '@angular/core';
        const mySignal = signal(0);
      `,
    );
    expect(output).toContain('debugName: "mySignal"');
    expect(output).not.toContain('debugName: "\\u0275mySignal"');
  });

  it('prefixes framework code without existing config', () => {
    const output = emitWithTransform(
      '/workspace/node_modules/@angular/forms/src/model.ts',
      `
        import {signal} from '@angular/core';
        const mySignal = signal(0);
      `,
    );
    expect(output).toContain('debugName: "\\u0275mySignal"');
  });

  it('adds a prefixed debugName when an options object is present', () => {
    const output = emitWithTransform(
      '/workspace/node_modules/@angular/forms/src/model.ts',
      `
        import {signal} from '@angular/core';
        const mySignal = signal(0, { equal: (a, b) => true });
      `,
    );
    expect(output).toContain('debugName: "\\u0275mySignal"');
    expect(output).toContain('equal: (a, b) => true');
  });

  it('prefixes bazel-out framework outputs lacking package.json nearby', () => {
    const output = emitWithTransform(
      '/private/var/tmp/_bazel_user/hash/execroot/_main/bazel-out/fastbuild/bin/packages/forms/src/model/abstract_model.ts',
      `
        /**
         * @license
         * https://angular.dev/license
         */
        import {signal} from '@angular/core';
        const mySignal = signal(0);
      `,
    );
    expect(output).toContain('debugName: "\\u0275mySignal"');
  });
});
