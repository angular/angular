/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 TestBed teardown TSLint rule', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/testbedTeardownRule'));
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    // Note that the declarations here are a little more convoluted than they need to be. It's
    // because they've been copied over directly from `node_modules/@angular/core/testing.d.ts`,
    // except for removing some methods that are irrelevant to these tests.
    writeFile('testing.d.ts', `
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

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'es2015',
        baseUrl: './',
        paths: {
          '@angular/core/testing': ['testing.d.ts'],
        }
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'testbedTeardown': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }


  function stripWhitespace(contents: string) {
    return contents.replace(/\s/g, '');
  }

  it('should flag initTestEnvironment calls', () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures.length).toBe(1);
    expect(failures[0]).toMatch(/Teardown behavior has to be configured\./);
  });

  it('should flag configureTestingModule and withModule calls', () => {
    writeFile('/index.ts', `
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

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures.length).toBe(2);
    expect(failures[0]).toMatch(/Teardown behavior has to be configured\./);
    expect(failures[1]).toMatch(/Teardown behavior has to be configured\./);
  });

  it('should migrate calls to initTestEnvironment', () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate calls to initTestEnvironment going through getTestBed()', () => {
    writeFile('/index.ts', `
      import { getTestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate calls to initTestEnvironment going through a variable', () => {
    writeFile('/index.ts', `
      import { getTestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      const tb = getTestBed();

      tb.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
      tb.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate not calls to initTestEnvironment that already specify a teardown behavior',
     () => {
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

       runTSLint(true);

       expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          teardown: {destroyAfterEach: true}
        });
      `));
     });

  it('should migrate calls to initTestEnvironment that pass in aotSummaries as an arrow function',
     () => {
       writeFile('/index.ts', `
        import { TestBed } from '@angular/core/testing';
        import {
          BrowserDynamicTestingModule,
          platformBrowserDynamicTesting
        } from '@angular/platform-browser-dynamic/testing';

        class Foo {}

        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), () => [Foo]);
      `);

       runTSLint(true);

       expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          aotSummaries: () => [Foo],
          teardown: { destroyAfterEach: false }
        });
      `));
     });

  it('should migrate calls to initTestEnvironment that pass in aotSummaries as an anonymous function',
     () => {
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

       runTSLint(true);

       expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          aotSummaries: function() {
            return [Foo];
          },
          teardown: { destroyAfterEach: false }
        });
      `));
     });

  it('should migrate calls to initTestEnvironment that pass in aotSummaries via an object literal',
     () => {
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

       runTSLint(true);

       expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          aotSummaries: () => [Foo],
          teardown: { destroyAfterEach: false }
        });
      `));
     });


  it('should migrate initTestEnvironment calls across multiple files', () => {
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

    runTSLint(true);

    expect(stripWhitespace(getFile('/test-init.ts'))).toContain(stripWhitespace(`
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));

    expect(stripWhitespace(getFile('/other-test-init.ts'))).toContain(stripWhitespace(`
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should not migrate calls to initTestEnvironment that pass in a variable', () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      const config = {aotSummaries: () => []};

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), config);
    `);

    runTSLint(true);

    const content = stripWhitespace(getFile('/index.ts'));
    expect(content).toContain(stripWhitespace(`const config = {aotSummaries: () => []};`));
    expect(content).toContain(stripWhitespace(`
      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), config);
    `));
  });

  it('should not migrate invalid initTestEnvironment calls', () => {
    writeFile('/index.ts', `
      import { TestBed } from '@angular/core/testing';

      TestBed.initTestEnvironment();
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts')))
        .toContain(stripWhitespace(`TestBed.initTestEnvironment();`));
  });

  it('should not migrate calls to initTestEnvironment not coming from Angular', () => {
    writeFile('/index.ts', `
      import { TestBed } from '@not-angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts')))
        .toContain(stripWhitespace(
            `TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());`));
  });

  it('should migrate calls to initTestEnvironment when TestBed is aliased', () => {
    writeFile('/index.ts', `
      import { TestBed as AliasOfTestBed } from '@angular/core/testing';
      import {
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting
      } from '@angular/platform-browser-dynamic/testing';

      AliasOfTestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    `);

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.ts'))).toContain(stripWhitespace(`
      AliasOfTestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
        teardown: { destroyAfterEach: false }
      });
    `));
  });

  it('should migrate withModule calls', () => {
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

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', withModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should not migrate withModule calls that already pass in the teardown flag', () => {
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

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', withModule({
        teardown: {destroyAfterEach: true},
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should not migrate withModule calls that do not come from Angular', () => {
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

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', withModule({
        declarations: [Comp],
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should migrate aliased withModule calls', () => {
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

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.spec.ts'))).toContain(stripWhitespace(`
      it('should work', aliasOfWithModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      }, () => {
        TestBed.createComponent(Comp);
      }));
    `));
  });

  it('should migrate configureTestingModule calls', () => {
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

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.spec.ts'))).toContain(stripWhitespace(`
      TestBed.configureTestingModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      });
    `));
  });

  it('should migrate multiple configureTestingModule calls within the same file', () => {
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

    runTSLint(true);

    const content = stripWhitespace(getFile('/index.spec.ts'));

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

  it('should migrate configureTestingModule calls through getTestBed()', () => {
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

    runTSLint(true);

    expect(stripWhitespace(getFile('/index.spec.ts'))).toContain(stripWhitespace(`
      getTestBed().configureTestingModule({
        declarations: [Comp],
        teardown: {destroyAfterEach: false}
      });
    `));
  });

  it('should not migrate configureTestingModule calls that already pass in the teardown flag',
     () => {
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

       runTSLint(true);

       expect(stripWhitespace(getFile('/index.spec.ts'))).toContain(stripWhitespace(`
        TestBed.configureTestingModule({
          teardown: {destroyAfterEach: true},
          declarations: [Comp]
        });
      `));
     });


  it('should not migrate configureTestingModule or withModule calls if initTestEnvironment was migrated in another file',
     () => {
       writeFile('/test-init.ts', `
        import { TestBed, withModule } from '@angular/core/testing';
        import {
          BrowserDynamicTestingModule,
          platformBrowserDynamicTesting
        } from '@angular/platform-browser-dynamic/testing';

        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
      `);

       writeFile('/comp.spec.ts', `
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

        it('should also work', withModule({
          declarations: [Comp],
        }, () => {
          TestBed.createComponent(Comp);
        }));
      `);

       runTSLint(true);

       expect(stripWhitespace(getFile('/test-init.ts'))).toContain(stripWhitespace(`
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
          teardown: { destroyAfterEach: false }
        });
      `));

       expect(stripWhitespace(getFile('/comp.spec.ts'))).toContain(stripWhitespace(`
        TestBed.configureTestingModule({
          declarations: [Comp]
        });
      `));

       expect(stripWhitespace(getFile('/comp.spec.ts'))).toContain(stripWhitespace(`
        it('should also work', withModule({
          declarations: [Comp],
        }, () => {
          TestBed.createComponent(Comp);
        }));
      `));
     });
});
