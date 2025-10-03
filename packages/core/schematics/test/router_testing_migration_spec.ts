/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'node:path';
import {rmSync} from 'node:fs';

describe('Router testing migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(path?: string) {
    return runner.runSchematic('router-testing-migration', {path}, tree);
  }

  function stripWhitespace(content: string): string {
    return content.replace(/\s+/g, '');
  }

  const collectionJsonPath = resolve('../collection.json');

  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    tmpDirPath = getSystemPath(host.root);

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    writeFile(
      '/node_modules/@angular/router/testing/index.d.ts',
      `
        export declare class RouterTestingModule {
          static withRoutes(routes: any[], options?: any): any;
        }
      `,
    );

    writeFile(
      '/node_modules/@angular/router/index.d.ts',
      `
        export declare class RouterModule {
          static forRoot(routes: any[]): any;
        }
        export declare function provideRouter(routes: any[]): any;
        export type Routes = any[];
      `,
    );

    writeFile(
      '/node_modules/@angular/core/testing/index.d.ts',
      `
        export declare class TestBed {
          static configureTestingModule(config: any): any;
        }
      `,
    );

    previousWorkingDir = process.cwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    process.chdir(tmpDirPath);
  });

  afterEach(() => {
    process.chdir(previousWorkingDir);
    rmSync(tmpDirPath, {recursive: true});
  });

  describe('RouterTestingModule', () => {
    it('should migrate RouterTestingModule.withRoutes with explicit routes to RouterModule', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

          const routes = [{path: 'test', component: TestComponent}];

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule.withRoutes(routes)]
              });
            });
          });
        `,
      );

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

          const routes = [{path: 'test', component: TestComponent}];

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterModule.forRoot(routes)]
              });
            });
          });
        `),
      );
    });

    it('should migrate RouterTestingModule without routes to RouterModule', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule]
              });
            });
          });
        `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterModule]
              });
            });
          });
        `),
      );
    });

    it('should preserve other imports and add providers array if needed', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';
          import { HttpClientTestingModule } from '@angular/common/http/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [HttpClientTestingModule, RouterTestingModule]
              });
            });
          });
        `,
      );

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';
          import { HttpClientTestingModule } from '@angular/common/http/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [HttpClientTestingModule, RouterModule]
              });
            });
          });`),
      );
    });

    it('should migrate RouterTestingModule to RouterModule in standalone tests', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

          const routes = [{path: 'test', component: TestComponent}];

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule.withRoutes(routes)],
                providers: [SomeService]
              });
            });
          });
        `,
      );

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

          const routes = [{path: 'test', component: TestComponent}];

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterModule.forRoot(routes)],
                providers: [SomeService]
              });
            });
          });
        `),
      );
    });

  it('should migrate RouterTestingModule.withRoutes(routes, options) and preserve the options argument', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

          const routes = [{path: 'test', component: TestComponent}];

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule.withRoutes(routes, { initialNavigation: 'enabledBlocking' })]
              });
            });
          });
        `,
      );

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

          const routes = [{path: 'test', component: TestComponent}];

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })]
              });
            });
          });
        `),
      );
    });

  it('should migrate RouterTestingModule.withRoutes([], options) and preserve the options argument', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

 
          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule.withRoutes([], { initialNavigation: 'enabledBlocking' })]
              });
            });
          });
        `,
      );

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' })]
              });
            });
          });
        `),
      );
    });

    it('should migrate tests without existing providers', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule],
                providers: []
              });
            });
          });
        `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterModule],
                providers: []
              });
            });
          });
        `),
      );
    });
  });

  describe('Multiple TestBed calls', () => {
    it('should migrate multiple TestBed.configureTestingModule calls', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

          describe('AppComponent', () => {
            it('test 1', () => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule]
              });
            });

            it('test 2', () => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule.withRoutes([])]
              });
            });
          });
        `,
      );

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');
      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

          describe('AppComponent', () => {
            it('test 1', () => {
              TestBed.configureTestingModule({
                imports: [RouterModule]
              });
            });

            it('test 2', () => {
              TestBed.configureTestingModule({
                imports: [RouterModule]
              });
            });
          });
        `),
      );
    });

    it('should handle routes passed as variable identifiers', async () => {
      writeFile(
        '/app.component.spec.ts',
        `
          import { TestBed } from '@angular/core/testing';
          import { RouterTestingModule } from '@angular/router/testing';

 
          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterTestingModule.withRoutes([{path: 'test', component: TestComponent}])]
              });
            });
          });
        `,
      );

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
          import { RouterModule } from '@angular/router';
          import { TestBed } from '@angular/core/testing';

 
          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [RouterModule.forRoot([{path: 'test', component: TestComponent}])]
              });
            });
          });
        `),
      );
    });
  });

  describe('No-op scenarios', () => {
    it('should not modify files without RouterTestingModule', async () => {
      const original = `
          import { TestBed } from '@angular/core/testing';
          import { HttpClientTestingModule } from '@angular/common/http/testing';

          describe('AppComponent', () => {
            beforeEach(() => {
              TestBed.configureTestingModule({
                imports: [HttpClientTestingModule]
              });
            });
          });
        `;

      writeFile('/app.component.spec.ts', original);

      await runMigration();
      const content = tree.readContent('/app.component.spec.ts');

      expect(content.replace(/\s+/g, ' ')).toBe(original.replace(/\s+/g, ' '));
    });

    it('should not process non-spec files', async () => {
      const original = `
          import { RouterTestingModule } from '@angular/router/testing';

          export const testModule = RouterTestingModule;
        `;

      writeFile('/helper.ts', original);

      await runMigration();
      const content = tree.readContent('/helper.ts');

      expect(content.replace(/\s+/g, ' ')).toBe(original.replace(/\s+/g, ' '));
    });
  });

  describe('Location and LocationStrategy support', () => {
    it('should add provideLocationMocks when Location is imported', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
         let mockLocation: Location;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterTestingModule]
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { provideLocationMocks } from '@angular/common/testing';
        import { TestBed } from '@angular/core/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [provideLocationMocks()]
            });
          });
        });
        `),
      );
    });

    it('should add provideLocationMocks when LocationStrategy is imported', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { LocationStrategy } from '@angular/common';

        describe('test', () => {
          let mockLocationStrategy: LocationStrategy;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterTestingModule]
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { provideLocationMocks } from '@angular/common/testing';
        import { TestBed } from '@angular/core/testing';
        import { LocationStrategy } from '@angular/common';

        describe('test', () => {
          let mockLocationStrategy: LocationStrategy;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [provideLocationMocks()]
            });
          });
        });
        `),
      );
    });

    it('should add provideLocationMocks when both Location and LocationStrategy are imported', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { Location, LocationStrategy } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          let mockLocationStrategy: LocationStrategy;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterTestingModule]
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('RouterTestingModule');
      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { provideLocationMocks } from '@angular/common/testing';
        import { TestBed } from '@angular/core/testing';
        import { Location, LocationStrategy } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          let mockLocationStrategy: LocationStrategy;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [provideLocationMocks()]
            });
          });
        });
        `),
      );
    });

    it('should add provideLocationMocks to existing providers array', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { Location , ViewportScroller } from '@angular/common';
         
        describe('test', () => {
           let mockLocation: Location;
           let mockViewportScroller: ViewportScroller;
           beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterTestingModule],
              providers: [ViewportScroller]
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');
      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { provideLocationMocks } from '@angular/common/testing';
        import { TestBed } from '@angular/core/testing';
        import { Location, ViewportScroller } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          let mockViewportScroller: ViewportScroller;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [ViewportScroller,provideLocationMocks()]
            });
          });
        });
        `),
      );
    });

    it('should add provideLocationMocks with other imports preserved', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { HttpClientTestingModule } from '@angular/common/http/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;  
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [HttpClientTestingModule, RouterTestingModule]
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');
      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { provideLocationMocks } from '@angular/common/testing';
        import { TestBed } from '@angular/core/testing';
        import { HttpClientTestingModule } from '@angular/common/http/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [HttpClientTestingModule, RouterModule],
              providers: [provideLocationMocks()]
            });
          });
        });
        `),
      );
    });

    it('should not add a provideLocationMocks if already present', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { provideLocationMocks } from '@angular/common/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;  
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [provideLocationMocks()]
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { TestBed } from '@angular/core/testing';
        import { provideLocationMocks } from '@angular/common/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;  
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [provideLocationMocks()]
            });
          });
        });
        `),
      );
    });

  it('should not add provideLocationMocks when Location is already provided', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;  
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [{ provide: Location, useValue: { path: () => '/test' } }],
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');
      expect(content).not.toContain('provideLocationMocks');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { TestBed } from '@angular/core/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;  
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [{ provide: Location, useValue: { path: () => '/test' } }],
            });
          });
        });
        `),
      );
    });

  it('should not add provideLocationMocks when LocationStrategy is already provided', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;  
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [{ provide: LocationStrategy, useValue: { path: () => '/test' } }]
            });
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');
      expect(content).not.toContain('provideLocationMocks');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { TestBed } from '@angular/core/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;  
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [{ provide: LocationStrategy, useValue: { path: () => '/test' } }]
            });
          });
        });
        `),
      );
    });

  it('should not add provideLocationMocks when both Location and LocationStrategy have custom providers', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { RouterTestingModule } from '@angular/router/testing';
        import { Location, LocationStrategy } from '@angular/common';
        import { TestBed } from '@angular/core/testing';

        describe('Module route', () => {
          let mockLocationStrategy: LocationStrategy;
          let mockLocation: Location;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterTestingModule],
              providers: [
                {
                  provide: LocationStrategy,
                  useValue: {
                    path: () => {
                      return '';
                    },
                  },
                },
                {
                  provide: Location,
                  useValue: {
                    path: () => {
                      return '';
                    },
                  },
                },
              ],
            });
          });

          it('dummy: should be true', () => {
            expect(true).toBeTrue();
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('provideLocationMocks');
      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { Location, LocationStrategy } from '@angular/common';
        import { TestBed } from '@angular/core/testing';

        describe('Module route', () => {
          let mockLocationStrategy: LocationStrategy;
          let mockLocation: Location;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [
                {
                  provide: LocationStrategy,
                  useValue: {
                    path: () => {
                      return '';
                    },
                  },
                },
                {
                  provide: Location,
                  useValue: {
                    path: () => {
                      return '';
                    },
                  },
                },
              ],
            });
          });

          it('dummy: should be true', () => {
            expect(true).toBeTrue();
          });
        });
        `),
      );
    });
  });
});
