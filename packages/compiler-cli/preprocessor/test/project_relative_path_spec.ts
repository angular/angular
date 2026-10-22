/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createAnalyzer} from '../api.js';
import {HybridCompiler, type IAnalyzer} from '../src/hybrid_compiler.js';
import {resolveFixtureNodeModules, resolveWasmBinding} from './utils.js';

describe('HybridCompiler project-relative path resolution across rootDirs', () => {
  it('emits ɵsetClassDebugInfo filePath from rootDirs even when rootDir is unset', async () => {
    const compPath = '/workspace/bazel-out/k8-fastbuild/bin/pkg/my_comp.ts';
    const content = `import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '<div>Hello</div>',
})
export class MyComp {}
`;
    const virtualFiles: Record<string, string> = {
      '/workspace/tsconfig.json': JSON.stringify({
        compilerOptions: {
          rootDirs: ['/workspace', '/workspace/bazel-out/k8-fastbuild/bin'],
        },
        files: [compPath],
      }),
      [compPath]: content,
    };

    const analyzer = await createAnalyzer('/workspace/tsconfig.json', {
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: false,
      nodeModulesPathOverride: resolveFixtureNodeModules(),
      rootDirs: ['/workspace', '/workspace/bazel-out/k8-fastbuild/bin'],
    });
    const compiler = new HybridCompiler(analyzer, {
      optimize: false,
      tsconfigPath: '/workspace/tsconfig.json',
      virtualFiles,
      rootDirs: ['/workspace', '/workspace/bazel-out/k8-fastbuild/bin'],
      // Intentionally omit `rootDir`.
    });

    const processed = await compiler.processFile(compPath, content);
    const emitted = processed.magicString.toString();
    expect(emitted).toContain("filePath: 'pkg/my_comp.ts'");
    expect(emitted).toContain('lineNumber: 7');
  });

  it('uses shortest relative path across nested rootDirs for HMR component ID and HMR update module', async () => {
    const compPath = '/workspace/bazel-out/k8-fastbuild/bin/pkg/my_comp.ts';
    const content = `import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '<div>Hello HMR</div>',
})
export class MyComp {}
`;
    const virtualFiles: Record<string, string> = {
      '/workspace/tsconfig.json': JSON.stringify({
        compilerOptions: {
          rootDirs: ['/workspace', '/workspace/bazel-out/k8-fastbuild/bin'],
        },
        files: [compPath],
      }),
      [compPath]: content,
    };

    const analyzer = await createAnalyzer('/workspace/tsconfig.json', {
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: false,
      nodeModulesPathOverride: resolveFixtureNodeModules(),
      rootDirs: ['/workspace', '/workspace/bazel-out/k8-fastbuild/bin'],
    });
    const compiler = new HybridCompiler(analyzer, {
      optimize: false,
      tsconfigPath: '/workspace/tsconfig.json',
      virtualFiles,
      enableHmr: true,
      rootDir: '/workspace',
      rootDirs: ['/workspace', '/workspace/bazel-out/k8-fastbuild/bin'],
    });

    const processed = await compiler.processFile(compPath, content);
    const emitted = processed.magicString.toString();
    const expectedHmrId = encodeURIComponent('pkg/my_comp.ts@MyComp');
    expect(emitted).toContain(expectedHmrId);
    expect(emitted).not.toContain(
      encodeURIComponent('bazel-out/k8-fastbuild/bin/pkg/my_comp.ts@MyComp'),
    );

    const hmrUpdateModule = await compiler.emitHmrUpdateModule(compPath, 'MyComp');
    expect(hmrUpdateModule).not.toBeNull();
    expect(hmrUpdateModule!).toContain("filePath: 'pkg/my_comp.ts'");
    expect(hmrUpdateModule!).not.toContain('bazel-out/k8-fastbuild/bin/pkg/my_comp.ts');
  });

  it('resolves relative rootDirs against dirname(tsconfigPath) when rootDir is not provided', () => {
    const compiler = new HybridCompiler({} as IAnalyzer, {
      tsconfigPath: '/workspace/tsconfig.json',
      rootDirs: ['.', 'bazel-out/k8-fastbuild/bin'],
    });
    expect(compiler.rootDirs).toEqual(['/workspace', '/workspace/bazel-out/k8-fastbuild/bin']);
  });
});
