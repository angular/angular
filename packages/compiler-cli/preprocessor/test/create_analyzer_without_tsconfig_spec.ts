/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createAnalyzer, createAnalyzerWithInfo} from '../api.js';
import {HybridCompiler} from '../src/hybrid_compiler.js';
import {resolveFixtureNodeModules, resolveWasmBinding} from './utils.js';

const COMP_PATH = '/app/src/my_comp.ts';
const COMP_CONTENT = `import {Component} from '@angular/core';

@Component({
  selector: 'my-comp',
  template: '<div>Hello</div>',
})
export class MyComp {}
`;

describe('createAnalyzer without a tsconfig', () => {
  it('analyzes the program closure of explicit entry points', async () => {
    const virtualFiles = {[COMP_PATH]: COMP_CONTENT};
    const analyzer = await createAnalyzer({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles,
      optimize: false,
      entryPoints: [COMP_PATH],
      defaultHost: {
        rootDirs: ['/app'],
        nodeModulesPathOverride: resolveFixtureNodeModules(),
      },
    });

    const metadata = await analyzer.getMetadataForFile(COMP_PATH);
    expect(metadata?.classes.map((c) => c.className)).toEqual(['MyComp']);

    const compiler = new HybridCompiler(analyzer, {
      optimize: false,
      virtualFiles,
      rootDirs: ['/app'],
    });
    const processed = await compiler.processFile(COMP_PATH, COMP_CONTENT);
    expect(processed.magicString.toString()).toContain('ɵɵdefineComponent');
  });

  it('reports the loaded backend for the options-only form', async () => {
    const {backend} = await createAnalyzerWithInfo({
      backend: 'wasm',
      wasmBinding: resolveWasmBinding(),
      virtualFiles: {[COMP_PATH]: COMP_CONTENT},
      entryPoints: [COMP_PATH],
    });
    expect(backend).toBe('wasm');
  });

  it('rejects relative entry points', async () => {
    await expectAsync(
      createAnalyzer({
        backend: 'wasm',
        wasmBinding: resolveWasmBinding(),
        virtualFiles: {[COMP_PATH]: COMP_CONTENT},
        entryPoints: ['src/my_comp.ts'],
      }),
    ).toBeRejectedWithError(/must be an absolute path when no tsconfig is given/);
  });
});
