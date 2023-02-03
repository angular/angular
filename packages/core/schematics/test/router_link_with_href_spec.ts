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

describe('RouterLinkWithHref migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('migration-v15-router-link-with-href', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
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
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/router/index.d.ts', `
      export class RouterLink implements OnChanges, OnDestroy {
        constructor(router: Router, route: ActivatedRoute, tabIndexAttribute: string | null | undefined, renderer: Renderer2, el: ElementRef, locationStrategy?: LocationStrategy | undefined);
      }
      export class RouterLinkWithHref extends RouterLink {
        constructor(router: Router, route: ActivatedRoute, locationStrategy: LocationStrategy);
      }
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

  it('should rename imports and references', async () => {
    writeFile('/index.ts', `
        import { Component, QueryList, ViewChild, ViewChildren, ContentChild, ContentChildren } from '@angular/core';
        import { RouterLinkWithHref, RouterModule } from '@angular/router';

        @Component({
          standalone: true,
          template: \`<a [routerLink]="'/abc'">Link</a>\`,
          imports: [RouterLinkWithHref, RouterModule]
        })
        export class MyComponent {
          @ViewChild(RouterLinkWithHref) aLink!: RouterLinkWithHref;
          @ViewChildren(RouterLinkWithHref) aLinks!: QueryList<RouterLinkWithHref>;
          @ContentChild(RouterLinkWithHref) aLinkContent!: RouterLinkWithHref;
          @ContentChildren(RouterLinkWithHref) aLinksContent!: QueryList<RouterLinkWithHref>;
        }
      `);

    await runMigration();
    const cases = [
      // Imported `RouterLinkWithHref` symbol is rewritten.
      `import { RouterLink, RouterModule } from '@angular/router';`,
      // RouterLinkWithHref in component imports is rewritten,
      // but other symbols (for ex. RouterModule) remain the same.
      `imports: [RouterLink, RouterModule]`,
      // View/Child queries are updated.
      `@ViewChild(RouterLink) aLink!: RouterLink;`,
      `@ViewChildren(RouterLink) aLinks!: QueryList<RouterLink>;`,
      `@ContentChild(RouterLink) aLinkContent!: RouterLink;`,
      `@ContentChildren(RouterLink) aLinksContent!: QueryList<RouterLink>;`,
    ];
    const content = tree.readContent('/index.ts');
    cases.forEach(t => expect(content).toContain(t));
  });

  it('should not rename symbols imported from other modules', async () => {
    writeFile('/index.ts', `
        import { Component, QueryList, ViewChild, ViewChildren, ContentChild, ContentChildren } from '@angular/core';
        import { RouterLinkWithHref } from './some-local-folder/custom-router-links';

        @Component({
          standalone: true,
          template: \`<a [routerLink]="'/abc'">Link</a>\`,
          imports: [RouterLinkWithHref]
        })
        export class MyComponent {}
      `);
    await runMigration();
    const cases = [
      // The `RouterLinkWithHref` symbol is retained, since it's coming from
      // a different module, so it may have a different implementation.
      `import { RouterLinkWithHref } from './some-local-folder/custom-router-links';`,
      // Symbols in the code are also retained as is.
      `imports: [RouterLinkWithHref]`,
    ];
    const content = tree.readContent('/index.ts');
    cases.forEach(t => expect(content).toContain(t));
  });

  it('should handle a case when both `RouterLink` and `RouterLinkWithHref` are present',
     async () => {
       writeFile('/index.ts', `
        import { Component, QueryList, ViewChild, ViewChildren, ContentChild, ContentChildren } from '@angular/core';
        import { RouterLink, RouterLinkWithHref, RouterModule } from '@angular/router';

        @Component({
          standalone: true,
          template: \`<a [routerLink]="'/abc'">Link</a>\`,
          imports: [RouterModule]
        })
        export class MyComponent {
          @ViewChild(RouterLink) aNonLink!: RouterLink;
          @ViewChild(RouterLinkWithHref) aLink!: RouterLinkWithHref;
        }
      `);
       await runMigration();
       const cases = [
         // The `RouterLinkWithHref` symbol is dropped from the import.
         `import { RouterLink, RouterModule } from '@angular/router';`,
         // Other imported symbols remain untouched.
         `imports: [RouterModule]`,
         // Queries are rewritten correctly.
         `@ViewChild(RouterLink) aNonLink!: RouterLink;`,
         `@ViewChild(RouterLink) aLink!: RouterLink;`,
       ];
       const content = tree.readContent('/index.ts');
       cases.forEach(t => expect(content).toContain(t));
     });
});
