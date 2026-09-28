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

describe('route input binding migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let logs: string[];

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options: {path?: string} = {}) {
    return runner.runSchematic('route-input-binding-migration', options, tree);
  }

  function writeAppConfig(features = 'withComponentInputBinding()') {
    writeFile(
      '/app.config.ts',
      `
        import {provideRouter, withComponentInputBinding} from '@angular/router';
        import {routes} from './routes';

        export const appConfig = {providers: [provideRouter(routes, ${features})]};
      `,
    );
  }

  function writeRoutes(
    routes: string,
    imports = `import {UserComponent} from './user.component';`,
  ) {
    writeFile(
      '/routes.ts',
      `
        import {Routes} from '@angular/router';
        ${imports}

        export const routes: Routes = ${routes};
      `,
    );
  }

  const collectionJsonPath = resolve('../collection.json');

  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    logs = [];
    runner.logger.subscribe((entry) => logs.push(entry.message));

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );
    writeFile(
      '/node_modules/@angular/core/index.d.ts',
      `
        export declare function Component(metadata: any): any;
        export declare function Input(options?: any): any;
        export declare function inject<T>(token: new (...args: any[]) => T): T;
        export declare const input: any;
      `,
    );
    writeFile(
      '/node_modules/@angular/router/index.d.ts',
      `
        export interface ParamMap { get(name: string): string | null; }
        export declare class ActivatedRouteSnapshot {
          params: {[key: string]: any};
          queryParams: {[key: string]: any};
          paramMap: ParamMap;
          queryParamMap: ParamMap;
          data: {[key: string]: any};
        }
        export declare class ActivatedRoute {
          snapshot: ActivatedRouteSnapshot;
        }
        export interface Route {
          path?: string;
          component?: any;
          loadComponent?: () => any;
          data?: any;
          resolve?: any;
          children?: Route[];
        }
        export type Routes = Route[];
        export declare function provideRouter(routes: Routes, ...features: any[]): any;
        export declare function withComponentInputBinding(options?: any): any;
        export declare class Router {
          navigate(commands: any[], extras?: any): any;
        }
        export declare class RouterModule {
          static forRoot(routes: Routes, options?: any): any;
        }
      `,
    );

    previousWorkingDir = process.cwd();
    tmpDirPath = getSystemPath(host.root);
    process.chdir(tmpDirPath);
  });

  afterEach(() => {
    process.chdir(previousWorkingDir);
    rmSync(tmpDirPath, {recursive: true});
  });

  it('should migrate a path param read from an inject() field', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      [
        `import {Component, inject} from '@angular/core';`,
        `import {ActivatedRoute} from '@angular/router';`,
        ``,
        `@Component({template: ''})`,
        `export class UserComponent {`,
        `  private route = inject(ActivatedRoute);`,
        ``,
        `  ngOnInit() {`,
        `    console.log(this.route.snapshot.paramMap.get('id'));`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(
      [
        `import {Component, input} from '@angular/core';`,
        ``,
        ``,
        `@Component({template: ''})`,
        `export class UserComponent {`,
        `  readonly id = input.required<string>();`,
        ``,
        `  ngOnInit() {`,
        `    console.log(this.id());`,
        `  }`,
        `}`,
      ].join('\n'),
    );
  });

  it('should migrate a path param read from a constructor parameter property', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      [
        `import {Component} from '@angular/core';`,
        `import {ActivatedRoute} from '@angular/router';`,
        ``,
        `@Component({template: ''})`,
        `export class UserComponent {`,
        `  constructor(private route: ActivatedRoute) {}`,
        ``,
        `  getId() {`,
        `    return this.route.snapshot.params['id'];`,
        `  }`,
        `}`,
      ].join('\n'),
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`import {Component, input} from '@angular/core';`);
    expect(content).not.toContain('ActivatedRoute');
    expect(content).not.toContain('constructor');
    expect(content).toContain(`  readonly id = input.required<string>();\n`);
    expect(content).toContain(`return this.id();`);
  });

  it('should keep other constructor parameters', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component} from '@angular/core';
        import {ActivatedRoute, Router} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          constructor(private route: ActivatedRoute, private router: Router) {}

          getId() {
            return this.route.snapshot.params.id;
          }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`constructor(private router: Router) {}`);
    expect(content).toContain(`import {Router} from '@angular/router';`);
    expect(content).toContain(`return this.id();`);
  });

  it('should not migrate if component input binding is not enabled', async () => {
    writeAppConfig('');
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
    expect(logs.join('\n')).toContain('withComponentInputBinding()');
  });

  it('should not migrate if any app router setup does not enable input binding', async () => {
    writeAppConfig();
    writeFile(
      '/other-app.config.ts',
      `
        import {provideRouter} from '@angular/router';
        export const otherConfig = {providers: [provideRouter([])]};
      `,
    );
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should ignore router setups in test files', async () => {
    writeAppConfig();
    writeFile(
      '/app.spec.ts',
      `
        import {provideRouter} from '@angular/router';
        const providers = [provideRouter([])];
      `,
    );
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toContain('this.id()');
  });

  it('should detect input binding enabled through RouterModule.forRoot', async () => {
    writeFile(
      '/app.module.ts',
      `
        import {RouterModule} from '@angular/router';
        import {routes} from './routes';

        export const imports = [RouterModule.forRoot(routes, {bindToComponentInputs: true})];
      `,
    );
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toContain('this.id()');
  });

  it('should migrate query param reads to optional inputs', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'search', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);

          ngOnInit() {
            const query = this.route.snapshot.queryParamMap.get('q');
            const page = this.route.snapshot.queryParamMap.get('page')?.length;
            const sort = this.route.snapshot.queryParams['sort'];
          }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`readonly q = input<string>();`);
    expect(content).toContain(`readonly page = input<string>();`);
    expect(content).toContain(`readonly sort = input<string>();`);
    expect(content).toContain(`const query = this.q() ?? null;`);
    expect(content).toContain(`const page = (this.page() ?? null)?.length;`);
    expect(content).toContain(`const sort = this.sort();`);
  });

  it('should not migrate query param reads if query params are not bound', async () => {
    writeAppConfig('withComponentInputBinding({queryParams: false})');
    writeRoutes(`[{path: 'search', component: UserComponent}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.queryParamMap.get('q'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate a param that is not guaranteed by the path when query params are bound', async () => {
    writeAppConfig();
    writeRoutes(`[
      {path: 'user/new', component: UserComponent},
      {path: 'user/:id', component: UserComponent},
    ]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should migrate an optional param when query params are not bound', async () => {
    writeAppConfig('withComponentInputBinding({queryParams: false})');
    writeRoutes(`[
      {path: 'user/new', component: UserComponent},
      {path: 'user/:id', component: UserComponent},
    ]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { const id = this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`readonly id = input<string>();`);
    expect(content).toContain(`const id = this.id() ?? null;`);
  });

  it('should treat params of a parent route as guaranteed for an empty child path', async () => {
    writeAppConfig();
    writeRoutes(`[
      {path: 'user/:id', children: [{path: '', component: UserComponent}]},
    ]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toContain(
      `readonly id = input.required<string>();`,
    );
  });

  it('should not migrate reads that collide with route data', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent, resolve: {id: () => 1}}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate if route data cannot be analyzed', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent, data: someData}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate reads in the constructor or field initializers', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        idFromField = this.route.snapshot.paramMap.get('id');

        constructor() {
          console.log(this.route.snapshot.paramMap.get('id'));
        }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate reads in methods that are called during construction', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        label = this.getLabel();

        constructor() {
          this.load();
        }

        private load() {
          this.fetch();
        }

        private fetch() {
          console.log(this.route.snapshot.paramMap.get('id'));
        }

        private getLabel() {
          return this.route.snapshot.paramMap.get('name');
        }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should keep the ActivatedRoute if it is used for other purposes', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute, Router} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          private router = inject(Router);

          edit() {
            const id = this.route.snapshot.paramMap.get('id');
            this.router.navigate(['edit', id], {relativeTo: this.route});
          }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`private route = inject(ActivatedRoute);`);
    expect(content).toContain(`import {ActivatedRoute, Router} from '@angular/router';`);
    expect(content).toContain(`readonly id = input.required<string>();`);
    expect(content).toContain(`const id = this.id();`);
  });

  it('should not remove an ActivatedRoute member that is not private', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          protected route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`protected route = inject(ActivatedRoute);`);
    expect(content).toContain(`this.id();`);
  });

  it('should not migrate components that are not routed', async () => {
    writeAppConfig();
    writeRoutes(`[]`, '');
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate routed components that are also imported by other components', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/parent.component.ts',
      `
        import {Component} from '@angular/core';
        import {UserComponent} from './user.component';

        @Component({template: '<app-user />', imports: [UserComponent]})
        export class ParentComponent {}
      `,
    );
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({selector: 'app-user', template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate if a route declares resources', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent, resources: () => ({})}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate routed components that are extended by other classes', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/admin.component.ts',
      `
        import {Component} from '@angular/core';
        import {UserComponent} from './user.component';

        @Component({selector: 'app-admin', template: ''})
        export class AdminComponent extends UserComponent {}
      `,
    );
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not treat objects of other types as routes', async () => {
    writeAppConfig();
    writeFile(
      '/tabs.ts',
      `
        import {UserComponent} from './user.component';

        interface Tab { path: string; component: unknown; }
        export const tab: Tab = {path: 'user/:id', component: UserComponent};
      `,
    );
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should not migrate query params that collide with a path param', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        ngOnInit() { this.route.snapshot.queryParamMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should support aliased imports and private class fields', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject as ngInject} from '@angular/core';
        import {ActivatedRoute as Route} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          #route = ngInject(Route);
          ngOnInit() { this.#route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`readonly id = input.required<string>();`);
    expect(content).toContain(`this.id();`);
    expect(content).not.toContain('#route');
    expect(content).not.toContain('@angular/router');
    expect(content).not.toContain('ngInject');
  });

  it('should keep the inject import if it is still used', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute, Router} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          private router = inject(Router);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`import {Component, inject, input} from '@angular/core';`);
    expect(content).toContain(`import {Router} from '@angular/router';`);
    expect(content).toContain(`private router = inject(Router);`);
  });

  it('should migrate multiple components in the same file', async () => {
    writeAppConfig();
    writeRoutes(
      `[
        {path: 'user/:id', component: UserComponent},
        {path: 'team/:teamId', component: TeamComponent},
      ]`,
      `import {UserComponent, TeamComponent} from './user.component';`,
    );
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }

        @Component({template: ''})
        export class TeamComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('teamId'); }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`readonly id = input.required<string>();`);
    expect(content).toContain(`readonly teamId = input.required<string>();`);
    expect(content).toContain(`this.id();`);
    expect(content).toContain(`this.teamId();`);
    expect(content).not.toContain('ActivatedRoute');
    expect(content).toContain(`import {Component, input} from '@angular/core';`);
  });

  it('should ignore reads where this does not refer to the component', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() {
            const other = {route: inject(ActivatedRoute), read() { return this.route.snapshot.paramMap.get('x'); }};
            return this.route.snapshot.paramMap.get('id');
          }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`return this.id();`);
    expect(content).toContain(`return this.route.snapshot.paramMap.get('x');`);
    expect(content).not.toContain('input<string>()');
  });

  it('should resolve lazy loaded components', async () => {
    writeAppConfig();
    writeRoutes(
      `[
        {path: 'user/:id', loadComponent: () => import('./user.component').then(m => m.UserComponent)},
        {path: 'profile/:name', loadComponent: () => import('./profile.component')},
      ]`,
      '',
    );
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );
    writeFile(
      '/profile.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export default class ProfileComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('name'); }
        }
      `,
    );

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toContain('this.id()');
    expect(tree.readContent('/profile.component.ts')).toContain('this.name()');
  });

  it('should use an alias for keys that are not valid identifiers', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:user-id', component: UserComponent}]`);
    writeFile(
      '/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('user-id'); }
        }
      `,
    );

    await runMigration();

    const content = tree.readContent('/user.component.ts');
    expect(content).toContain(`readonly userId = input.required<string>({alias: 'user-id'});`);
    expect(content).toContain(`this.userId();`);
  });

  it('should not migrate reads whose input name conflicts with an existing member', async () => {
    writeAppConfig();
    writeRoutes(`[{path: 'user/:id', component: UserComponent}]`);
    const source = `
      import {Component, inject} from '@angular/core';
      import {ActivatedRoute} from '@angular/router';

      @Component({template: ''})
      export class UserComponent {
        private route = inject(ActivatedRoute);
        id = 0;
        ngOnInit() { this.route.snapshot.paramMap.get('id'); }
      }
    `;
    writeFile('/user.component.ts', source);

    await runMigration();

    expect(tree.readContent('/user.component.ts')).toBe(source);
  });

  it('should only migrate files within the given path', async () => {
    writeAppConfig();
    writeRoutes(
      `[{path: 'user/:id', component: UserComponent}]`,
      `import {UserComponent} from './app/user.component';`,
    );
    writeFile(
      '/app/user.component.ts',
      `
        import {Component, inject} from '@angular/core';
        import {ActivatedRoute} from '@angular/router';

        @Component({template: ''})
        export class UserComponent {
          private route = inject(ActivatedRoute);
          ngOnInit() { this.route.snapshot.paramMap.get('id'); }
        }
      `,
    );

    await runMigration({path: './other'});
    expect(tree.readContent('/app/user.component.ts')).not.toContain('this.id()');

    await runMigration({path: './app'});
    expect(tree.readContent('/app/user.component.ts')).toContain('this.id()');
  });
});
