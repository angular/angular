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
import {RouterParamsInheritanceMigration} from './migration';

describe('router-params-inheritance migration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  async function migrate(contents: string, fileName = '/index.ts'): Promise<string> {
    const {fs} = await runTsurgeMigration(new RouterParamsInheritanceMigration(), [
      {name: absoluteFrom(fileName), isProgramRootFile: true, contents},
    ]);
    return fs.readFile(absoluteFrom(fileName));
  }

  describe('provideRouter', () => {
    it('adds withRouterConfig when there are no features', async () => {
      const content = await migrate(`
        import { provideRouter } from '@angular/router';
        export const appConfig = { providers: [provideRouter([])] };
      `);

      expect(content).toContain(`withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' })`);
      expect(content).toMatch(/import \{[^}]*withRouterConfig[^}]*\}/);
    });

    it('adds withRouterConfig alongside existing features', async () => {
      const content = await migrate(`
        import { provideRouter, withHashLocation } from '@angular/router';
        export const appConfig = { providers: [provideRouter([], withHashLocation())] };
      `);

      expect(content).toContain(`withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' })`);
      expect(content).toContain('withHashLocation()');
    });

    it('does not add a second withRouterConfig when one is already present', async () => {
      const content = await migrate(`
        import { provideRouter, withRouterConfig } from '@angular/router';
        export const appConfig = {
          providers: [provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' }))],
        };
      `);

      expect(content).toContain(
        `withRouterConfig({ onSameUrlNavigation: 'reload', paramsInheritanceStrategy: 'emptyOnly' })`,
      );
      expect(content).toContain(`paramsInheritanceStrategy: 'emptyOnly'`);
    });

    it('updates multiple provideRouter calls in the same file', async () => {
      const content = await migrate(`
        import { provideRouter } from '@angular/router';
        const configA = { providers: [provideRouter(routesA)] };
        const configB = { providers: [provideRouter(routesB)] };
      `);

      expect((content.match(/paramsInheritanceStrategy/g) ?? []).length).toBe(2);
    });
  });

  describe('withRouterConfig', () => {
    it('adds paramsInheritanceStrategy to an empty options object', async () => {
      const content = await migrate(`
        import { provideRouter, withRouterConfig } from '@angular/router';
        export const appConfig = { providers: [provideRouter([], withRouterConfig({}))] };
      `);

      expect(content).toContain(`withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' })`);
    });

    it('appends paramsInheritanceStrategy to a non-empty options object', async () => {
      const content = await migrate(`
        import { provideRouter, withRouterConfig } from '@angular/router';
        export const appConfig = {
          providers: [provideRouter([], withRouterConfig({ onSameUrlNavigation: 'reload' }))],
        };
      `);

      expect(content).toContain(
        `withRouterConfig({ onSameUrlNavigation: 'reload', paramsInheritanceStrategy: 'emptyOnly' })`,
      );
    });

    it('does not modify when paramsInheritanceStrategy is already set to always', async () => {
      const content = await migrate(`
        import { provideRouter, withRouterConfig } from '@angular/router';
        export const appConfig = {
          providers: [provideRouter([], withRouterConfig({ paramsInheritanceStrategy: 'always' }))],
        };
      `);

      expect(content).toContain(`withRouterConfig({ paramsInheritanceStrategy: 'always' })`);
    });

    it('does not modify when paramsInheritanceStrategy is already set to emptyOnly', async () => {
      const content = await migrate(`
        import { provideRouter, withRouterConfig } from '@angular/router';
        export const appConfig = {
          providers: [provideRouter([], withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' }))],
        };
      `);

      expect(content).toContain(`withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' })`);
    });
  });

  describe('RouterModule.forRoot', () => {
    it('adds an options object when none is present', async () => {
      const content = await migrate(
        `
        import { RouterModule } from '@angular/router';
        @NgModule({ imports: [RouterModule.forRoot(routes)] })
        export class AppModule {}
      `,
        '/app.module.ts',
      );

      expect(content).toContain(`{ paramsInheritanceStrategy: 'emptyOnly' }`);
    });

    it('adds paramsInheritanceStrategy to an empty options object', async () => {
      const content = await migrate(
        `
        import { RouterModule } from '@angular/router';
        @NgModule({ imports: [RouterModule.forRoot(routes, {})] })
        export class AppModule {}
      `,
        '/app.module.ts',
      );

      expect(content).toContain(`{ paramsInheritanceStrategy: 'emptyOnly' }`);
    });

    it('appends paramsInheritanceStrategy to a non-empty options object', async () => {
      const content = await migrate(
        `
        import { RouterModule } from '@angular/router';
        @NgModule({ imports: [RouterModule.forRoot(routes, { enableTracing: true })] })
        export class AppModule {}
      `,
        '/app.module.ts',
      );

      expect(content).toContain(`{ enableTracing: true, paramsInheritanceStrategy: 'emptyOnly' }`);
    });

    it('does not modify when paramsInheritanceStrategy is already set to always', async () => {
      const content = await migrate(
        `
        import { RouterModule } from '@angular/router';
        @NgModule({ imports: [RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'always' })] })
        export class AppModule {}
      `,
        '/app.module.ts',
      );

      expect(content).toContain(`{ paramsInheritanceStrategy: 'always' }`);
    });

    it('does not modify when paramsInheritanceStrategy is already set to emptyOnly', async () => {
      const content = await migrate(
        `
        import { RouterModule } from '@angular/router';
        @NgModule({ imports: [RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'emptyOnly' })] })
        export class AppModule {}
      `,
        '/app.module.ts',
      );

      expect(content).toContain(`{ paramsInheritanceStrategy: 'emptyOnly' }`);
    });

    it('does not modify when options argument is a variable reference', async () => {
      const content = await migrate(
        `
        import { RouterModule } from '@angular/router';
        const routerOptions = {};
        @NgModule({ imports: [RouterModule.forRoot(routes, routerOptions)] })
        export class AppModule {}
      `,
        '/app.module.ts',
      );

      expect(content).not.toContain('paramsInheritanceStrategy');
    });
  });
});
