/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/compiler';

import * as fs from 'fs';
import * as path from 'path';

describe('treeshaking with uglify', () => {
  let content: string;
  const contentPath = path.resolve('./bundles/main.js');
  beforeAll(() => {
    content = fs.readFileSync(contentPath, {encoding: 'utf-8'});
  });

  it('should not contain rxjs from commonjs distro', () => {
    expect(content).not.toContain('commonjsGlobal');
    expect(content).not.toContain('createCommonjsModule');
  });
});

describe('treeshaking with esbuild', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(path.resolve('./esbuild_bundle.js'), {encoding: 'utf-8'});
  });

  it('should not contain the DI graph AI tool', () => {
    expect(content).not.toContain('angular:di_graph');
    expect(content).not.toContain('Exposes the Angular Dependency Injection (DI) graph');
  });

  it('should not contain the signal graph AI tool', () => {
    expect(content).not.toContain('angular:signal_graph');
    expect(content).not.toContain('Exposes the Angular signal dependency graph');
  });

  it('should not contain the signal watcher finalization registry', () => {
    expect(content).not.toContain('FinalizationRegistry');
  });
});
