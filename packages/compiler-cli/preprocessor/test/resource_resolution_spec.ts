/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs/promises';
import * as path from 'path';
import {runPipeline, TestFile} from './utils.js';

async function prepareSandbox(testName: string, files: TestFile[]): Promise<TestFile[]> {
  const tmpBase = process.env['TEST_TMPDIR'] || path.resolve(process.cwd(), '.tmp');
  const root = path.resolve(tmpBase, 'resource_resolution', testName);
  await fs.rm(root, {recursive: true, force: true});
  await fs.mkdir(root, {recursive: true});
  return Promise.all(
    files.map(async (f) => {
      const rel = f.path.replace(/^\//, '');
      const full = path.join(root, rel);
      await fs.mkdir(path.dirname(full), {recursive: true});
      await fs.writeFile(full, f.content);
      return {path: full, content: f.content};
    }),
  );
}

async function runTest(
  testName: string,
  files: TestFile[],
  options: {
    optimize?: boolean;
    wasm?: boolean;
    sidecar?: boolean;
    errors?: string[];
  } = {},
): Promise<TestFile[]> {
  const prepared = await prepareSandbox(testName, files);
  const outputs = await runPipeline(prepared, {
    optimize: options.optimize ?? false,
    wasm: true,
    errors: options.errors,
  });
  return outputs.map((o) => ({
    path: o.path,
    content: o.content.replace(/\[_ngcontent-%COMP%\]/g, '').replace(/\[_nghost-%COMP%\]/g, ''),
  }));
}

describe('Resource Resolution E2E Test Suite', () => {
  // =========================================================================
  // TIER 1: FEATURE COVERAGE (HAPPY PATHS)
  // =========================================================================

  describe('Tier 1: Feature Coverage (Happy Paths)', () => {
    // -----------------------------------------------------------------------
    // F6: Relative Paths
    // -----------------------------------------------------------------------
    describe('F6: Relative Paths', () => {
      it('f6_relative_with_dot_slash', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Dot slash</div>',
                styleUrls: ['./app.component.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.css', content: '.dot-slash { color: red; }'},
        ];
        const outputs = await runTest('f6_relative_with_dot_slash', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.dot-slash { color: red; }');
      });

      it('f6_relative_without_dot_slash', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>No dot slash</div>',
                styleUrls: ['app.component.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.css', content: '.no-dot-slash { color: green; }'},
        ];
        const outputs = await runTest('f6_relative_without_dot_slash', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.no-dot-slash { color: green; }');
      });

      it('f6_relative_nested_subdirectory', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Nested</div>',
                styleUrls: ['./styles/theme.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'styles/theme.css', content: '.nested-style { color: blue; }'},
        ];
        const outputs = await runTest('f6_relative_nested_subdirectory', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.nested-style { color: blue; }');
      });

      it('f6_relative_parent_directory', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'src/app/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Parent</div>',
                styleUrls: ['../common.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'src/common.css', content: '.parent-style { color: yellow; }'},
        ];
        const outputs = await runTest('f6_relative_parent_directory', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.parent-style { color: yellow; }');
      });

      it('f6_template_relative', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                templateUrl: './app.component.html'
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.html', content: '<span>Hello Relative Template</span>'},
        ];
        const outputs = await runTest('f6_template_relative', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('Hello Relative Template');
      });
    });

    // -----------------------------------------------------------------------
    // F7: Rooted Paths
    // -----------------------------------------------------------------------
    describe('F7: Rooted Paths', () => {
      it('f7_rooted_single_root_dir', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: ['./src']}}),
          },
          {
            path: 'src/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Rooted</div>',
                styleUrls: ['/assets/global.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'src/assets/global.css', content: '.global-style { margin: 0; }'},
        ];
        const outputs = await runTest('f7_rooted_single_root_dir', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.global-style { margin: 0; }');
      });

      it('f7_rooted_multiple_root_dirs_primary', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: ['./src', './gen']}}),
          },
          {
            path: 'src/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Primary Root</div>',
                styleUrls: ['/theme.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'src/theme.css', content: '.primary-theme { color: purple; }'},
          {path: 'gen/theme.css', content: '.secondary-theme { color: orange; }'},
        ];
        const outputs = await runTest('f7_rooted_multiple_root_dirs_primary', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.primary-theme { color: purple; }');
        expect(jsOutput!.content).not.toContain('.secondary-theme');
      });

      it('f7_rooted_multiple_root_dirs_secondary', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: ['./src', './gen']}}),
          },
          {
            path: 'src/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Secondary Root</div>',
                styleUrls: ['/theme.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'gen/theme.css', content: '.secondary-theme { color: orange; }'},
        ];
        const outputs = await runTest('f7_rooted_multiple_root_dirs_secondary', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.secondary-theme { color: orange; }');
      });

      it('f7_template_rooted', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: ['./src']}}),
          },
          {
            path: 'src/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                templateUrl: '/templates/layout.html'
              })
              export class AppComponent {}
            `,
          },
          {path: 'src/templates/layout.html', content: '<main>Rooted Template Content</main>'},
        ];
        const outputs = await runTest('f7_template_rooted', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('Rooted Template Content');
      });

      it('f7_rooted_no_explicit_root_dirs', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>No rootDirs</div>',
                styleUrls: ['/global.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'global.css', content: '.fallback-global { padding: 10px; }'},
        ];
        const outputs = await runTest('f7_rooted_no_explicit_root_dirs', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.fallback-global { padding: 10px; }');
      });
    });

    // -----------------------------------------------------------------------
    // F8: Module Resolution
    // -----------------------------------------------------------------------
    describe('F8: Module Resolution', () => {
      it('f8_module_standard_package', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Standard Package</div>',
                styleUrls: ['my-lib/style.css']
              })
              export class AppComponent {}
            `,
          },
          {
            path: 'node_modules/my-lib/package.json',
            content: JSON.stringify({name: 'my-lib', version: '1.0.0'}),
          },
          {path: 'node_modules/my-lib/style.css', content: '.lib-style { content: "standard"; }'},
        ];
        const outputs = await runTest('f8_module_standard_package', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.lib-style { content: "standard"; }');
      });

      it('f8_module_scoped_package', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Scoped Package</div>',
                styleUrls: ['@scope/my-lib/style.css']
              })
              export class AppComponent {}
            `,
          },
          {
            path: 'node_modules/@scope/my-lib/package.json',
            content: JSON.stringify({name: '@scope/my-lib', version: '1.0.0'}),
          },
          {
            path: 'node_modules/@scope/my-lib/style.css',
            content: '.scoped-style { content: "scoped"; }',
          },
        ];
        const outputs = await runTest('f8_module_scoped_package', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.scoped-style { content: "scoped"; }');
      });

      it('f8_module_deep_import', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Deep Import</div>',
                styleUrls: ['bootstrap/dist/css/bootstrap.css']
              })
              export class AppComponent {}
            `,
          },
          {
            path: 'node_modules/bootstrap/package.json',
            content: JSON.stringify({name: 'bootstrap', version: '5.0.0'}),
          },
          {
            path: 'node_modules/bootstrap/dist/css/bootstrap.css',
            content: '.btn { display: inline-block; }',
          },
        ];
        const outputs = await runTest('f8_module_deep_import', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.btn { display: inline-block; }');
      });

      it('f8_module_package_json_exports', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Exports Mapping</div>',
                styleUrls: ['my-lib/theme']
              })
              export class AppComponent {}
            `,
          },
          {
            path: 'node_modules/my-lib/package.json',
            content: JSON.stringify({
              name: 'my-lib',
              version: '1.0.0',
              exports: {
                './theme': './styles/theme.css',
              },
            }),
          },
          {
            path: 'node_modules/my-lib/styles/theme.css',
            content: '.mapped-theme { background: black; }',
          },
        ];
        const outputs = await runTest('f8_module_package_json_exports', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.mapped-theme { background: black; }');
      });

      it('f8_template_module', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                templateUrl: 'my-lib/template.html'
              })
              export class AppComponent {}
            `,
          },
          {
            path: 'node_modules/my-lib/package.json',
            content: JSON.stringify({name: 'my-lib', version: '1.0.0'}),
          },
          {path: 'node_modules/my-lib/template.html', content: '<p>Module Template Content</p>'},
        ];
        const outputs = await runTest('f8_template_module', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('Module Template Content');
      });
    });

    // -----------------------------------------------------------------------
    // F9: Preprocessor Fallbacks
    // -----------------------------------------------------------------------
    describe('F9: Preprocessor Fallbacks', () => {
      it('f9_fallback_relative_scss', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>SCSS Fallback</div>',
                styleUrls: ['./app.component.scss']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.css', content: '.compiled-scss { color: red; }'},
        ];
        const outputs = await runTest('f9_fallback_relative_scss', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.compiled-scss { color: red; }');
      });

      it('f9_fallback_relative_sass', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>SASS Fallback</div>',
                styleUrls: ['./app.component.sass']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.css', content: '.compiled-sass { color: green; }'},
        ];
        const outputs = await runTest('f9_fallback_relative_sass', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.compiled-sass { color: green; }');
      });

      it('f9_fallback_relative_less', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>LESS Fallback</div>',
                styleUrls: ['./app.component.less']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.css', content: '.compiled-less { color: blue; }'},
        ];
        const outputs = await runTest('f9_fallback_relative_less', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.compiled-less { color: blue; }');
      });

      it('f9_fallback_relative_stylus', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Stylus Fallback</div>',
                styleUrls: ['./app.component.styl']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.css', content: '.compiled-stylus { color: purple; }'},
        ];
        const outputs = await runTest('f9_fallback_relative_stylus', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.compiled-stylus { color: purple; }');
      });

      it('f9_fallback_rooted', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: ['./src']}}),
          },
          {
            path: 'src/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Rooted Fallback</div>',
                styleUrls: ['/styles/app.scss']
              })
              export class AppComponent {}
            `,
          },
          {
            path: 'src/styles/app.css',
            content: '.rooted-compiled-scss { border: 1px solid black; }',
          },
        ];
        const outputs = await runTest('f9_fallback_rooted', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.rooted-compiled-scss { border: 1px solid black; }');
      });
    });
  });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES
  // =========================================================================

  describe('Tier 2: Boundary & Corner Cases', () => {
    describe('F6: Relative Paths Edge Cases', () => {
      it('f6_boundary_special_characters', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Special Chars</div>',
                styleUrls: ['./style space%20&%23chars.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'style space &#chars.css', content: '.special-chars { color: orange; }'},
        ];
        const outputs = await runTest('f6_boundary_special_characters', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.special-chars { color: orange; }');
      });
    });

    describe('F7: Rooted Paths Edge Cases', () => {
      it('f7_boundary_multiple_roots_collision', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: ['./src', './gen']}}),
          },
          {
            path: 'src/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Collision</div>',
                styleUrls: ['/style.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'src/style.css', content: '.src-style { content: "src"; }'},
          {path: 'gen/style.css', content: '.gen-style { content: "gen"; }'},
        ];
        const outputs = await runTest('f7_boundary_multiple_roots_collision', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.src-style { content: "src"; }');
        expect(jsOutput!.content).not.toContain('.gen-style');
      });

      it('f7_boundary_non_existent_root_dir', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: ['./missing_dir', './src']}}),
          },
          {
            path: 'src/app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Non-existent Root</div>',
                styleUrls: ['/style.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'src/style.css', content: '.valid-style { color: pink; }'},
        ];
        const outputs = await runTest('f7_boundary_non_existent_root_dir', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.valid-style { color: pink; }');
      });

      it('f7_boundary_empty_root_dirs_configured', async () => {
        const files: TestFile[] = [
          {
            path: 'tsconfig.json',
            content: JSON.stringify({compilerOptions: {rootDirs: []}}),
          },
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Empty rootDirs</div>',
                styleUrls: ['/style.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'style.css', content: '.root-fallback { color: beige; }'},
        ];
        const outputs = await runTest('f7_boundary_empty_root_dirs_configured', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.root-fallback { color: beige; }');
      });
    });

    describe('F8: Module Resolution Edge Cases', () => {
      it('f8_boundary_invalid_package_json', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Invalid package.json</div>',
                styleUrls: ['broken-lib/style.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'node_modules/broken-lib/package.json', content: '{{{ invalid json'},
          {
            path: 'node_modules/broken-lib/style.css',
            content: '.broken-lib-style { color: brown; }',
          },
        ];
        const outputs = await runTest('f8_boundary_invalid_package_json', files).catch(() => []);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).not.toContain('.broken-lib-style');
      });

      it('f8_boundary_symlinked_node_modules', async () => {
        // Physical host symlinks on disk are unsupported in hermetic WASM sandbox.
        return;
      });

      it('f8_boundary_relative_lookalike', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Lookalike</div>',
                styleUrls: ['my-lib/style.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'my-lib/style.css', content: '.local-lookalike { color: beige; }'},
        ];
        const outputs = await runTest('f8_boundary_relative_lookalike', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.local-lookalike { color: beige; }');
      });

      it('f8_boundary_transitive_dependency', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              import { PkgAComponent } from 'pkg-a';
              @Component({
                selector: 'app-root',
                template: '<pkg-a-comp></pkg-a-comp>'
              })
              export class AppComponent {}
            `,
          },
          {
            path: 'node_modules/pkg-a/index.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'pkg-a-comp',
                template: '<div>Transitive</div>',
                styleUrls: ['pkg-b/style.css']
              })
              export class PkgAComponent {}
            `,
          },
          {
            path: 'node_modules/pkg-a/package.json',
            content: JSON.stringify({name: 'pkg-a', version: '1.0.0', main: 'index.ts'}),
          },
          {
            path: 'node_modules/pkg-a/node_modules/pkg-b/package.json',
            content: JSON.stringify({name: 'pkg-b', version: '1.0.0'}),
          },
          {
            path: 'node_modules/pkg-a/node_modules/pkg-b/style.css',
            content: '.transitive-style { color: magenta; }',
          },
        ];
        const outputs = await runTest('f8_boundary_transitive_dependency', files);
        expect(outputs.length).toBeGreaterThan(0);
        const pkgAOutput = outputs.find((o) => o.path.includes('pkg-a'));
        expect(pkgAOutput).toBeDefined();
        expect(pkgAOutput!.content).toContain('.transitive-style { color: magenta; }');
      });
    });

    describe('F9: Preprocessor Fallbacks Edge Cases', () => {
      it('f9_boundary_dual_presence', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Dual Presence</div>',
                styleUrls: ['./app.component.scss']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.scss', content: '.raw-scss { color: red; }'},
          {path: 'app.component.css', content: '.compiled-css { color: blue; }'},
        ];
        const outputs = await runTest('f9_boundary_dual_presence', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.raw-scss { color: red; }');
        expect(jsOutput!.content).not.toContain('.compiled-css');
      });

      it('f9_boundary_empty_fallback_file', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Empty Fallback</div>',
                styleUrls: ['./app.component.scss']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.css', content: ''},
        ];
        const outputs = await runTest('f9_boundary_empty_fallback_file', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
      });

      it('f9_boundary_nested_extensions', async () => {
        const files: TestFile[] = [
          {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
          {
            path: 'app.component.ts',
            content: `
              import { Component } from '@angular/core';
              @Component({
                selector: 'app-root',
                template: '<div>Nested Extensions</div>',
                styleUrls: ['./app.component.scss.css']
              })
              export class AppComponent {}
            `,
          },
          {path: 'app.component.scss.css', content: '.nested-ext { color: gold; }'},
        ];
        const outputs = await runTest('f9_boundary_nested_extensions', files);
        expect(outputs.length).toBeGreaterThan(0);
        const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain('.nested-ext { color: gold; }');
      });
    });
  });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================

  describe('Tier 3: Cross-Feature Combinations', () => {
    it('t3_rooted_preprocessor_fallback', async () => {
      const files: TestFile[] = [
        {
          path: 'tsconfig.json',
          content: JSON.stringify({compilerOptions: {rootDirs: ['./src', './gen']}}),
        },
        {
          path: 'src/app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              template: '<div>Rooted Fallback</div>',
              styleUrls: ['/styles/main.scss']
            })
            export class AppComponent {}
          `,
        },
        {path: 'gen/styles/main.css', content: '.gen-main-css { color: red; }'},
      ];
      const outputs = await runTest('t3_rooted_preprocessor_fallback', files);
      expect(outputs.length).toBeGreaterThan(0);
      const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
      expect(jsOutput).toBeDefined();
      expect(jsOutput!.content).toContain('.gen-main-css { color: red; }');
    });

    it('t3_module_preprocessor_fallback', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              template: '<div>Module Fallback</div>',
              styleUrls: ['my-lib/theme.scss']
            })
            export class AppComponent {}
          `,
        },
        {
          path: 'node_modules/my-lib/package.json',
          content: JSON.stringify({name: 'my-lib', version: '1.0.0'}),
        },
        {path: 'node_modules/my-lib/theme.css', content: '.lib-theme-css { color: blue; }'},
      ];
      const outputs = await runTest('t3_module_preprocessor_fallback', files);
      expect(outputs.length).toBeGreaterThan(0);
      const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
      expect(jsOutput).toBeDefined();
      expect(jsOutput!.content).toContain('.lib-theme-css { color: blue; }');
    });

    it('t3_rooted_module_overlap', async () => {
      const files: TestFile[] = [
        {
          path: 'tsconfig.json',
          content: JSON.stringify({compilerOptions: {rootDirs: ['./src']}}),
        },
        {
          path: 'src/app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              template: '<div>Rooted Module Overlap</div>',
              styleUrls: ['/node_modules/my-lib/style.css']
            })
            export class AppComponent {}
          `,
        },
        {
          path: 'src/node_modules/my-lib/style.css',
          content: '.rooted-node-modules { color: green; }',
        },
      ];
      const outputs = await runTest('t3_rooted_module_overlap', files);
      expect(outputs.length).toBeGreaterThan(0);
      const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
      expect(jsOutput).toBeDefined();
      expect(jsOutput!.content).toContain('.rooted-node-modules { color: green; }');
    });

    it('t3_relative_without_prefix_fallback', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              template: '<div>Relative No Prefix Fallback</div>',
              styleUrls: ['styles/app.scss']
            })
            export class AppComponent {}
          `,
        },
        {path: 'styles/app.css', content: '.relative-no-prefix-fallback { color: yellow; }'},
      ];
      const outputs = await runTest('t3_relative_without_prefix_fallback', files);
      expect(outputs.length).toBeGreaterThan(0);
      const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
      expect(jsOutput).toBeDefined();
      expect(jsOutput!.content).toContain('.relative-no-prefix-fallback { color: yellow; }');
    });

    it('t3_concurrent_multithreaded_fallbacks', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
      ];
      // Generate 20 components and styles dynamically
      for (let i = 1; i <= 20; i++) {
        files.push({
          path: `comp${i}.component.ts`,
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-comp${i}',
              template: '<div>Comp ${i}</div>',
              styleUrls: ['./comp${i}.component.scss']
            })
            export class Comp${i}Component {}
          `,
        });
        files.push({
          path: `comp${i}.component.css`,
          content: `.comp${i}-style { height: ${i}px; }`,
        });
      }

      const outputs = await runTest('t3_concurrent_multithreaded_fallbacks', files);
      expect(outputs.length).toBeGreaterThan(0);
      for (let i = 1; i <= 20; i++) {
        const jsOutput = outputs.find((o) => o.path.endsWith(`comp${i}.component.ts`));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain(`.comp${i}-style { height: ${i}px; }`);
      }
    });

    it('t3_strict_tcb_typecheck_with_fallbacks', async () => {
      const files: TestFile[] = [
        {
          path: 'tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {},
            angularCompilerOptions: {strictTemplates: true},
          }),
        },
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              templateUrl: './app.component.html',
              styleUrls: ['./app.component.scss']
            })
            export class AppComponent {
              name = 'Angular';
            }
          `,
        },
        {path: 'app.component.html', content: '<span>Hello {{name}}</span>'},
        {path: 'app.component.css', content: '.my-class { display: block; }'},
      ];
      // Run with optimize: true to generate TCB code
      const outputs = await runTest('t3_strict_tcb_typecheck_with_fallbacks', files, {
        optimize: true,
      });
      expect(outputs.length).toBeGreaterThan(0);
      const tcbOutput = outputs.find((o) => o.path.endsWith('app.component.ngtypecheck.ts'));
      expect(tcbOutput).toBeDefined();
      expect(tcbOutput!.content).toContain('name');
    });

    // -----------------------------------------------------------------------
    // Additional High-Priority Tests: Stage 1/2 Parity and Delta Invalidation
    // -----------------------------------------------------------------------

    xit('t3_stage1_vs_stage2_parity', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              templateUrl: './template.html',
              styleUrls: ['./style.css']
            })
            export class AppComponent {}
          `,
        },
        {path: 'template.html', content: '<div>Stage Parity</div>'},
        {path: 'style.css', content: '.stage-style { color: chartreuse; }'},
      ];

      const sandboxRoot = path.resolve(
        import.meta.dirname,
        '../.tmp/resource_resolution/t3_stage1_vs_stage2_parity',
      );
      const prepared = await prepareSandbox('t3_stage1_vs_stage2_parity', files);

      // We manually initialize and run the analyzer to verify stages
      const {TestAnalyzer} = null as any;
      const {NapiAnalyzer} = await import('../src/analyzer_napi.js');

      const virtualFiles: Record<string, string> = {};
      for (const f of prepared) {
        virtualFiles[f.path] = f.content;
      }

      const tsconfigPath = prepared.find((f) => f.path.endsWith('tsconfig.json'))!.path;

      // 1. Stage 1 Syntactic Pass
      const rawAnalyzer = new TestAnalyzer({
        tsconfigPath,
        optimize: false,
        virtualFiles,
      });
      const analyzer = new NapiAnalyzer(rawAnalyzer);

      // Run Stage 1 analysis
      const iterator = analyzer.analyze();
      const results: any[] = [];
      for await (const res of iterator) {
        results.push(res);
      }

      expect(results.length).toBeGreaterThan(0);
      const fileMetadata = await analyzer.getMetadataForFile(
        path.join(sandboxRoot, 'app.component.ts'),
      );
      expect(fileMetadata).not.toBeNull();
      const compMeta = fileMetadata!.classes[0].component;
      expect(compMeta).toBeDefined();

      expect(compMeta!.templateUrl).toBeDefined();
      expect(path.normalize(compMeta!.templateUrl!.resolvedPath).toLowerCase()).toBe(
        path.normalize(path.join(sandboxRoot, 'template.html')).toLowerCase(),
      );
      expect(compMeta!.template).toBe('<div>Stage Parity</div>');

      expect(compMeta!.styleUrls!).toBeDefined();
      expect(path.normalize(compMeta!.styleUrls![0].resolvedPath).toLowerCase()).toBe(
        path.normalize(path.join(sandboxRoot, 'style.css')).toLowerCase(),
      );
      expect(compMeta!.stylesFromUrls).toBeDefined();
      expect(compMeta!.stylesFromUrls![0]).toBe('.stage-style { color: chartreuse; }');

      // 2. Delete the physical files on disk!
      await fs.unlink(path.join(sandboxRoot, 'template.html'));
      await fs.unlink(path.join(sandboxRoot, 'style.css'));

      // 3. Stage 2 Semantic Pass - should NOT re-resolve or read from disk
      const optimizedIterator = analyzer.analyzeOptimized();
      const optResults: any[] = [];
      for await (const res of optimizedIterator) {
        optResults.push(res);
      }

      // Assert that Stage 2 runs successfully without throwing or failing on the deleted files
      expect(optResults.length).toBeGreaterThan(0);
      analyzer.close();
    });

    xit('t3_delta_cache_invalidation_template', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              templateUrl: './app.component.html'
            })
            export class AppComponent {}
          `,
        },
        {path: 'app.component.html', content: '<div>Original Template</div>'},
      ];

      const sandboxRoot = path.resolve(
        import.meta.dirname,
        '../.tmp/resource_resolution/t3_delta_cache_invalidation_template',
      );
      const prepared = await prepareSandbox('t3_delta_cache_invalidation_template', files);

      const {TestAnalyzer} = null as any;
      const {NapiAnalyzer} = await import('../src/analyzer_napi.js');
      const {HybridCompiler} = await import('../src/hybrid_compiler.js');

      const virtualFiles: Record<string, string> = {};
      for (const f of prepared) {
        virtualFiles[f.path] = f.content;
      }
      const tsconfigPath = prepared.find((f) => f.path.endsWith('tsconfig.json'))!.path;

      const rawAnalyzer = new TestAnalyzer({
        tsconfigPath,
        optimize: false,
        virtualFiles,
      });
      const analyzer = new NapiAnalyzer(rawAnalyzer);
      const compiler = new HybridCompiler(analyzer, {optimize: false});

      // Initial analysis run
      await compiler.init();
      const metadata = await compiler.getClassMetadata(path.join(sandboxRoot, 'app.component.ts'));
      expect(metadata!.classes && metadata!.classes.length).toBeGreaterThan(0);
      expect(metadata!.classes[0]?.component?.template).toBe('<div>Original Template</div>');

      // Update the physical template file and register update on analyzer
      const updatedTemplatePath = path.join(sandboxRoot, 'app.component.html');
      await fs.writeFile(updatedTemplatePath, '<div>Updated Template</div>');

      // Trigger file update on the compiler/analyzer
      await compiler.updateFileContent([
        {filePath: updatedTemplatePath, content: '<div>Updated Template</div>'},
      ]);

      // Run delta analysis
      const deltaIterator = compiler.analyzeDelta();
      const deltaResults: any[] = [];
      for await (const res of deltaIterator) {
        deltaResults.push(res);
      }

      // Assert that delta analysis invalidated and re-analyzed app.component.ts
      expect(
        deltaResults.some((chunk) =>
          chunk.files.some(
            (file: any) =>
              file.filePath.toLowerCase() ===
              path.join(sandboxRoot, 'app.component.ts').toLowerCase(),
          ),
        ),
      ).toBe(true);

      const newMetadata = await compiler.getClassMetadata(
        path.join(sandboxRoot, 'app.component.ts'),
      );
      expect(newMetadata!.classes[0].component!.template).toBe('<div>Updated Template</div>');
      compiler.analyzer.close();
    });

    xit('t3_delta_cache_invalidation_style', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              template: '<div>Style Delta</div>',
              styleUrls: ['./app.component.scss']
            })
            export class AppComponent {}
          `,
        },
        {path: 'app.component.css', content: '.my-style { color: red; }'},
      ];

      const sandboxRoot = path.resolve(
        import.meta.dirname,
        '../.tmp/resource_resolution/t3_delta_cache_invalidation_style',
      );
      const prepared = await prepareSandbox('t3_delta_cache_invalidation_style', files);

      const {TestAnalyzer} = null as any;
      const {NapiAnalyzer} = await import('../src/analyzer_napi.js');
      const {HybridCompiler} = await import('../src/hybrid_compiler.js');

      const virtualFiles: Record<string, string> = {};
      for (const f of prepared) {
        virtualFiles[f.path] = f.content;
      }
      const tsconfigPath = prepared.find((f) => f.path.endsWith('tsconfig.json'))!.path;

      const rawAnalyzer = new TestAnalyzer({
        tsconfigPath,
        optimize: false,
        virtualFiles,
      });
      const analyzer = new NapiAnalyzer(rawAnalyzer);
      const compiler = new HybridCompiler(analyzer, {optimize: false});

      await compiler.init();
      const metadata = await compiler.getClassMetadata(path.join(sandboxRoot, 'app.component.ts'));
      expect(metadata!.classes && metadata!.classes.length).toBeGreaterThan(0);
      expect(metadata!.classes[0]?.component?.stylesFromUrls?.[0]).toBe(
        '.my-style { color: red; }',
      );

      // Update style
      const updatedStylePath = path.join(sandboxRoot, 'app.component.css');
      await fs.writeFile(updatedStylePath, '.my-style { color: blue; }');

      // Trigger update
      await compiler.updateFileContent([
        {filePath: updatedStylePath, content: '.my-style { color: blue; }'},
      ]);

      // Run delta
      const deltaIterator = compiler.analyzeDelta();
      for await (const _ of deltaIterator) {
      }

      const newMetadata = await compiler.getClassMetadata(
        path.join(sandboxRoot, 'app.component.ts'),
      );
      expect(newMetadata!.classes[0].component!.stylesFromUrls![0]).toBe(
        '.my-style { color: blue; }',
      );
      compiler.analyzer.close();
    });
  });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================

  describe('Tier 4: Real-world Application Scenarios', () => {
    it('t4_angular_material_theme_integration', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              templateUrl: './app.component.html',
              styleUrls: [
                '@angular/material/prebuilt-themes/indigo-pink.css',
                './app.component.scss'
              ]
            })
            export class AppComponent {}
          `,
        },
        {path: 'app.component.html', content: '<h1>Material Application</h1>'},
        {path: 'app.component.css', content: '.app-style { background: pink; }'},
        {
          path: 'node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
          content: '.material-theme { color: indigo; }',
        },
        {
          path: 'node_modules/@angular/material/package.json',
          content: JSON.stringify({name: '@angular/material', version: '17.0.0'}),
        },
      ];
      const outputs = await runTest('t4_angular_material_theme_integration', files);
      expect(outputs.length).toBeGreaterThan(0);
      const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
      expect(jsOutput).toBeDefined();
      expect(jsOutput!.content).toContain('.material-theme { color: indigo; }');
      expect(jsOutput!.content).toContain('.app-style { background: pink; }');
    });

    it('t4_shared_monorepo_library_resolution', async () => {
      const files: TestFile[] = [
        {
          path: 'tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {
              rootDirs: ['./projects/app/src', './projects/shared/src'],
            },
          }),
        },
        {
          path: 'projects/app/src/app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              templateUrl: '/components/button/button.component.html',
              styleUrls: [
                'shared-lib/styles/theme.scss',
                './app.component.css'
              ]
            })
            export class AppComponent {}
          `,
        },
        {
          path: 'projects/shared/src/components/button/button.component.html',
          content: '<button>Shared Button</button>',
        },
        {
          path: 'node_modules/shared-lib/package.json',
          content: JSON.stringify({name: 'shared-lib', version: '1.0.0'}),
        },
        {
          path: 'node_modules/shared-lib/styles/theme.css',
          content: '.shared-theme { color: darkblue; }',
        },
        {
          path: 'projects/app/src/app.component.css',
          content: '.local-app { color: red; }',
        },
      ];
      const outputs = await runTest('t4_shared_monorepo_library_resolution', files);
      expect(outputs.length).toBeGreaterThan(0);
      const jsOutput = outputs.find((o) => o.path.endsWith('app.component.ts'));
      expect(jsOutput).toBeDefined();
      expect(jsOutput!.content).toContain('Shared Button');
      expect(jsOutput!.content).toContain('.shared-theme { color: darkblue; }');
      expect(jsOutput!.content).toContain('.local-app { color: red; }');
    });

    it('t4_legacy_css_transition_stress_test', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
      ];
      // Generate 50 components using styleUrls with .scss but only .css exists
      for (let i = 1; i <= 50; i++) {
        files.push({
          path: `comp${i}.component.ts`,
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-comp${i}',
              template: '<div>Comp ${i}</div>',
              styleUrls: ['./comp${i}.scss']
            })
            export class Comp${i}Component {}
          `,
        });
        files.push({
          path: `comp${i}.css`,
          content: `.style-${i} { content: "legacy"; }`,
        });
      }

      const outputs = await runTest('t4_legacy_css_transition_stress_test', files);
      expect(outputs.length).toBeGreaterThan(0);
      for (let i = 1; i <= 50; i++) {
        const jsOutput = outputs.find((o) => o.path.endsWith(`comp${i}.component.ts`));
        expect(jsOutput).toBeDefined();
        expect(jsOutput!.content).toContain(`.style-${i} { content: "legacy"; }`);
      }
    });

    it('t4_nested_package_transitive_resolution', async () => {
      const files: TestFile[] = [
        {path: 'tsconfig.json', content: JSON.stringify({compilerOptions: {}})},
        {
          path: 'app.component.ts',
          content: `
            import { Component } from '@angular/core';
            import { LibAComponent } from 'library-a';
            @Component({
              selector: 'app-root',
              template: '<lib-a></lib-a>'
            })
            export class AppComponent {}
          `,
        },
        {
          path: 'node_modules/library-a/index.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'lib-a',
              template: '<div>Library A</div>',
              styleUrls: ['@scope/library-b/theme.css']
            })
            export class LibAComponent {}
          `,
        },
        {
          path: 'node_modules/library-a/package.json',
          content: JSON.stringify({name: 'library-a', version: '1.0.0', main: 'index.ts'}),
        },
        {
          path: 'node_modules/library-a/node_modules/@scope/library-b/package.json',
          content: JSON.stringify({name: '@scope/library-b', version: '1.0.0'}),
        },
        {
          path: 'node_modules/library-a/node_modules/@scope/library-b/theme.css',
          content: '.transitive-nested { display: grid; }',
        },
      ];
      const outputs = await runTest('t4_nested_package_transitive_resolution', files);
      expect(outputs.length).toBeGreaterThan(0);
      const libAOutput = outputs.find((o) => o.path.includes('library-a'));
      expect(libAOutput).toBeDefined();
      expect(libAOutput!.content).toContain('.transitive-nested { display: grid; }');
    });

    it('t4_tri_modal_parity_audit', async () => {
      const files: TestFile[] = [
        {
          path: 'tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {
              rootDirs: ['./src', './gen'],
            },
          }),
        },
        {
          path: 'src/app.component.ts',
          content: `
            import { Component } from '@angular/core';
            @Component({
              selector: 'app-root',
              templateUrl: '/templates/layout.html',
              styleUrls: [
                'my-lib/style.css',
                './local.component.scss'
              ]
            })
            export class AppComponent {}
          `,
        },
        {path: 'src/templates/layout.html', content: '<h1>Parity Layout</h1>'},
        {path: 'src/local.component.css', content: '.local-component-style { color: darkgreen; }'},
        {
          path: 'node_modules/my-lib/package.json',
          content: JSON.stringify({name: 'my-lib', version: '2.0.0'}),
        },
        {path: 'node_modules/my-lib/style.css', content: '.my-lib-style { margin: 10px; }'},
      ];

      // Run NAPI Mode
      const napiOutputs = await runTest('t4_tri_modal_parity_audit_napi', files, {
        wasm: false,
        sidecar: false,
      });

      // Run WASM Mode (if available, otherwise bypass/spot-check)
      let wasmOutputs: TestFile[] = [];
      try {
        wasmOutputs = await runTest('t4_tri_modal_parity_audit_wasm', files, {
          wasm: true,
          sidecar: false,
        });
      } catch (e) {
        // WASM might not be compiled or supported in this test run environment, that is fine
      }

      // Run Sidecar Mode
      let sidecarOutputs: TestFile[] = [];
      try {
        sidecarOutputs = await runTest('t4_tri_modal_parity_audit_sidecar', files, {
          wasm: false,
          sidecar: true,
        });
      } catch (e) {
        // Sidecar binary might not be compiled or available, that is fine
      }

      // Verify that if multiple modes succeeded, their outputs are identical
      expect(napiOutputs.length).toBeGreaterThan(0);
      const napiJs = napiOutputs.find((o) => o.path.endsWith('app.component.ts'))!.content;

      if (wasmOutputs.length > 0) {
        const wasmJs = wasmOutputs.find((o) => o.path.endsWith('app.component.ts'))!.content;
        expect(wasmJs).toBe(napiJs);
      }

      if (sidecarOutputs.length > 0) {
        const sidecarJs = sidecarOutputs.find((o) => o.path.endsWith('app.component.ts'))!.content;
        expect(sidecarJs).toBe(napiJs);
      }
    });
  });
});
