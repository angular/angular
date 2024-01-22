/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('Http providers migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-http-providers', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile(
        '/tsconfig.json',
        JSON.stringify({
          compilerOptions: {
            lib: ['es2015'],
            strictNullChecks: true,
          },
        }),
    );

    writeFile(
        '/angular.json',
        JSON.stringify({
          version: 1,
          projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
        }),
    );

    previousWorkingDir = shx.pwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    shx.cd(tmpDirPath);
  });

  afterEach(() => {
    shx.cd(previousWorkingDir);
    shx.rm('-r', tmpDirPath);
  });

  it('should replace HttpClienModule', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule, HttpTransferCacheOptions } from '@angular/common/http';
         import { CommonModule } from '@angular/common';
    @NgModule({
      imports: [CommonModule, HttpClientModule,HttpClientJsonpModule, RouterModule.forRoot([]), HttpClientXsrfModule.withOptions({cookieName: 'foobar'})],
    })
    export class AppModule {}`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).not.toContain(`HttpClientXsrfModule`);
    expect(content).not.toContain(`HttpClientJsonpModule`);
    expect(content).toContain(`HttpTransferCacheOptions`);
    expect(content).toMatch(/import.*provideHttpClient/);
    expect(content).toMatch(/import.*withInterceptorsFromDi/);
    expect(content).toMatch(/import.*withJsonpSupport/);
    expect(content).toMatch(/import.*withXsrfConfiguration/);
    expect(content).toContain(
        `provideHttpClient(withInterceptorsFromDi(), withJsonpSupport(), withXsrfConfiguration({ cookieName: 'foobar' }))`,
    );
  });

  it('should replace HttpClienModule with existing providers ', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule, HttpTransferCacheOptions } from '@angular/common/http';
    @NgModule({
      imports: [CommonModule,HttpClientModule,HttpClientJsonpModule, RouterModule.forRoot([]), HttpClientXsrfModule.withOptions({cookieName: 'foobar'})],
      providers: [provideConfig({ someConfig: 'foobar'})]
    })
    export class AppModule {}`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).not.toContain(`HttpClientXsrfModule`);
    expect(content).not.toContain(`HttpClientJsonpModule`);
    expect(content).toContain(`HttpTransferCacheOptions`);
    expect(content).toContain(`provideConfig({ someConfig: 'foobar' })`);
    expect(content).toContain(
        `provideHttpClient(withInterceptorsFromDi(), withJsonpSupport(), withXsrfConfiguration({ cookieName: 'foobar' }))`,
    );
  });

  it('should replace HttpClienModule & HttpClientXsrfModule.disable()', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule, HttpTransferCacheOptions } from '@angular/common/http';
    @NgModule({
      imports: [CommonModule,HttpClientModule,HttpClientJsonpModule, RouterModule.forRoot([]), HttpClientXsrfModule.disable()],
      providers: [provideConfig({ someConfig: 'foobar'})]
    })
    export class AppModule {}`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).not.toContain(`HttpClientXsrfModule`);
    expect(content).not.toContain(`HttpClientJsonpModule`);
    expect(content).toContain(`HttpTransferCacheOptions`);
    expect(content).toContain(`provideConfig({ someConfig: 'foobar' })`);
    expect(content).toContain(
        `provideHttpClient(withInterceptorsFromDi(), withJsonpSupport(), withNoXsrfProtection())`,
    );
  });

  it('should replace HttpClienModule & base HttpClientXsrfModule', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule, HttpTransferCacheOptions } from '@angular/common/http';
    @NgModule({
      imports: [CommonModule,HttpClientModule,RouterModule.forRoot([]), HttpClientXsrfModule],
      providers: [provideConfig({ someConfig: 'foobar'})]
    })
    export class AppModule {}`,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).not.toContain(`HttpClientXsrfModule`);
    expect(content).not.toContain(`HttpClientJsonpModule`);
    expect(content).not.toContain(`withJsonpSupport`);
    expect(content).toContain(`HttpTransferCacheOptions`);
    expect(content).toContain(`provideConfig({ someConfig: 'foobar' })`);
    expect(content).toContain(
        `provideHttpClient(withInterceptorsFromDi(), withXsrfConfiguration())`,
    );
  });

  it('should handle a migration with 2 modules in the same file ', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule, HttpTransferCacheOptions } from '@angular/common/http';
    @NgModule({
      imports: [CommonModule,HttpClientModule,HttpClientJsonpModule)],
      providers: [provideConfig({ someConfig: 'foobar'})]
    })
    export class AppModule {}
    
    @NgModule({
      imports: [CommonModule,HttpClientModule,HttpClientXsrfModule.disable()],
      providers: [provideConfig({ someConfig: 'foobar'})]
    })
    export class AppModule {}
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).not.toContain(`HttpClientXsrfModule`);
    expect(content).not.toContain(`HttpClientJsonpModule`);
    expect(content).toContain(`HttpTransferCacheOptions`);
    expect(content).toContain(`provideConfig({ someConfig: 'foobar' })`);
    expect(content).toContain(`provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())`);
    expect(content).toContain(
        `provideHttpClient(withInterceptorsFromDi(), withNoXsrfProtection())`,
    );
  });

  it('should handle a migration for acomponent ', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
    @Component({
      template: '',
      imports: [HttpClientModule,HttpClientJsonpModule)],
    })
    export class MyComponent {}
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).toContain(`provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())`);
  });

  it('should handle a migration for a directive ', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
    @Directive({
      selector: 'my-directive',
      imports: [HttpClientModule,HttpClientJsonpModule)],
    })
    export class MyDirective {}
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).toContain(`provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())`);
  });

  it('should not migrate  HttpClientModule from another package', async () => {
    writeFile(
        '/index.ts',
        `import { HttpClientModule, HttpClientJsonpModule, HttpClientXsrfModule, HttpTransferCacheOptions } from '@not-angular/common/http';
    @NgModule({
      imports: [CommonModule,HttpClientModule,HttpClientJsonpModule)],
      providers: [provideConfig({ someConfig: 'foobar' })]
    })
    export class AppModule {}
    
    @NgModule({
      imports: [CommonModule,HttpClientModule,HttpClientXsrfModule.disable()],
      providers: [provideConfig({ someConfig: 'foobar' })]
    })
    export class AppModule {}
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@not-angular/common/http`);
    expect(content).toContain(`HttpClientModule`);
    expect(content).toContain(`HttpClientXsrfModule`);
    expect(content).toContain(`HttpClientJsonpModule`);
    expect(content).toContain(`HttpTransferCacheOptions`);
    expect(content).toContain(`provideConfig({ someConfig: 'foobar' })`);
    expect(content).not.toContain(
        `provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())`,
    );
    expect(content).not.toContain(
        `provideHttpClient(withInterceptorsFromDi(), withNoXsrfProtection())`,
    );
  });

  it('should migrate HttpClientTestingModule', async () => {
    writeFile(
        '/index.ts',
        `
      import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http/testing`);
    expect(content).not.toContain(`HttpClientTestingModule`);
    expect(content).toMatch(/import.*provideHttpClientTesting/);
    expect(content).toContain(
        `provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()`);
  });

  it('should not migrate HttpClientTestingModule from outside package', async () => {
    writeFile(
        '/index.ts',
        `
      import { HttpClientTestingModule, HttpTestingController } from '@not-angular/common/http/testing';
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@not-angular/common/http/testing`);
    expect(content).toContain(`HttpClientTestingModule`);
    expect(content).not.toContain('provideHttpClientTesting');
  });

  it('shouldmigrate NgModule + TestBed.configureTestingModule in the same file', async () => {
    writeFile(
        '/index.ts',
        `
      import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
      import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

      @NgModule({
        template: '',
        imports: [HttpClientModule,HttpClientJsonpModule)],
      })
      export class MyModule {}


      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
    `,
    );

    await runMigration();

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`@angular/common/http`);
    expect(content).toContain(`@angular/common/http/testing`);
    expect(content).not.toContain(`HttpClientModule`);
    expect(content).not.toContain(`HttpClientTestingModule`);
    expect(content).toContain('provideHttpClientTesting');
    expect(content).toContain('provideHttpClient(withInterceptorsFromDi(), withJsonpSupport())');
    expect(content).toContain(
        'provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()');

    expect(content).toContain(
        `import { withInterceptorsFromDi, withJsonpSupport, provideHttpClient } from '@angular/common/http';`);
    expect(content).toContain(
        `import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';`);
  });
});
