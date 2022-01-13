/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

import {absoluteFrom} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('import generation', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles, absoluteFrom('/app'));
      const tsconfig: {[key: string]: any} = {
        extends: '../tsconfig-base.json',
        compilerOptions: {
          baseUrl: '.',
          rootDirs: ['/app'],
        },
        angularCompilerOptions: {},
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    });

    it('should report an error when using a directive outside of rootDirs', () => {
      env.write('/app/module.ts', `
        import {NgModule} from '@angular/core';
        import {ExternalDir} from '../lib/dir';
        import {MyComponent} from './comp';

        @NgModule({
          declarations: [ExternalDir, MyComponent],
        })
        export class MyModule {}
      `);
      env.write('/app/comp.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '<div external></div>',
        })
        export class MyComponent {}
      `);
      env.write('/lib/dir.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[external]'})
        export class ExternalDir {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n'))
          .toEqual(`Unable to import class ExternalDir.
  The file ${absoluteFrom('/lib/dir.ts')} is outside of the configured 'rootDir'.`);
      expect(diags[0].file!.fileName).toEqual(absoluteFrom('/app/module.ts'));
      expect(getDiagnosticSourceCode(diags[0])).toEqual('ExternalDir');
    });

    it('should report an error when a library entry-point does not export the symbol', () => {
      env.write('/app/module.ts', `
        import {NgModule} from '@angular/core';
        import {ExternalModule} from 'lib';
        import {MyComponent} from './comp';

        @NgModule({
          imports: [ExternalModule],
          declarations: [MyComponent],
        })
        export class MyModule {}
      `);
      env.write('/app/comp.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '<div external></div>',
        })
        export class MyComponent {}
      `);
      env.write('/node_modules/lib/index.d.ts', `
        import {ɵɵNgModuleDeclaration} from '@angular/core';
        import {ExternalDir} from './dir';

        export class ExternalModule {
          static ɵmod: ɵɵNgModuleDeclaration<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
        }
      `);
      env.write('/node_modules/lib/dir.d.ts', `
        import {ɵɵDirectiveDeclaration} from '@angular/core';

        export class ExternalDir {
          static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[external]', never, never, never, never>;
        }
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n'))
          .toEqual(`Unable to import directive ExternalDir.
  The symbol is not exported from ${absoluteFrom('/node_modules/lib/index.d.ts')} (module 'lib').`);
      expect(diags[0].file!.fileName).toEqual(absoluteFrom('/app/comp.ts'));
      expect(getDiagnosticSourceCode(diags[0])).toEqual('MyComponent');
    });
  });
});

function getDiagnosticSourceCode(diag: ts.Diagnostic): string {
  return diag.file!.text.substring(diag.start!, diag.start! + diag.length!);
}
