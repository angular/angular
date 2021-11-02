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
import * as shx from 'shelljs';


describe('TestBed teardown migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
        strictNullChecks: true,
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    // Note that the declarations here are a little more convoluted than they need to be. It's
    // because they've been copied over directly from `node_modules/@angular/core/testing.d.ts`,
    // except for removing some methods that are irrelevant to these tests.
    writeFile('/node_modules/@angular/core/testing.d.ts', `
      export declare const getTestBed: () => TestBed;

      export declare interface TestBed {
        initTestEnvironment(ngModule: any, platform: any, options?: any): void;
        configureTestingModule(moduleDef: any): void;
      }

      export declare const TestBed: TestBedStatic;

      export declare interface TestBedStatic {
        new (...args: any[]): TestBed;
        initTestEnvironment(ngModule: any, platform: any, options?: any): TestBed;
        configureTestingModule(moduleDef: any): TestBedStatic;
      }

      export declare function withModule(moduleDef: any, fn: Function): () => any;
    `);

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

  it('should migrate calls to initTestEnvironment', async () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate calls to initTestEnvironment going through getTestBed()', async () => {
    writeFile('/index.ts', `
      import { getTestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate calls to initTestEnvironment going through a variable', async () => {
    writeFile('/index.ts', `
      import { getTestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      const tb = getTestBed();

      tb.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
      tb.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate not calls to initTestEnvironment that already specify a teardown behavior',
     async () => {
       writeFile('/index.ts', `
        import { TestBed } from '@angular/core/testing';
        import {
          BrowserDynamicTestingModule,
          platformBrowserDynamicTesting
        } from '@angular/platform-browser-dynamic/testing';

        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          teardown: {destroyAfterEach: true}
        });
      `);

       await runMigration();

       expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          teardown: {destroyAfterEach: true}
        });
      `));
     });

  it('should migrate calls to initTestEnvironment that pass in aotSummaries as an arrow function',
     async () => {
       writeFile('/index.ts', `
        import { TestBed } from '@angular/core/testing';
        import {
          BrowserDynamicTestingModule,
          platformBrowserDynamicTesting
        } from '@angular/platform-browser-dynamic/testing';

        class Foo {}

        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), () => [Foo]);
      `);

       await runMigration();

       expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          aotSummaries: () => [Foo],
          teardown: { destroyAfterEach: false }
        });
      `));
     });

  it('should migrate calls to initTestEnvironment that pass in aotSummaries as an anonymous function',
     async () => {
       writeFile('/index.ts', `
        import { TestBed } from '@angular/core/testing';
        import {
          BrowserDynamicTestingModule,
          platformBrowserDynamicTesting
        } from '@angular/platform-browser-dynamic/testing';

        class Foo {}

        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), function() {
          return [Foo];
        });
      `);

       await runMigration();

       expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          aotSummaries: function() {
            return [Foo];
          },
          teardown: { destroyAfterEach: false }
        });
      `));
     });

  it('should migrate calls to initTestEnvironment that pass in aotSummaries via an object literal',
     async () => {
       writeFile('/index.ts', `
        import { TestBed } from '@angular/core/testing';
        import {
          BrowserDynamicTestingModule,
          platformBrowserDynamicTesting
        } from '@angular/platform-browser-dynamic/testing';

        class Foo {}

        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          aotSummaries: () => [Foo]
        });
      `);

       await runMigration();

       expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          aotSummaries: () => [Foo],
          teardown: { destroyAfterEach: false }
        });
      `));
     });


  it('should migrate initTestEnvironment calls across multiple files', async () => {
    writeFile('/test-init.ts', `
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    writeFile('/other-test-init.ts', `
      import { getTestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/test-init.ts'))).toContain(stripWhitespace(`
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));

    expect(stripWhitespace(tree.readContent('/other-test-init.ts'))).toContain(stripWhitespace(`
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should not migrate calls to initTestEnvironment that pass in a variable', async () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      const config = {aotSummaries: () => []};

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), config);
    `);

    await runMigration();

    const content = stripWhitespace(tree.readContent('/index.ts'));
    expect(content).toContain(stripWhitespace(`const config = {aotSummaries: () => []};`));
    expect(content).toContain(stripWhitespace(`
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), config);
    `));
  });

  it('should not migrate invalid initTestEnvironment calls', async () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';

      TestBed.initTestEnvironment();
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts')))
        .toContain(stripWhitespace(`TestBed.initTestEnvironment();`));
  });

  it('should not migrate calls to initTestEnvironment not coming from Angular', async () => {
    writeFile('/index.ts', `
      import { TestBed } from '@not-angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts')))
        .toContain(stripWhitespace(
            `TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());`));
  });

  it('should migrate calls to initTestEnvironment when TestBed is aliased', async () => {
    writeFile('/index.ts', `
      import { TestBed as AliasOfTestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      AliasOfTestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
      AliasOfTestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate withModule calls', async () => {
    writeFile('/index.spec.ts', `
      import { Component } from '@angular/core';
      import { withModule, TestBed } from '@angular/core/testing';

      @Component({template: ''})
      class Comp {}

      it('should work', withModule({
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', withModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should not migrate withModule calls that already pass in the teardown flag', async () => {
    writeFile('/index.spec.ts', `
      import { Component } from '@angular/core';
      import { withModule, TestBed } from '@angular/core/testing';

      @Component({template: ''})
      class Comp {}

      it('should work', withModule({
        teardown: {destroyAfterEach: true},
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', withModule({
        teardown: {destroyAfterEach: true},
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should not migrate withModule calls that do not come from Angular', async () => {
    writeFile('/index.spec.ts', `
      import { Component } from '@angular/core';
      import { TestBed } from '@angular/core/testing';

      function withModule(...args: any[]) {}

      @Component({template: ''})
      class Comp {}

      it('should work', withModule({
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', withModule({
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should migrate aliased withModule calls', async () => {
    writeFile('/index.spec.ts', `
      import { Component } from '@angular/core';
      import { withModule as aliasOfWithModule, TestBed } from '@angular/core/testing';

      @Component({template: ''})
      class Comp {}

      it('should work', aliasOfWithModule({
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', aliasOfWithModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should migrate configureTestingModule calls', async () => {
    writeFile('/index.spec.ts', `
      import { Component } from '@angular/core';
      import { TestBed } from '@angular/core/testing';

      @Component({template: ''})
      class Comp {}

      it('should work', () => {
        TestBed.configureTestingModule({
          declarations: [Comp]
        });

        const fixture = TestBed.createComponent(Comp);
        fixture.detectChanges();
      });
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.spec.ts'))).toContain(stripWhitespace(`
      TestBed.configureTestingModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      });
    `));
  });

  it('should migrate multiple configureTestingModule calls within the same file', async () => {
    writeFile('/index.spec.ts', `
      import { Component } from '@angular/core';
      import { TestBed } from '@angular/core/testing';

      @Component({template: ''})
      class Comp {}

      @Component({template: ''})
      class BetterComp {}

      it('should work', () => {
        TestBed.configureTestingModule({
          declarations: [Comp]
        });

        const fixture = TestBed.createComponent(Comp);
        fixture.detectChanges();
      });

      it('should work better', () => {
        TestBed.configureTestingModule({
          declarations: [BetterComp]
        });

        const fixture = TestBed.createComponent(BetterComp);
        fixture.detectChanges();
      });
    `);

    await runMigration();

    const content = stripWhitespace(tree.readContent('/index.spec.ts'));

    expect(content).toContain(stripWhitespace(`
      TestBed.configureTestingModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      });
    `));

    expect(content).toContain(stripWhitespace(`
      TestBed.configureTestingModule({
        declarations: [BetterComp],
        teardown: {destroyAfterEach: false}
      });
    `));
  });

  it('should migrate configureTestingModule calls through getTestBed()', async () => {
    writeFile('/index.spec.ts', `
      import { Component } from '@angular/core';
      import { getTestBed } from '@angular/core/testing';

      @Component({template: ''})
      class Comp {}

      it('should work', () => {
        getTestBed().configureTestingModule({
          declarations: [Comp]
        });

        const fixture = getTestBed().createComponent(Comp);
        fixture.detectChanges();
      });
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.spec.ts'))).toContain(stripWhitespace(`
      getTestBed().configureTestingModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      });
    `));
  });

  it('should not migrate configureTestingModule calls that already pass in the teardown flag',
     async () => {
       writeFile('/index.spec.ts', `
        import { Component } from '@angular/core';
        import { TestBed } from '@angular/core/testing';

        @Component({template: ''})
        class Comp {}

        it('should work', () => {
          TestBed.configureTestingModule({
            teardown: {destroyAfterEach: true},
            declarations: [Comp]
          });

          const fixture = TestBed.createComponent(Comp);
          fixture.detectChanges();
        });
      `);

       await runMigration();

       expect(stripWhitespace(tree.readContent('/index.spec.ts'))).toContain(stripWhitespace(`
        TestBed.configureTestingModule({
          teardown: {destroyAfterEach: true},
          declarations: [Comp]
        });
      `));
     });


  it('should not migrate configureTestingModule or withModule calls if initTestEnvironment was migrated in another file',
     async () => {
       writeFile('/test-init.ts', `
        import { TestBed } from '@angular/core/testing';
        import {
          BrowserDynamicTestingModule,
          platformBrowserDynamicTesting
        } from '@angular/platform-browser-dynamic/testing';

        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
      `);

       writeFile('/comp.spec.ts', `
        import { Component } from '@angular/core';
        import { TestBed, withModule } from '@angular/core/testing';

        @Component({template: ''})
        class Comp {}

        it('should work', () => {
          TestBed.configureTestingModule({
            declarations: [Comp]
          });

          const fixture = TestBed.createComponent(Comp);
          fixture.detectChanges();
        });

        it('should also work', withModule({
          declarations: [Comp],
        }, () => {
          TestBed.createComponent(Comp);
        }));
      `);

       await runMigration();

       expect(stripWhitespace(tree.readContent('/test-init.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          teardown: { destroyAfterEach: false }
        });
      `));

       expect(stripWhitespace(tree.readContent('/comp.spec.ts'))).toContain(stripWhitespace(`
        TestBed.configureTestingModule({
          declarations: [Comp]
        });
      `));

       expect(stripWhitespace(tree.readContent('/comp.spec.ts'))).toContain(stripWhitespace(`
        it('should also work', withModule({
          declarations: [Comp],
        }, () => {
          TestBed.createComponent(Comp);
        }));
      `));
     });

  it('should not duplicate comments on initTestEnvironment calls', async () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      // Hello
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    await runMigration();

    expect(stripWhitespace(tree.readContent('/index.ts'))).toContain(stripWhitespace(`
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      // Hello
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v13-testbed-teardown', {}, tree).toPromise();
  }

  function stripWhitespace(contents: string) {
    return contents.replace(/\s/g, '');
  }
});
