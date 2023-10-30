/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, logging, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import shx from 'shelljs';

describe('control flow migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let errorOutput: string[] = [];
  let warnOutput: string[] = [];

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(path: string|undefined = undefined) {
    return runner.runSchematic('control-flow-migration', {path}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../collection.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    errorOutput = [];
    warnOutput = [];
    runner.logger.subscribe((e: logging.LogEntry) => {
      if (e.level === 'error') {
        errorOutput.push(e.message);
      } else if (e.level === 'warn') {
        warnOutput.push(e.message);
      }
    });

    writeFile('/tsconfig.json', '{}');
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

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

  describe('path', () => {
    it('should throw an error if no files match the passed-in path', async () => {
      let error: string|null = null;

      writeFile('dir.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[dir]'})
        export class MyDir {}
      `);

      try {
        await runMigration('./foo');
      } catch (e: any) {
        error = e.message;
      }

      expect(error).toMatch(
          /Could not find any files to migrate under the path .*\/foo\. Cannot run the control flow migration/);
    });

    it('should throw an error if a path outside of the project is passed in', async () => {
      let error: string|null = null;

      writeFile('dir.ts', `
        import {Directive} from '@angular/core';

        @Directive({selector: '[dir]'})
        export class MyDir {}
      `);

      try {
        await runMigration('../foo');
      } catch (e: any) {
        error = e.message;
      }

      expect(error).toBe('Cannot run control flow migration outside of the current project.');
    });

    it('should only migrate the paths that were passed in', async () => {
      let error: string|null = null;

      writeFile('comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `);

      writeFile('skip.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div *ngIf="show">Show me</div>\`
        })
        class Comp {
          show = false;
        }
      `);

      await runMigration('./comp.ts');
      const migratedContent = tree.readContent('/comp.ts');
      const skippedContent = tree.readContent('/skip.ts');

      expect(migratedContent)
          .toContain('template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`');
      expect(skippedContent).toContain('template: `<div *ngIf="show">Show me</div>`');
    });
  });

  describe('ngIf', () => {
    it('should migrate an inline template', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`');
    });

    it('should migrate multiple inline templates in the same file', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
        })
        class Comp {
          toggle = false;
        }

        @Component({
          template: \`<article *ngIf="show === 5">An Article</article>\`
        })
        class OtherComp {
          show = 5
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`');
      expect(content).toContain('template: `@if (show === 5) {<article>An Article</article>}`');
    });

    it('should migrate an external template', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<span *ngIf="show">Content here</span>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate a template referenced by multiple components', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {}
      `);

      writeFile('/other-comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class OtherComp {}
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<span *ngIf="show">Content here</span>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate an if case with no star', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<span ngIf="show">Content here</span>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate an if case as a binding', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<span [ngIf]="show">Content here</span>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate an if case on a container', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<ng-container *ngIf="show"><span>Content here</span></ng-container>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate an if else case', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<span *ngIf="show; else elseBlock">Content here</span>`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `} @else {`,
        `Else Content`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate an if else case when the template is above the block', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `<span *ngIf="show; else elseBlock">Content here</span>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `} @else {`,
        `Else Content`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate an if then else case', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<span *ngIf="show; then thenBlock; else elseBlock">Ignored</span>`,
        `<ng-template #thenBlock><div>THEN Stuff</div></ng-template>`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<div>THEN Stuff</div>`,
        `} @else {`,
        `Else Content`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate an if then else case with templates in odd places', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `<span *ngIf="show; then thenBlock; else elseBlock">Ignored</span>`,
        `<ng-template #thenBlock><div>THEN Stuff</div></ng-template>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<div>THEN Stuff</div>`,
        `} @else {`,
        `Else Content`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate but not remove ng-templates when referenced elsewhere', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<span *ngIf="show; then thenBlock; else elseBlock">Ignored</span>`,
        `<ng-template #thenBlock><div>THEN Stuff</div></ng-template>`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `</div>`,
        `<ng-container *ngTemplateOutlet="elseBlock"></ng-container>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (show) {`,
        `<div>THEN Stuff</div>`,
        `} @else {`,
        `Else Content`,
        `}`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `</div>`,
        `<ng-container *ngTemplateOutlet="elseBlock"></ng-container>`,
      ].join('\n'));
    });

    it('should not remove ng-templates used by other directives', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `);

      writeFile('/comp.html', [
        `<ng-template #blockUsedElsewhere><div>Block</div></ng-template>`,
        `<ng-container *ngTemplateOutlet="blockUsedElsewhere"></ng-container>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<ng-template #blockUsedElsewhere><div>Block</div></ng-template>`,
        `<ng-container *ngTemplateOutlet="blockUsedElsewhere"></ng-container>`,
      ].join('\n'));
    });

    it('should migrate if with alias', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `);

      writeFile('/comp.html', `<div *ngIf="user$ | async as user">{{ user.name }}</div>`);

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(`@if (user$ | async; as user) {<div>{{ user.name }}</div>}`);
    });

    it('should migrate if/else with alias', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<div *ngIf="user$ | async as user; else noUserBlock">{{ user.name }}</div>`,
        `<ng-template #noUserBlock>No user</ng-template>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (user$ | async; as user) {`,
        `<div>{{ user.name }}</div>`,
        `} @else {`,
        `No user`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate if/then/else with alias', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `);

      writeFile('/comp.html', [
        `<div>`,
        `<ng-container *ngIf="user$ | async as user; then userBlock; else noUserBlock">Ignored</ng-container>`,
        `<ng-template #userBlock>User</ng-template>`,
        `<ng-template #noUserBlock>No user</ng-template>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@if (user$ | async; as user) {`,
        `User`,
        `} @else {`,
        `No user`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate a nested class', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        function foo() {
          @Component({
            imports: [NgIf],
            template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
          })
          class Comp {
            toggle = false;
          }
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`');
    });

    it('should migrate a nested class', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';
        function foo() {
          @Component({
            imports: [NgIf],
            template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
          })
          class Comp {
            toggle = false;
          }
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`');
    });
  });

  describe('ngFor', () => {
    it('should migrate an inline template', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let item of items">{{item.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`');
    });

    it('should migrate multiple inline templates in the same file', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }
        const items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let item of items">{{item.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = s;
        }

        @Component({
          imports: [NgFor],
          template: \`<article><div *ngFor="let item of items">{{item.text}}</div></article>\`
        })
        class OtherComp {
          items: Item[] = s;
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`');
      expect(content).toContain(
          'template: `<article>@for (item of items; track item) {<div>{{item.text}}</div>}</article>`');
    });

    it('should migrate an external template', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        interface Item {
          id: number;
          text: string;
        }
        const items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          items: Item[] = s;
        }
      `);

      writeFile('/comp.html', [
        `<ul>`,
        `<li *ngFor="let item of items">{{item.text}}</li>`,
        `</ul>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<ul>`,
        `@for (item of items; track item) {`,
        `  <li>{{item.text}}</li>`,
        `}`,
        `</ul>`,
      ].join('\n'));
    });

    it('should migrate a template referenced by multiple components', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        interface Item {
          id: number;
          text: string;
        }
        const items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          items: Item[] = s;
        }
      `);

      writeFile('/other-comp.ts', `
        import {Component} from '@angular/core';
        interface Item {
          id: number;
          text: string;
        }
        const items: Item[] = [{id: 3, text: 'things'},{id: 4, text: 'yup'}];

        @Component({
          templateUrl: './comp.html'
        })
        class OtherComp {
          items: Item[] = s;
        }
      `);

      writeFile('/comp.html', [
        `<ul>`,
        `<li *ngFor="let item of items">{{item.text}}</li>`,
        `</ul>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<ul>`,
        `@for (item of items; track item) {`,
        `  <li>{{item.text}}</li>`,
        `}`,
        `</ul>`,
      ].join('\n'));
    });

    it('should migrate with a trackBy function', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items; trackBy: trackMeFn;">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (itm of items; track trackMeFn($index, itm)) {<li>{{itm.text}}</li>}</ul>`');
    });

    it('should migrate with an index alias', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items; let index = index">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (itm of items; track itm; let index = $index) {<li>{{itm.text}}</li>}</ul>`');
    });

    it('should migrate with an index alias with no spaces', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items; let index=index">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (itm of items; track itm; let index = $index) {<li>{{itm.text}}</li>}</ul>`');
    });

    it('should migrate with alias declared with as', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items; index as myIndex">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (itm of items; track itm; let myIndex = $index) {<li>{{itm.text}}</li>}</ul>`');
    });

    it('should migrate with a trackBy function and an aliased index', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items; trackBy: trackMeFn; index as i">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (itm of items; track trackMeFn(i, itm); let i = $index) {<li>{{itm.text}}</li>}</ul>`');
    });

    it('should migrate with multiple aliases', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items; let count = count; let first = first; let last = last; let ev = even; let od = odd;">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (itm of items; track itm; let count = $count; let first = $first; let last = $last; let ev = $even; let od = $odd) {<li>{{itm.text}}</li>}</ul>`');
    });

    it('should remove unneeded ng-containers', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ng-container *ngFor="let item of items"><p>{{item.text}}</p></ng-container>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `@for (item of items; track item) {<p>{{item.text}}</p>}`');
    });

    it('should leave ng-containers with additional attributes', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ng-container *ngFor="let item of items" [bindMe]="stuff"><p>{{item.text}}</p></ng-container>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `@for (item of items; track item) {<ng-container [bindMe]="stuff"><p>{{item.text}}</p></ng-container>}`');
    });

    it('should migrate a nested class', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        function foo() {
          @Component({
            imports: [NgFor],
            template: \`<ul><li *ngFor="let item of items">{{item.text}}</li></ul>\`
          })
          class Comp {
            items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
          }
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`');
    });

    it('should migrate a nested class', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }
        function foo() {
          @Component({
            imports: [NgFor],
            template: \`<ul><li *ngFor="let item of items">{{item.text}}</li></ul>\`
          })
          class Comp {
            items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
          }
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`');
    });
  });

  describe('ngSwitch', () => {
    it('should migrate an inline template', async () => {
      writeFile(
          '/comp.ts',
          `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          template: \`<div [ngSwitch]="testOpts">` +
              `<p *ngSwitchCase="1">Option 1</p>` +
              `<p *ngSwitchCase="2">Option 2</p>` +
              `</div>\`
        })
        class Comp {
          testOpts = "1";
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>');
    });

    it('should migrate multiple inline templates in the same file', async () => {
      writeFile(
          '/comp.ts',
          `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          template: \`<div [ngSwitch]="testOpts">` +
              `<p *ngSwitchCase="1">Option 1</p>` +
              `<p *ngSwitchCase="2">Option 2</p>` +
              `</div>\`
        })
        class Comp1 {
          testOpts = "1";
        }

        @Component({
          template: \`<div [ngSwitch]="choices">` +
              `<p *ngSwitchCase="A">Choice A</p>` +
              `<p *ngSwitchCase="B">Choice B</p>` +
              `<p *ngSwitchDefault>Choice Default</p>` +
              `</div>\`
        })
        class Comp2 {
          choices = "C";
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>`');
      expect(content).toContain(
          'template: `<div>@switch (choices) { @case (A) { <p>Choice A</p> } @case (B) { <p>Choice B</p> } @default { <p>Choice Default</p> }}</div>`');
    });

    it('should migrate an external template', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = 2;
        }
      `);

      writeFile('/comp.html', [
        `<div [ngSwitch]="testOpts">`,
        `<p *ngSwitchCase="1">Option 1</p>`,
        `<p *ngSwitchCase="2">Option 2</p>`,
        `<p *ngSwitchDefault>Option 3</p>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');
      expect(content).toBe([
        `<div>`,
        `@switch (testOpts) {`,
        `@case (1) {`,
        `  <p>Option 1</p>`,
        `}`,
        `@case (2) {`,
        `  <p>Option 2</p>`,
        `}`,
        `@default {`,
        `  <p>Option 3</p>`,
        `}`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate a template referenced by multiple components', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = 2;
        }
      `);

      writeFile('/other-comp.ts', `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class OtherComp {
          testOpts = 1;
        }
      `);

      writeFile('/comp.html', [
        `<div [ngSwitch]="testOpts">`,
        `<p *ngSwitchCase="1">Option 1</p>`,
        `<p *ngSwitchCase="2">Option 2</p>`,
        `<p *ngSwitchDefault>Option 3</p>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div>`,
        `@switch (testOpts) {`,
        `@case (1) {`,
        `  <p>Option 1</p>`,
        `}`,
        `@case (2) {`,
        `  <p>Option 2</p>`,
        `}`,
        `@default {`,
        `  <p>Option 3</p>`,
        `}`,
        `}`,
        `</div>`,
      ].join('\n'));
    });

    it('should remove unnecessary ng-containers', async () => {
      writeFile(
          '/comp.ts',
          `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          template: \`<div [ngSwitch]="testOpts">` +
              `<ng-container *ngSwitchCase="1"><p>Option 1</p></ng-container>` +
              `<ng-container *ngSwitchCase="2"><p>Option 2</p></ng-container>` +
              `</div>\`
        })
        class Comp {
          testOpts = "1";
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>');
    });

    it('should remove unnecessary ng-container on ngswitch', async () => {
      writeFile(
          '/comp.ts',
          `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          template: \`<div>` +
              `<ng-container [ngSwitch]="testOpts">` +
              `<p *ngSwitchCase="1">Option 1</p>` +
              `<p *ngSwitchCase="2">Option 2</p>` +
              `</ng-container>` +
              `</div>\`
        })
        class Comp {
          testOpts = "1";
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>');
    });

    it('should handle cases with missing star', async () => {
      writeFile(
          '/comp.ts',
          `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          template: \`<div [ngSwitch]="testOpts">` +
              `<ng-template ngSwitchCase="1"><p>Option 1</p></ng-template>` +
              `<ng-template ngSwitchCase="2"><p>Option 2</p></ng-template>` +
              `<ng-template ngSwitchDefault><p>Option 3</p></ng-template>` +
              `</div>\`
        })
        class Comp {
          testOpts = "1";
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> } @default { <p>Option 3</p> }}</div>');
    });

    it('should handle cases with binding', async () => {
      writeFile(
          '/comp.ts',
          `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          template: \`<div [ngSwitch]="testOpts">` +
              `<ng-template [ngSwitchCase]="1"><p>Option 1</p></ng-template>` +
              `<ng-template [ngSwitchCase]="2"><p>Option 2</p></ng-template>` +
              `<ng-template ngSwitchDefault><p>Option 3</p></ng-template>` +
              `</div>\`
        })
        class Comp {
          testOpts = "1";
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> } @default { <p>Option 3</p> }}</div>');
    });

    it('should migrate a nested class', async () => {
      writeFile(
          '/comp.ts',
          `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';
        function foo() {
          @Component({
            template: \`<div [ngSwitch]="testOpts">` +
              `<p *ngSwitchCase="1">Option 1</p>` +
              `<p *ngSwitchCase="2">Option 2</p>` +
              `</div>\`
          })
          class Comp {
            testOpts = "1";
          }
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>`');
    });
  });

  describe('nested structures', () => {
    it('should migrate an inline template with nested control flow structures and no line breaks',
       async () => {
         writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          again = true;
          more = true;
        }
      `);

         writeFile(
             '/comp.html',
             `<div *ngIf="show"><div *ngIf="nest"><span *ngIf="again">things</span><span *ngIf="more">stuff</span></div><span *ngIf="more">stuff</span></div>`,
         );

         await runMigration();
         const content = tree.readContent('/comp.html');

         expect(content).toBe(
             `@if (show) {<div>@if (nest) {<div>@if (again) {<span>things</span>}@if (more) {<span>stuff</span>}</div>}@if (more) {<span>stuff</span>}</div>}`,
         );
       });

    it('should migrate an inline template with multiple nested control flow structures',
       async () => {
         writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          again = true;
          more = true;
        }
      `);

         writeFile('/comp.html', [
           `<div *ngIf="show">`,
           `<span>things</span>`,
           `<div *ngIf="nest">`,
           `<span>stuff</span>`,
           `</div>`,
           `</div>`,
         ].join('\n'));

         await runMigration();
         const content = tree.readContent('/comp.html');

         expect(content).toBe([
           `@if (show) {`,
           `<div>`,
           `<span>things</span>`,
           `@if (nest) {`,
           `<div>`,
           `<span>stuff</span>`,
           `</div>`,
           `}`,
           `</div>`,
           `}`,
         ].join('\n'));
       });

    it('should migrate an inline template with multiple nested control flow structures',
       async () => {
         writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          again = true;
          more = true;
        }
      `);

         writeFile('/comp.html', [
           `<div *ngIf="show">`,
           `<span>things</span>`,
           `<div *ngIf="nest">`,
           `<span>stuff</span>`,
           `</div>`,
           `</div>`,
         ].join('\n'));

         await runMigration();
         const content = tree.readContent('/comp.html');

         expect(content).toBe([
           `@if (show) {`,
           `<div>`,
           `<span>things</span>`,
           `@if (nest) {`,
           `<div>`,
           `<span>stuff</span>`,
           `</div>`,
           `}`,
           `</div>`,
           `}`,
         ].join('\n'));
       });

    it('should migrate a simple nested case', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          again = true;
          more = true;
        }
      `);

      writeFile('/comp.html', [
        `<div *ngIf="show">`,
        `<div *ngIf="nest">`,
        `</div>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `@if (show) {`,
        `<div>`,
        `@if (nest) {`,
        `<div>`,
        `</div>`,
        `}`,
        `</div>`,
        `}`,
      ].join('\n'));
    });

    it('should migrate a switch with for inside case', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          again = true;
          more = true;
        }
      `);

      writeFile('/comp.html', [
        `<div [formGroup]="form">`,
        `<label [attr.for]="question.key">{{question.label}}</label>`,
        `<div [ngSwitch]="question.controlType">`,
        `  <input *ngSwitchCase="'textbox'" [formControlName]="question.key"`,
        `          [id]="question.key" [type]="question.type">`,
        `  <select [id]="question.key" *ngSwitchCase="'dropdown'" [formControlName]="question.key">`,
        `    <option *ngFor="let opt of question.options" [value]="opt.key">{{opt.value}}</option>`,
        `  </select>`,
        `</div>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<div [formGroup]="form">`,
        `<label [attr.for]="question.key">{{question.label}}</label>`,
        `<div>`,
        `@switch (question.controlType) {`,
        `  @case ('textbox') {`,
        `  <input [formControlName]="question.key"`,
        `          [id]="question.key" [type]="question.type">`,
        `}`,
        `  @case ('dropdown') {`,
        `  <select [id]="question.key" [formControlName]="question.key">`,
        `    @for (opt of question.options; track opt) {`,
        `  <option [value]="opt.key">{{opt.value}}</option>`,
        `}`,
        `  </select>`,
        `}`,
        `}`,
        `</div>`,
        `</div>`,
      ].join('\n'));
    });

    it('should migrate a simple for inside an if', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          again = true;
          more = true;
        }
      `);

      writeFile('/comp.html', [
        `<ul *ngIf="show">`,
        `<li *ngFor="let h of heroes" [ngValue]="h">{{h.name}} ({{h.emotion}})</li>`,
        `</ul>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `@if (show) {`,
        `<ul>`,
        `@for (h of heroes; track h) {`,
        `  <li [ngValue]="h">{{h.name}} ({{h.emotion}})</li>`,
        `}`,
        `</ul>`,
        `}`,
      ].join('\n'));
    });

    it('should migrate an if inside a for loop', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          heroes = [{name: 'cheese', emotion: 'happy'},{name: 'stuff', emotion: 'sad'}];
          show = true;
        }
      `);

      writeFile('/comp.html', [
        `<select id="hero">`,
        `<span *ngFor="let h of heroes">`,
        `<span *ngIf="show">`,
        `<option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>`,
        `</span>`,
        `</span>`,
        `</select>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<select id="hero">`,
        `@for (h of heroes; track h) {`,
        `  <span>`,
        `@if (show) {`,
        `<span>`,
        `<option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>`,
        `</span>`,
        `}`,
        `</span>`,
        `}`,
        `</select>`,
      ].join('\n'));
    });

    it('should migrate an if inside a for loop with ng-containers', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          heroes = [{name: 'cheese', emotion: 'happy'},{name: 'stuff', emotion: 'sad'}];
          show = true;
        }
      `);

      writeFile('/comp.html', [
        `<select id="hero">`,
        `<ng-container *ngFor="let h of heroes">`,
        `<ng-container *ngIf="show">`,
        `<option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>`,
        `</ng-container>`,
        `</ng-container>`,
        `</select>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `<select id="hero">`,
        `@for (h of heroes; track h) {`,
        `  `,
        `@if (show) {\n`,
        `<option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>\n`,
        `}\n`,
        `}`,
        `</select>`,
      ].join('\n'));
    });

    it('should migrate an inline template with if and for loops', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf, NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      writeFile('/comp.html', [
        `<div *ngIf="show">`,
        `<ul *ngIf="nest">`,
        `<li *ngFor="let item of items">{{item.text}}</li>`,
        `</ul>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `@if (show) {`,
        `<div>`,
        `@if (nest) {`,
        `<ul>`,
        `@for (item of items; track item) {`,
        `  <li>{{item.text}}</li>`,
        `}`,
        `</ul>`,
        `}`,
        `</div>`,
        `}`,
      ].join('\n'));
    });

    it('should migrate template with if, else, and for loops', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf, NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `);

      writeFile('/comp.html', [
        `<div *ngIf="show">`,
        `<ul *ngIf="nest; else elseTmpl">`,
        `<li *ngFor="let item of items">{{item.text}}</li>`,
        `</ul>`,
        `<ng-template #elseTmpl><p>Else content</p></ng-template>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `@if (show) {`,
        `<div>`,
        `@if (nest) {`,
        `<ul>`,
        `@for (item of items; track item) {`,
        `  <li>{{item.text}}</li>`,
        `}`,
        `</ul>`,
        `} @else {`,
        `<p>Else content</p>`,
        `}`,
        `</div>`,
        `}`,
      ].join('\n'));
    });

    it('should migrate an inline template with if, for loops, and switches', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf, NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
          nest = true;
          again = true;
          more = true;
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
          testOpts = 2;
        }
      `);

      writeFile('/comp.html', [
        `<div *ngIf="show">`,
        `<div *ngIf="again">`,
        `<div *ngIf="more">`,
        `<div [ngSwitch]="testOpts">`,
        `<p *ngSwitchCase="1">Option 1</p>`,
        `<p *ngSwitchCase="2">Option 2</p>`,
        `<p *ngSwitchDefault>Option 3</p>`,
        `</div>`,
        `</div>`,
        `</div>`,
        `<ul *ngIf="nest">`,
        `<li *ngFor="let item of items">{{item.text}}</li>`,
        `</ul>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([
        `@if (show) {`,
        `<div>`,
        `@if (again) {`,
        `<div>`,
        `@if (more) {`,
        `<div>`,
        `<div>`,
        `@switch (testOpts) {`,
        `@case (1) {`,
        `  <p>Option 1</p>`,
        `}`,
        `@case (2) {`,
        `  <p>Option 2</p>`,
        `}`,
        `@default {`,
        `  <p>Option 3</p>`,
        `}`,
        `}`,
        `</div>`,
        `</div>`,
        `}`,
        `</div>`,
        `}`,
        `@if (nest) {`,
        `<ul>`,
        `@for (item of items; track item) {`,
        `  <li>{{item.text}}</li>`,
        `}`,
        `</ul>`,
        `}`,
        `</div>`,
        `}`,
      ].join('\n'));
    });

    it('complicated case', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf, NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
        }
      `);

      writeFile('/comp.html', [
        `<div class="docs-breadcrumb" *ngFor="let breadcrumb of breadcrumbItems()">`,
        `<ng-container *ngIf="breadcrumb.path; else breadcrumbWithoutLinkTemplate">`,
        `<ng-container *ngIf="breadcrumb.isExternal; else internalLinkTemplate">`,
        `<a [href]="breadcrumb.path">{{ breadcrumb.label }}</a>`,
        `</ng-container>`,
        `<ng-template #internalLinkTemplate>`,
        `<a [routerLink]="'/' + breadcrumb.path">{{ breadcrumb.label }}</a>`,
        `</ng-template>`,
        `</ng-container>`,
        `<ng-template #breadcrumbWithoutLinkTemplate>`,
        `<span>{{ breadcrumb.label }}</span>`,
        `</ng-template>`,
        `</div>`,
      ].join('\n'));

      await runMigration();
      const content = tree.readContent('/comp.html');
      const result = [
        `@for (breadcrumb of breadcrumbItems(); track breadcrumb) {`,
        `  <div class="docs-breadcrumb">`,
        `@if (breadcrumb.path) {\n`,
        `@if (breadcrumb.isExternal) {\n`,
        `<a [href]="breadcrumb.path">{{ breadcrumb.label }}</a>\n`,
        `} @else {\n`,
        `<a [routerLink]="'/' + breadcrumb.path">{{ breadcrumb.label }}</a>\n`,
        `}\n`,
        `} @else {\n`,
        `<span>{{ breadcrumb.label }}</span>\n`,
        `}`,
        `</div>`,
        `}`,
      ].join('\n');

      expect(content).toBe(result);
    });

    it('long file', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf, NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
        }
      `);

      writeFile('/comp.html', [
        `<div class="class">`,
        `<iframe `,
        `#preview `,
        `class="special-class" `,
        `*ngIf="stuff" `,
        `></iframe>`,
        `<ng-container *ngIf="shouldDoIt">`,
        `<ng-container `,
        `*ngComponentOutlet="outletComponent; inputs: {errorMessage: errorMessage()}" `,
        `/>`,
        `</ng-container>`,
        `<div `,
        `class="what"`,
        `*ngIf="`,
        `shouldWhat`,
        `"`,
        `>`,
        `<ng-container [ngSwitch]="currentCase()">`,
        `<span `,
        `class="case-stuff"`,
        `*ngSwitchCase="A"`,
        `>`,
        `Case A`,
        `</span>`,
        `<span class="b-class" *ngSwitchCase="B">`,
        `Case B`,
        `</span>`,
        `<span `,
        `class="thing-1" `,
        `*ngSwitchCase="C" `,
        `>`,
        `Case C`,
        `</span>`,
        `<span `,
        `class="thing-2"`,
        `*ngSwitchCase="D"`,
        `>`,
        `Case D`,
        `</span>`,
        `<span `,
        `class="thing-3" `,
        `*ngSwitchCase="E" `,
        `>`,
        `Case E`,
        `</span>`,
        `</ng-container>`,
        `<progress [value]="progress()" [max]="ready"></progress>`,
        `</div>`,
        `</div>`,
      ].join('\n'));

      await runMigration();

      const content = tree.readContent('/comp.html');
      const result = [
        `<div class="class">`,
        `@if (stuff) {`,
        `<iframe `,
        `#preview `,
        `class="special-class"  `,
        `></iframe>`,
        `}`,
        `@if (shouldDoIt) {\n`,
        `<ng-container `,
        `*ngComponentOutlet="outletComponent; inputs: {errorMessage: errorMessage()}" `,
        `/>\n`,
        `}`,
        `@if (`,
        `shouldWhat`,
        `) {`,
        `<div `,
        `class="what"`,
        `>\n`,
        `@switch (currentCase()) {`,
        `@case (A) {`,
        `  <span `,
        `class="case-stuff"`,
        `>`,
        `Case A`,
        `</span>`,
        `}`,
        `@case (B) {`,
        `  <span class="b-class">`,
        `Case B`,
        `</span>`,
        `}`,
        `@case (C) {`,
        `  <span `,
        `class="thing-1"  `,
        `>`,
        `Case C`,
        `</span>`,
        `}`,
        `@case (D) {`,
        `  <span `,
        `class="thing-2"`,
        `>`,
        `Case D`,
        `</span>`,
        `}`,
        `@case (E) {`,
        `  <span `,
        `class="thing-3"  `,
        `>`,
        `Case E`,
        `</span>`,
        `}`,
        `}\n`,
        `<progress [value]="progress()" [max]="ready"></progress>`,
        `</div>`,
        `}`,
        `</div>`,
      ].join('\n');

      expect(content).toBe(result);
    });
  });

  describe('error handling', () => {
    it('should log template migration errors to the console', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `);

      await runMigration();
      tree.readContent('/comp.ts');

      expect(warnOutput.join(' '))
          .toContain('IMPORTANT! This migration is in developer preview. Use with caution.');
    });
  });

  describe('template', () => {
    it('should migrate a root level template thats not used in control flow', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: './comp.html'
        })
        class DeclareComp {
        }
      `);

      writeFile('/comp.html', [
        `<div class="content">`,
        `  <ng-container *ngTemplateOutlet="navigation" />`,
        `  <ng-container *ngIf="content()">`,
        `    <div class="class-1"></div>`,
        `  </ng-container>`,
        `</div>`,
        `<ng-template #navigation>`,
        `  <div class="cont">`,
        `      <button`,
        `        *ngIf="shouldShowMe()"`,
        `        class="holy-classname-batman"`,
        `      >`,
        `        Wow...a button!`,
        `      </button>`,
        `  </div>`,
        `</ng-template>`,
      ].join('\n'));

      await runMigration();

      const content = tree.readContent('/comp.html');
      const result = [
        `<div class="content">`,
        `  <ng-container *ngTemplateOutlet="navigation" />`,
        `  @if (content()) {\n`,
        `    <div class="class-1"></div>\n  `,
        `}`,
        `</div>`,
        `<ng-template #navigation>`,
        `  <div class="cont">`,
        `      @if (shouldShowMe()) {`,
        `<button\n       `,
        `        class="holy-classname-batman"`,
        `      >`,
        `        Wow...a button!`,
        `      </button>`,
        `}`,
        `  </div>`,
        `</ng-template>`,

      ].join('\n');

      expect(content).toBe(result);
    });

    it('should not remove a template thats not used in control flow', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          template: \`
            DeclareComp({{name}})
            <ng-template #myTmpl let-greeting>
              {{greeting}} {{logName()}}!
            </ng-template>
          \`
        })
        class DeclareComp implements DoCheck, AfterViewChecked {
          @ViewChild('myTmpl') myTmpl!: TemplateRef<any>;
          name: string = 'world';
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain('<ng-template #myTmpl let-greeting>');
    });
  });

  describe('no migration needed', () => {
    it('should do nothing when no control flow is present', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span>shrug</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain('template: `<div><span>shrug</span></div>`');
    });

    it('should do nothing with already present updated control flow', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div>@if (toggle) {<span>shrug</span>}</div>\`
        })
        class Comp {
          toggle = false;
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain('template: `<div>@if (toggle) {<span>shrug</span>}</div>`');
    });

    it('should migrate an ngif inside a block', async () => {
      writeFile('/comp.ts', `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div>@if (toggle) {<div><span *ngIf="show">shrug</span></div>}</div>\`
        })
        class Comp {
          toggle = false;
          show = false;
        }
      `);

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain(
          'template: `<div>@if (toggle) {<div>@if (show) {<span>shrug</span>}</div>}</div>`');
    });
  });
});
