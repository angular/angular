/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {initMockFileSystem} from '@angular/compiler-cli/private/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {CanLoadToCanMatchMigration} from './migration';

describe('CanLoadToCanMatch migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('class declaration updates', () => {
    it('should change "implements CanLoad" to "implements CanMatch" and canLoad method to canMatch', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            class MyGuard implements CanLoad {
              canLoad(route: any, segments: any) {
                return true;
              }
            }
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('class MyGuard implements CanMatch');
      expect(content).toContain('canMatch(route: any, segments: any)');
      expect(content).not.toContain('implements CanLoad');
      expect(content).not.toContain('canLoad(route: any, segments: any)');
    });

    it('should handle class implementing multiple interfaces including CanLoad', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanActivate {}
            interface CanLoad {}
            class MyGuard implements CanActivate, CanLoad {
              canActivate() { return true; }
              canLoad(route: any, segments: any) { return true; }
            }
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('class MyGuard implements CanActivate, CanMatch');
      expect(content).toContain('canMatch(route: any, segments: any)');
    });

    it('should remove CanLoad if class already implements CanMatch', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            interface CanMatch {}
            class MyGuard implements CanLoad, CanMatch {
              canLoad(route: any, segments: any) { return true; }
              canMatch(route: any, segments: any) { return true; }
            }
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('class MyGuard implements CanMatch');
      expect(content).not.toContain('implements CanMatch, CanMatch');
    });

    it('should rename canLoad method in derived class extending a guard class', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            class BaseGuard implements CanLoad {
              canLoad(route: any, segments: any) { return true; }
            }
            class SubGuard extends BaseGuard {
              override canLoad(route: any, segments: any) { return false; }
            }
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('class BaseGuard implements CanMatch');
      expect(content).toContain('canMatch(route: any, segments: any)');
      expect(content).toContain('override canMatch(route: any, segments: any)');
    });
  });

  describe('route updates', () => {
    it('should change route.canLoad to route.canMatch', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            class AuthGuard implements CanLoad {
              canLoad() { return true; }
            }
            const routes = [
              {
                path: 'admin',
                canLoad: [AuthGuard],
              }
            ];
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('canMatch: [AuthGuard]');
      expect(content).not.toContain('canLoad: [AuthGuard]');
    });

    it('should move canLoad into existing canMatch array on a route', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            const routes = [
              {
                path: 'admin',
                canMatch: [FeatureGuard],
                canLoad: [AuthGuard],
              }
            ];
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('canMatch: [FeatureGuard, AuthGuard]');
      expect(content).not.toContain('canLoad: [AuthGuard]');
    });

    it('should move canLoad with multiple guards into existing canMatch array', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            const routes = [
              {
                path: 'admin',
                canMatch: [FeatureGuard],
                canLoad: [AuthGuard, RoleGuard],
              }
            ];
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('canMatch: [FeatureGuard, AuthGuard, RoleGuard]');
      expect(content).not.toContain('canLoad:');
    });

    it('should move canLoad into empty canMatch array on a route', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            const routes = [
              {
                path: 'admin',
                canMatch: [],
                canLoad: [AuthGuard],
              }
            ];
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('canMatch: [AuthGuard]');
      expect(content).not.toContain('canLoad: [AuthGuard]');
    });
  });

  describe('callsites in tests', () => {
    it('should rename direct canLoad calls on a guard instance to canMatch', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            class MyGuard implements CanLoad {
              canLoad(route: any, segments: any) { return true; }
            }
            const guard = new MyGuard();
            const result = guard.canLoad({}, []);
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('const result = guard.canMatch({}, [])');
      expect(content).not.toContain('guard.canLoad');
    });

    it('should rename chained canLoad calls with injection to canMatch', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            class MyGuard implements CanLoad {
              canLoad(route: any, segments: any) { return true; }
            }
            declare const TestBed: { inject<T>(token: any): T };
            const result = TestBed.inject(MyGuard).canLoad({}, []);
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('TestBed.inject(MyGuard).canMatch({}, [])');
      expect(content).not.toContain('.canLoad');
    });

    it('should rename canLoad calls when guard variable is typed as CanLoad', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {
              canLoad(route: any, segments: any): any;
            }
            let guard: CanLoad;
            guard.canLoad({}, []);
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('let guard: CanMatch;');
      expect(content).toContain('guard.canMatch({}, []);');
      expect(content).not.toContain('guard.canLoad');
    });

    it('should rename canLoad in spyOn calls in tests', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            class MyGuard implements CanLoad {
              canLoad(route: any, segments: any) { return true; }
            }
            declare function spyOn(obj: any, method: string): any;
            const guard = new MyGuard();
            spyOn(guard, 'canLoad');
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain("spyOn(guard, 'canMatch')");
      expect(content).not.toContain("'canLoad'");
    });

    it('should rename canLoad property references in assertions in tests', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface CanLoad {}
            class MyGuard implements CanLoad {
              canLoad(route: any, segments: any) { return true; }
            }
            declare function expect(actual: any): any;
            const guard = new MyGuard();
            expect(guard.canLoad).toHaveBeenCalled();
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('expect(guard.canMatch).toHaveBeenCalled()');
      expect(content).not.toContain('guard.canLoad');
    });

    it('should migrate guard class without "implements CanLoad" that is used in route canLoad', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            class UntypedGuard {
              canLoad(route: any, segments: any) { return true; }
            }
            const routes = [{ path: 'lazy', canLoad: [UntypedGuard] }];
            const guard = new UntypedGuard();
            guard.canLoad({}, []);
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('canMatch: [UntypedGuard]');
      expect(content).toContain('canMatch(route: any, segments: any)');
      expect(content).toContain('guard.canMatch({}, [])');
      expect(content).not.toContain('canLoad');
    });

    it('should rename route.canLoad property access', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            interface Route {
              path?: string;
              canLoad?: any[];
              canMatch?: any[];
            }
            function checkRoute(route: Route) {
              if (route.canLoad) {
                return route.canLoad.length;
              }
              return 0;
            }
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('if (route.canMatch)');
      expect(content).toContain('return route.canMatch.length');
      expect(content).not.toContain('route.canLoad');
    });
  });

  describe('imports and type aliases', () => {
    it('should update @angular/router import from CanLoad to CanMatch', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            import { CanLoad } from '@angular/router';
            class MyGuard implements CanLoad {
              canLoad() { return true; }
            }
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain("import { CanMatch } from '@angular/router';");
      expect(content).not.toContain('CanLoad');
      expect(content).toContain('class MyGuard implements CanMatch');
      expect(content).toContain('canMatch() { return true; }');
    });

    it('should update @angular/router import preserving other specifiers', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            import { CanLoad, Route } from '@angular/router';
            class MyGuard implements CanLoad {
              canLoad() { return true; }
            }
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain('CanMatch');
      expect(content).toContain('Route');
      expect(content).not.toContain('CanLoad');
    });

    it('should update CanLoadFn type references and imports', async () => {
      const {fs} = await runTsurgeMigration(new CanLoadToCanMatchMigration(), [
        {
          name: absoluteFrom('/index.ts'),
          isProgramRootFile: true,
          contents: `
            import { CanLoadFn } from '@angular/router';
            const myGuard: CanLoadFn = () => true;
          `,
        },
      ]);

      const content = fs.readFile(absoluteFrom('/index.ts'));
      expect(content).toContain("import { CanMatchFn } from '@angular/router';");
      expect(content).toContain('const myGuard: CanMatchFn = () => true;');
      expect(content).not.toContain('CanLoadFn');
    });
  });
});
