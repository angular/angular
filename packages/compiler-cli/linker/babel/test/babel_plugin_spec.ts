/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import babel from '@babel/core';

describe('default babel plugin entry-point', () => {
  it('should work as a Babel plugin using the module specifier', async () => {
    const result = (await babel.transformAsync(
        `
        import * as i0 from "@angular/core";

        export class MyMod {}
        export class MyComponent {}

        MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [MyComponent] });
       `,
        {
          plugins: [
            '@angular/compiler-cli/linker/babel/index.mjs',
          ],
          filename: 'test.js',
        }))!;

    expect(result).not.toBeNull();
    expect(result.code).not.toContain('ɵɵngDeclareNgModule');
    expect(result.code).toContain('i0.ɵɵdefineNgModule');
    expect(result.code).not.toMatch(/declarations:\s*\[MyComponent]/);
  });

  it('should be configurable', async () => {
    const result = (await babel.transformAsync(
        `
        import * as i0 from "@angular/core";

        export class MyMod {}
        export class MyComponent {}

        MyMod.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyMod, declarations: [MyComponent] });
       `,
        {
          plugins: [
            ['@angular/compiler-cli/linker/babel/index.mjs', {linkerJitMode: true}],
          ],
          filename: 'test.js',
        }))!;

    expect(result).not.toBeNull();
    expect(result.code).not.toContain('ɵɵngDeclareNgModule');
    expect(result.code).toContain('i0.ɵɵdefineNgModule');
    expect(result.code).toMatch(/declarations:\s*\[MyComponent]/);
  });
});
