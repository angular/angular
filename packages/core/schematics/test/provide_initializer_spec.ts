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

describe('Provide initializer migration', () => {
  it('should transform APP_INITIALIZER + useValue into provideAppInitializer', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: () => { console.log('hello'); },
        multi: true,
      }];
    `);

    expect(content).toContain(`import { provideAppInitializer } from '@angular/core';`);
    expect(content).toContain(
      `const providers = [provideAppInitializer(() => { console.log('hello'); })]`,
    );
    expect(content).not.toContain('APP_INITIALIZER');
  });

  it('should not remove other imported symbols by mistake', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER, input } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: () => { console.log('hello'); },
        multi: true,
      }];
    `);

    expect(content).toContain(`import { input, provideAppInitializer } from '@angular/core';`);
  });

  it('should reuse provideAppInitializer if already imported', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER, input, provideAppInitializer } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: () => { console.log('hello'); },
        multi: true,
      }];
    `);

    expect(content).toContain(`import { input, provideAppInitializer } from '@angular/core';`);
  });

  it('should transform APP_INITIALIZER + useValue async function into provideAppInitializer', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: async () => { await Promise.resolve(); return 42; },
        multi: true,
      }];
    `);

    expect(content).toContain(
      `const providers = [provideAppInitializer(async () => { await Promise.resolve(); return 42; })]`,
    );
  });
  it('should transform APP_INITIALIZER + useValue symbol into provideAppInitializer', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@angular/core';

      function initializerFn() {}

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: initializerFn,
        multi: true,
      }];
    `);

    expect(content).toContain(`const providers = [provideAppInitializer(initializerFn)];`);
  });

  it('should transform APP_INITIALIZER + useFactory into provideAppInitializer', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useFactory: () => {
          const service = inject(Service);
          return () => service.init();
        },
        multi: true,
      }];
    `);

    expect(content).toContain(`const providers = [provideAppInitializer(() => { return (() => {
          const service = inject(Service);
          return () => service.init();
        })(); })];`);
  });

  it('should transform APP_INITIALIZER + useExisting into provideAppInitializer', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useExisting: MY_INITIALIZER,
        multi: true,
      }];
    `);

    expect(content).toContain(`import { inject, provideAppInitializer } from '@angular/core';`);
    expect(content).toContain(
      `const providers = [provideAppInitializer(() => inject(MY_INITIALIZER)())]`,
    );
  });

  it('should transform APP_INITIALIZER + deps into provideAppInitializer', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useFactory: (a: ServiceA, b: ServiceB) => {
          return () => a.init();
        },
        deps: [ServiceA, ServiceB],
        multi: true,
      }];
    `);

    expect(content).toContain(`import { inject, provideAppInitializer } from '@angular/core';`);
    expect(content).toContain(
      `const providers = [provideAppInitializer(() => { return ((a: ServiceA, b: ServiceB) => {
          return () => a.init();
        })(inject(ServiceA), inject(ServiceB)); })];`,
    );
  });

  it('should not transform APP_INITIALIZER if multi is not set to true', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: [initializer],
      }];
    `);

    expect(content).toBe(`
      import { APP_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: [initializer],
      }];
    `);
  });

  it('should not transform APP_INITIALIZER if it is not imported from @angular/core', async () => {
    const content = await migrateCode(`
      import { APP_INITIALIZER } from '@not-angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: () => { console.log('hello'); },
        multi: true,
      }];
    `);

    expect(content).toBe(`
      import { APP_INITIALIZER } from '@not-angular/core';

      const providers = [{
        provide: APP_INITIALIZER,
        useValue: () => { console.log('hello'); },
        multi: true,
      }];
    `);
  });

  it('should transform ENVIRONMENT_INITIALIZER + useValue into provideEnvironmentInitializer', async () => {
    const content = await migrateCode(`
      import { ENVIRONMENT_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: ENVIRONMENT_INITIALIZER,
        useValue: () => { console.log('hello'); },
        multi: true,
      }];
    `);

    expect(content).toContain(`import { provideEnvironmentInitializer } from '@angular/core';`);
    expect(content).toContain(
      `const providers = [provideEnvironmentInitializer(() => { console.log('hello'); })]`,
    );
    expect(content).not.toContain('ENVIRONMENT_INITIALIZER');
  });

  it('should transform PLATFORM_INITIALIZER + useValue into providePlatformInitializer', async () => {
    const content = await migrateCode(`
      import { PLATFORM_INITIALIZER } from '@angular/core';

      const providers = [{
        provide: PLATFORM_INITIALIZER,
        useValue: () => { console.log('hello'); },
        multi: true,
      }];
    `);

    expect(content).toContain(`import { providePlatformInitializer } from '@angular/core';`);
    expect(content).toContain(
      `const providers = [providePlatformInitializer(() => { console.log('hello'); })]`,
    );
    expect(content).not.toContain('PLATFORM_INITIALIZER');
  });
});

async function migrateCode(content: string) {
  const {readFile, writeFile, runMigration} = setUpMigration();

  writeFile('/index.ts', content);

  await runMigration();

  return readFile('/index.ts');
}

function setUpMigration() {
  const host = new TempScopedNodeJsSyncHost();
  const tree = new UnitTestTree(new HostTree(host));
  const runner = new SchematicTestRunner(
    'test',
    runfiles.resolvePackageRelative('../migrations.json'),
  );

  function writeFile(filePath: string, content: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(content));
  }

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

  const previousWorkingDir = shx.pwd();
  const tmpDirPath = getSystemPath(host.root);

  // Switch into the temporary directory path. This allows us to run
  // the schematic against our custom unit test tree.
  shx.cd(tmpDirPath);

  // Get back to current directory after test.
  cleanupFns.push(() => shx.cd(previousWorkingDir));

  return {
    readFile(filePath: string) {
      return tree.readContent(filePath);
    },
    writeFile,
    async runMigration() {
      return await runner.runSchematic('provide-initializer', {}, tree);
    },
  };
}

let cleanupFns: Array<() => void> = [];
afterEach(() => {
  for (const cleanupFn of cleanupFns) {
    cleanupFn();
  }
  cleanupFns = [];
});
