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
import {resolve} from 'path';
import shx from 'shelljs';

describe('route lazy loading migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(mode: string, path = './') {
    return runner.runSchematic('route-lazy-loading', {mode, path}, tree);
  }

  function stripWhitespace(content: string) {
    return content.replace(/\s+/g, '');
  }
  const collectionJsonPath = resolve('../collection.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
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

    writeFile(
      '/node_modules/@angular/router/index.d.ts',
      `
    export declare interface Route {
      path?: string;
      component?: any;
      loadComponent?: () => any | Promise<any> ;
      children?: Route[];
    }

    export declare type Routes = Route[];
    `,
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

  it('should throw an error if no files match the passed-in path', async () => {
    let error: string | null = null;

    writeFile('dir.ts', `const hello = 'world';`);

    try {
      await runMigration('route-lazy-loading', './foo');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(/Could not find any files to migrate under the path .*\/foo\./);
  });

  it('should throw an error if a path outside of the project is passed in', async () => {
    let error: string | null = null;

    writeFile('dir.ts', `const hello = 'world';`);

    try {
      await runMigration('route-lazy-loading', '../foo');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toBe('Cannot run route lazy loading migration outside of the current project.');
  });

  it('should throw an error if the passed in path is a file', async () => {
    let error: string | null = null;

    writeFile('dir.ts', '');

    try {
      await runMigration('route-lazy-loading', './dir.ts');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(
      /Migration path .*\/dir\.ts has to be a directory\. Cannot run the route lazy loading migration/,
    );
  });

  it('should throw an error if the component is in the same file as the routes declaration', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule, Component} from '@angular/core';
      import {RouterModule} from '@angular/router';

      @Component({template: 'hello', standalone: true})
      export class TestComponent {}

      @NgModule({
        imports: [RouterModule.forRoot([{path: 'test', component: TestComponent}])],
      })
      export class AppModule {}
    `,
    );

    let error: string | undefined;
    try {
      await runMigration('route-lazy-loading');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(/Could not find any files to migrate under the path .*\/\./);
  });

  it('should not migrate already lazy loaded standalone components', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';
      @NgModule({
        imports: [RouterModule.forRoot([{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}])],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    let error: string | undefined;
    try {
      await runMigration('route-lazy-loading');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(/Could not find any files to migrate under the path .*\/\./);
  });

  it('should migrate standalone components in a different file from the routes declaration', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {TestComponent} from './test';

      @NgModule({
        imports: [RouterModule.forRoot([{path: 'test', component: TestComponent}])],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
         import {NgModule} from '@angular/core';
         import {RouterModule} from '@angular/router';

         @NgModule({
           imports: [RouterModule.forRoot([{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}])],
         })
         export class AppModule {}
      `),
    );
  });

  it('should support provideRouter, RouterModule.forRoot, RouterModule.forChild', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule, provideRouter} from '@angular/router';
      import {TestComponent} from './test';

      const routes = [{path: 'test', component: TestComponent}];
      const routes2 = [{path: 'test', component: TestComponent}];

      @NgModule({
        imports: [
          RouterModule.forRoot([{path: 'test', component: TestComponent}]),
          RouterModule.forChild([{path: 'test', component: TestComponent}]),
        ],
        providers: [
          provideRouter(routes),
          provideRouter(routes),
          provideRouter(routes2)
        ],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
        import {NgModule} from '@angular/core';
        import {RouterModule, provideRouter} from '@angular/router';

        const routes = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];
        const routes2 = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];

        @NgModule({
          imports: [
            RouterModule.forRoot([{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}]),
            RouterModule.forChild([{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}]),
          ],
          providers: [
            provideRouter(routes),
            provideRouter(routes),
            provideRouter(routes2)
          ],
        })
        export class AppModule {}
      `),
    );
  });

  it('should support provideRoutes', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {provideRoutes} from '@angular/router';
      import {TestComponent} from './test';

      const routes = [{path: 'test', component: TestComponent}];

      @NgModule({
        providers: [provideRoutes(routes)],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
        import {NgModule} from '@angular/core';
        import {provideRoutes} from '@angular/router';

        const routes = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];

        @NgModule({
          providers: [provideRoutes(routes)],
        })
        export class AppModule {}
      `),
    );
  });

  it('should skip not standalone components', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {provideRoutes} from '@angular/router';
      import {TestComponent} from './test';
      import {StandaloneByDefaultComponent} from './standalone-by-default';
      import {NotStandaloneComponent} from './not-standalone';

      const routes = [
        {path: 'test', component: TestComponent},
        {path: 'test1', component: NotStandaloneComponent},
        {path: 'test2', component: StandaloneByDefaultComponent},
      ];

      @NgModule({
        providers: [provideRoutes(routes)],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    writeFile(
      'standalone-by-default.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello'})
      export class StandaloneByDefaultComponent {}
    `,
    );

    writeFile(
      'not-standalone.ts',
      `
      import {Component, NgModule} from '@angular/core';
      @Component({template: 'hello', standalone: false})
      export class NotStandaloneComponent {}

      @NgModule({declarations: [NotStandaloneComponent], exports: [NotStandaloneComponent]})
      export class NotStandaloneModule {}
      `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
        import {NgModule} from '@angular/core';
        import {provideRoutes} from '@angular/router';
        import {NotStandaloneComponent} from './not-standalone';

        const routes = [
          {path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)},
          {path: 'test1', component: NotStandaloneComponent},
          {path: 'test2', loadComponent: () => import('./standalone-by-default').then(m => m.StandaloneByDefaultComponent)},
        ];

        @NgModule({
          providers: [provideRoutes(routes)],
        })
        export class AppModule {}
      `),
    );
  });

  it('should support Router.resetConfig', async () => {
    writeFile(
      'app.module.ts',
      `
      import {Component} from '@angular/core';
      import {Router} from '@angular/router';
      import {TestComponent} from './test';

      const routes = [{path: 'test', component: TestComponent}];

      @Component({})
      export class AppComponent {
        constructor(private router: Router) {}
        someMethod() {
          this.router.resetConfig(routes);
        }
      }
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
          import {Component} from '@angular/core';
          import {Router} from '@angular/router';

          const routes = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];

          @Component({})
          export class AppComponent {
            constructor(private router: Router) {}
            someMethod() {
              this.router.resetConfig(routes);
            }
          }
      `),
    );
  });

  it('should support migrating default exported components', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {provideRouter} from '@angular/router';
      import TestComponent from './test';

      const routes = [{path: 'test', component: TestComponent}];

      @NgModule({
        providers: [provideRouter(routes)],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export default class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
        import {NgModule} from '@angular/core';
        import {provideRouter} from '@angular/router';

        const routes = [{path: 'test', loadComponent: () => import('./test')}];

        @NgModule({
          providers: [provideRouter(routes)],
        })
        export class AppModule {}
      `),
    );
  });

  it('should migrate multiple components', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {routes} from './routes';

      @NgModule({
        imports: [RouterModule.forRoot(routes],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'routes.ts',
      `
      import {Routes, Route} from '@angular/router';
      import {TestComponent} from './test';
      import {Test1Component} from './cmp1';
      export const routes: Routes = [
        {path: 'test', component: TestComponent},
        {path: 'test1', component: Test1Component},
      ];
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );
    writeFile(
      'cmp1.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class Test1Component {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('routes.ts'))).toContain(
      stripWhitespace(`
         import {Routes, Route} from '@angular/router';
         export const routes: Routes = [
          {path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)},
          {path: 'test1', loadComponent: () => import('./cmp1').then(m => m.Test1Component)},
         ];
      `),
    );
  });

  it('should migrate nested children components', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {routes} from './routes';
      @NgModule({ imports: [RouterModule.forRoot(routes] })
      export class AppModule {}
    `,
    );

    writeFile(
      'routes.ts',
      `
      import {Routes} from '@angular/router';
      import {TestComponent} from './test';
      import {Test1Component} from './cmp1';
      export const routes: Routes = [
        {path: 'test', component: TestComponent},
        {path: 'test1', component: Test1Component},
        {
          path:'nested',
          children: [
            {
              path: 'test',
              component: TestComponent,
              children: [
                {path: 'test', component: TestComponent},
                {path: 'test1', component: Test1Component},
                {
                  path: 'nested1',
                  children: [
                    {path: 'test', component: TestComponent},
                  ],
                },
              ],
            },
            {path: 'test', component: TestComponent},
          ]
        },
      ];
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );
    writeFile(
      'cmp1.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class Test1Component {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('routes.ts'))).toContain(
      stripWhitespace(`
         import {Routes} from '@angular/router';
         export const routes: Routes = [
          {path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)},
          {path: 'test1', loadComponent: () => import('./cmp1').then(m => m.Test1Component)},
          {
            path:'nested',
            children: [
              {
                path: 'test',
                loadComponent: () => import('./test').then(m => m.TestComponent),
                children: [
                  {path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)},
                  {path: 'test1', loadComponent: () => import('./cmp1').then(m => m.Test1Component)},
                  {
                    path: 'nested1',
                    children: [
                      {path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)},
                    ],
                  },
                ],
              },
              {path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)},
            ]
          },
         ];
      `),
    );
  });

  it('should migrate routes if the routes file in is another file with type', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {routes} from './routes';

      @NgModule({
        imports: [RouterModule.forRoot(routes],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'routes.ts',
      `
      import {Routes, Route} from '@angular/router';
      import {TestComponent} from './test';
      import {Test2 as Test2Alias} from './test2';
      export const routes: Routes = [{path: 'test', component: TestComponent}];
      export const routes1: Route[] = [{path: 'test', component: Test2Alias}];
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );
    writeFile(
      'test2.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class Test2 {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('routes.ts'))).toContain(
      stripWhitespace(`
         import {Routes, Route} from '@angular/router';
         export const routes: Routes = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];
         export const routes1: Route[] = [{path: 'test', loadComponent: () => import('./test2').then(m => m.Test2)}];
      `),
    );
  });

  it('should migrate routes array if the Routes type is aliased', async () => {
    writeFile(
      'routes.ts',
      `
      import {Routes as Routes1, Route as Route1} from '@angular/router';
      import {TestComponent} from './test';
      export const routes: Routes1 = [{path: 'test', component: TestComponent}];
      export const routes1: Route1[] = [{path: 'test', component: TestComponent}];
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('routes.ts'))).toContain(
      stripWhitespace(`
        import {Routes as Routes1, Route as Route1} from '@angular/router';
        export const routes: Routes1 = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];
        export const routes1: Route1[] = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];
      `),
    );
  });

  it('should support components with additional decorators', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {TestComponent} from './test';

      @NgModule({
        imports: [RouterModule.forRoot([{path: 'test', component: TestComponent}])],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component, Directive} from '@angular/core';

      function OtherDecorator() {}

      @OtherDecorator()
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('app.module.ts'))).toContain(
      stripWhitespace(`
         import {NgModule} from '@angular/core';
         import {RouterModule} from '@angular/router';

         @NgModule({
           imports: [RouterModule.forRoot([{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}])],
         })
         export class AppModule {}
      `),
    );
  });

  it('should not migrate routes if the routes array doesnt have type and is not referenced', async () => {
    writeFile(
      'routes.ts',
      `
     import {TestComponent} from './test';
     export const routes = [{path: 'test', component: TestComponent}];
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    let error: string | null = null;
    try {
      await runMigration('route-lazy-loading');
    } catch (e: any) {
      error = e.message;
    }

    expect(error).toMatch(/Could not find any files to migrate under the path/);
  });

  xit('should migrate routes if the routes file in is another file without type', async () => {
    writeFile(
      'app.module.ts',
      `
      import {NgModule} from '@angular/core';
      import {RouterModule} from '@angular/router';
      import {routes} from './routes';

      @NgModule({
        imports: [RouterModule.forRoot(routes],
      })
      export class AppModule {}
    `,
    );

    writeFile(
      'routes.ts',
      `
     import {TestComponent} from './test';
     export const routes = [{path: 'test', component: TestComponent}];
    `,
    );

    writeFile(
      'test.ts',
      `
      import {Component} from '@angular/core';
      @Component({template: 'hello', standalone: true})
      export class TestComponent {}
    `,
    );

    await runMigration('route-lazy-loading');

    expect(stripWhitespace(tree.readContent('routes.ts'))).toContain(
      stripWhitespace(`
        export const routes = [{path: 'test', loadComponent: () => import('./test').then(m => m.TestComponent)}];
      `),
    );
  });

  // TODO: support multiple imports of components
  // ex import * as Components from './components';
  // export const MenuRoutes: Routes = [
  //   {
  //     path: 'menu',
  //     component: Components.MenuListComponent
  //   },
  // ];
});
