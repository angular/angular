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

describe('control flow migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('control-flow-migration', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../collection.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

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
        `@if (show) {<span>Content here</span>}`,
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
        `@if (show) {<span>Content here</span>}`,
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
        `@if (show) {<span>Content here</span>} @else {Else Content}`,
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
        `@if (show) {<span>Content here</span>} @else {Else Content}`,
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
        `@if (show) {<div>THEN Stuff</div>} @else {Else Content}`,
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
        `@if (show) {<div>THEN Stuff</div>} @else {Else Content}`,
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
        `@if (show) {<div>THEN Stuff</div>} @else {Else Content}`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `</div>`,
        `<ng-container *ngTemplateOutlet="elseBlock"></ng-container>`,
      ].join('\n'));
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
        `@for (item of items; track item) {<li>{{item.text}}</li>}`,
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
        `@for (item of items; track item) {<li>{{item.text}}</li>}`,
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
          'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>`');
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
        `@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> } @default { <p>Option 3</p> }}`,
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
        `@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> } @default { <p>Option 3</p> }}`,
        `</div>`,
      ].join('\n'));
    });
  });

  describe('nested structures', () => {
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
           `<div *ngIf="nest">`,
           `<span *ngIf="again">things</span>`,
           `<span *ngIf="more">stuff</span>`,
           `</div>`,
           `<span *ngIf="more">stuff</span>`,
           `</div>`,
         ].join('\n'));

         await runMigration();
         const content = tree.readContent('/comp.html');

         expect(content).toBe([
           `@if (show) {<div>`,
           `@if (nest) {<div>`,
           `@if (again) {<span>things</span>}`,
           `@if (more) {<span>stuff</span>}`,
           `</div>}`,
           `@if (more) {<span>stuff</span>}`,
           `</div>}`,
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
        `@if (show) {<div>`,
        `@if (nest) {<ul>`,
        `@for (item of items; track item) {<li>{{item.text}}</li>}`,
        `</ul>}`,
        `</div>}`,
      ].join('\n'));
    });

    it('should migrate an inline template with if, else and for loops', async () => {
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
        `@if (show) {<div>`,
        `@if (nest) {<ul>`,
        `@for (item of items; track item) {<li>{{item.text}}</li>}`,
        `</ul>} @else {<p>Else content</p>}`,
        `</div>}`,
      ].join('\n'));
    });

    it('should migrate an inline template with if, else, and for loops', async () => {
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
        `@if (show) {<div>`,
        `@if (nest) {<ul>`,
        `@for (item of items; track item) {<li>{{item.text}}</li>}`,
        `</ul>} @else {<p>Else content</p>}`,
        `</div>}`,
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
        `@if (show) {<div>`,
        `@if (again) {<div>`,
        `@if (more) {<div>`,
        `<div>`,
        `@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> } @default { <p>Option 3</p> }}`,
        `</div>`,
        `</div>}`,
        `</div>}`,
        `@if (nest) {<ul>`,
        `@for (item of items; track item) {<li>{{item.text}}</li>}`,
        `</ul>}`,
        `</div>}`,
      ].join('\n'));
    });
  });
});
