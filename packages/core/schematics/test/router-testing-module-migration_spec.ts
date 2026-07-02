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
    return runner.runSchematic('router-testing-module-migration', {path}, tree);
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

      expect(stripWhitespace(content)).toBe(stripWhitespace(original));
    });

    it('should not process non-spec files', async () => {
      const original = `
          import { RouterTestingModule } from '@angular/router/testing';

          export const testModule = RouterTestingModule;
        `;

      writeFile('/helper.ts', original);

      await runMigration();
      const content = tree.readContent('/helper.ts');

      expect(stripWhitespace(content)).toBe(stripWhitespace(original));
    });
  });

  describe('provideLocationMocks support', () => {
    it('should not add provideLocationMocks when only `Location` is used', async () => {
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
              imports: [RouterTestingModule],
              providers: [Location]
            });
            mockLocation = TestBed.inject(Location);
          });
          it('test', () => {
            expect(mockLocation.onUrlChange).toBeDefined();
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('RouterTestingModule');
      expect(content).not.toContain('provideLocationMocks');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { TestBed } from '@angular/core/testing';
        import { Location } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [Location]
            });
            mockLocation = TestBed.inject(Location);
          });
          it('test', () => {
            expect(mockLocation.onUrlChange).toBeDefined();
          });
        });
        `),
      );
    });

    it('should not add provideLocationMocks when only `LocationStrategy` is used', async () => {
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
              imports: [RouterTestingModule],
              providers: [LocationStrategy]
            });
            mockLocationStrategy = TestBed.inject(LocationStrategy);
          });
          it('test', () => {
            expect(mockLocationStrategy.path()).toBeDefined();
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('RouterTestingModule');
      expect(content).not.toContain('provideLocationMocks');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { TestBed } from '@angular/core/testing';
        import { LocationStrategy } from '@angular/common';

        describe('test', () => {
          let mockLocationStrategy: LocationStrategy;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [LocationStrategy]
            });
            mockLocationStrategy = TestBed.inject(LocationStrategy);
          });
          it('test', () => {
            expect(mockLocationStrategy.path()).toBeDefined();
          });
        });
        `),
      );
    });

    it('should not add provideLocationMocks when both `Location` and `LocationStrategy` are provided', async () => {
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
              imports: [RouterTestingModule],
              providers: [LocationStrategy,Location]
            });
            mockLocation = TestBed.inject(Location);
            mockLocationStrategy = TestBed.inject(LocationStrategy);
          });
          it('test', () => {
            expect(mockLocation.onUrlChange).toBeDefined();
            expect(mockLocationStrategy.path()).toBeDefined();
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('provideLocationMocks');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { TestBed } from '@angular/core/testing';
        import { Location, LocationStrategy } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          let mockLocationStrategy: LocationStrategy;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [LocationStrategy,Location]
            });
            mockLocation = TestBed.inject(Location);
            mockLocationStrategy = TestBed.inject(LocationStrategy);
          });
          it('test', () => {
            expect(mockLocation.onUrlChange).toBeDefined();
            expect(mockLocationStrategy.path()).toBeDefined();
          });
        });
        `),
      );
    });

    it('should not add provideLocationMocks when `Location` is imported but only other providers are present', async () => {
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
            mockLocation = TestBed.inject(Location);
          });
          it('test', () => {
            expect(mockLocation.onUrlChange).toBeDefined();
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');
      expect(content).not.toContain('RouterTestingModule');
      expect(content).not.toContain('provideLocationMocks');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { TestBed } from '@angular/core/testing';
        import { Location, ViewportScroller } from '@angular/common';

        describe('test', () => {
          let mockLocation: Location;
          let mockViewportScroller: ViewportScroller;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule],
              providers: [ViewportScroller]
            });
            mockLocation = TestBed.inject(Location);
          });
          it('test', () => {
            expect(mockLocation.onUrlChange).toBeDefined();
          });
        });
        `),
      );
    });

    it('should add provideLocationMocks when `SpyLocation` is used and its `urlChanges` property is accessed (preserving other imports)', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { HttpClientTestingModule } from '@angular/common/http/testing';
        import { SpyLocation } from '@angular/common/testing';

        describe('SpyLocation with use urlChanges', () => {
          let spy: SpyLocation;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [HttpClientTestingModule, RouterTestingModule]
            });
            spy = TestBed.inject(SpyLocation);
          });

          it('dummy', () => expect(spy.urlChanges).toBeDefined());
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('RouterTestingModule');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { TestBed } from '@angular/core/testing';
        import { HttpClientTestingModule } from '@angular/common/http/testing';
        import { SpyLocation, provideLocationMocks } from '@angular/common/testing';

        describe('SpyLocation with use urlChanges', () => {
          let spy: SpyLocation;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [HttpClientTestingModule, RouterModule],
              providers: [provideLocationMocks()]
            });
            spy = TestBed.inject(SpyLocation);
          });

          it('dummy', () => expect(spy.urlChanges).toBeDefined());
        });
        `),
      );
    });

    it('should not add provideLocationMocks again if it is already present and `SpyLocation.urlChanges` is used', async () => {
      const original = `
        import { TestBed } from '@angular/core/testing';
        import { SpyLocation, provideLocationMocks } from '@angular/common/testing';
        import { Location } from '@angular/common';
        
        describe('test', () => {
          let mockLocation: Location;
          let spy: SpyLocation;
          beforeEach(() => {
            TestBed.configureTestingModule({
              providers: [provideLocationMocks()]
            });
            spy = TestBed.inject(SpyLocation);
            mockLocation = TestBed.inject(Location);
          });

          it('test', () => {
            expect(spy.urlChanges).toBeDefined();
            expect(mockLocation.onUrlChange).toBeDefined();
          });
        });
      `;

      writeFile('/test.spec.ts', original);

      await runMigration();

      const content = tree.readContent('/test.spec.ts');

      expect(stripWhitespace(content)).toContain(stripWhitespace(original));
    });

    it('should not add provideLocationMocks when `SpyLocation` is imported but `urlChanges` is not accessed', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { SpyLocation } from '@angular/common/testing';

        describe('test', () => {
          let spyLocation: SpyLocation;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterTestingModule]
            });
            spyLocation = TestBed.inject(SpyLocation);
          });
          it('test', () => {
            expect(spyLocation.path()).toBe('/');
          });
        });
      `,
      );

      await runMigration();
      const content = tree.readContent('/test.spec.ts');

      expect(content).not.toContain('RouterTestingModule');
      expect(content).not.toContain('provideLocationMocks');

      expect(stripWhitespace(content)).toContain(
        stripWhitespace(`
        import { RouterModule } from '@angular/router';
        import { TestBed } from '@angular/core/testing';
        import { SpyLocation } from '@angular/common/testing';

        describe('test', () => {
          let spyLocation: SpyLocation;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule]
            });
            spyLocation = TestBed.inject(SpyLocation);
          });
          it('test', () => {
            expect(spyLocation.path()).toBe('/');
          });
        });
        `),
      );
    });

    it('should add provideLocationMocks when RouterTestingModule.withRoutes(routes, options) is used and `SpyLocation.urlChanges` is accessed', async () => {
      writeFile(
        '/test.spec.ts',
        `
        import { TestBed } from '@angular/core/testing';
        import { RouterTestingModule } from '@angular/router/testing';
        import { SpyLocation } from '@angular/common/testing';

        const routes = [{path: 'test', component: TestComponent}];

        describe('test', () => {
          let spy: SpyLocation;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterTestingModule.withRoutes(routes , { useHash: true })]
            });
            spy = TestBed.inject(SpyLocation);
            spy.urlChanges;
          });
          it('test', () => {
            expect(spy.urlChanges).toBeDefined();
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
        import { TestBed } from '@angular/core/testing';
        import { SpyLocation, provideLocationMocks } from '@angular/common/testing';

        const routes = [{path: 'test', component: TestComponent}];

        describe('test', () => {
          let spy: SpyLocation;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [RouterModule.forRoot(routes, { useHash: true })],
              providers: [provideLocationMocks()]
            });
            spy = TestBed.inject(SpyLocation);
            spy.urlChanges;
          });
          it('test', () => {
            expect(spy.urlChanges).toBeDefined();
          });
        });
        `),
      );
    });
  });
});
