/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSystemPath, logging, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'path';
import shx from 'shelljs';

describe('control flow migration (ng update)', () => {
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

  function runMigration(path: string | undefined = undefined, format: boolean = true) {
    return runner.runSchematic('control-flow-migration', {path, format}, tree);
  }
  const migrationsJsonPath = resolve('../migrations.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', migrationsJsonPath);
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
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
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

  describe('ngIf', () => {
    it('should migrate an inline template', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`',
      );
    });

    it('should migrate an empty case', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';
        @Component({
          template: \`<div [ngSwitch]="testOpts">` +
          `<p *ngSwitchCase="">Option 1</p>` +
          `<p *ngSwitchCase="2">Option 2</p>` +
          `</div>\`
        })
        class Comp {
          testOpts = "1";
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        `template: \`<div>@switch (testOpts) { @case ('') { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>`,
      );
    });

    it('should migrate multiple inline templates in the same file', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`',
      );
      expect(content).toContain('template: `@if (show === 5) {<article>An Article</article>}`');
    });

    it('should migrate an external template', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [`<div>`, `<span *ngIf="show">Content here</span>`, `</div>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [`<div>`, `  @if (show) {`, `    <span>Content here</span>`, `  }`, `</div>`].join('\n'),
      );
    });

    it('should migrate a template referenced by multiple components', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {}
      `,
      );

      writeFile(
        '/other-comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class OtherComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [`<div>`, `<span *ngIf="show">Content here</span>`, `</div>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [`<div>`, `  @if (show) {`, `    <span>Content here</span>`, `  }`, `</div>`].join('\n'),
      );
    });

    it('should migrate an if case with no star', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [`<div>`, `<span ngIf="show">Content here</span>`, `</div>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [`<div>`, `  @if (show) {`, `    <span>Content here</span>`, `  }`, `</div>`].join('\n'),
      );
    });

    it('should migrate an if case as a binding', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [`<div>`, `<span [ngIf]="show">Content here</span>`, `</div>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [`<div>`, `  @if (show) {`, `    <span>Content here</span>`, `  }`, `</div>`].join('\n'),
      );
    });

    it('should migrate an if case as a binding with let variables', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template [ngIf]="data$ | async" let-data="ngIf">`,
          `  {{ data }}`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([`@if (data$ | async; as data) {`, `  {{ data }}`, `}`].join('\n'));
    });

    it('should migrate an if case as a binding with let variable with no value', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template [ngIf]="viewModel$ | async" let-vm>`,
          `  {{vm | json}}`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [`@if (viewModel$ | async; as vm) {`, `  {{vm | json}}`, `}`].join('\n'),
      );
    });

    it('should migrate an if else case as bindings', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf,NgIfElse} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template [ngIf]="show" [ngIfElse]="tmplName"><span>Content here</span></ng-template>`,
          `</div>`,
          `<ng-template #tmplName><p>Stuff</p></ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <span>Content here</span>`,
          `  } @else {`,
          `    <p>Stuff</p>`,
          `  }`,
          `</div>\n`,
        ].join('\n'),
      );
    });

    it('should migrate an if then else case as bindings', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf,NgIfElse} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template [ngIf]="show" [ngIfElse]="elseTmpl" [ngIfThenElse]="thenTmpl">Ignore Me</ng-template>`,
          `</div>`,
          `<ng-template #elseTmpl><p>Stuff</p></ng-template>`,
          `<ng-template #thenTmpl><span>Content here</span></ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <span>Content here</span>`,
          `  } @else {`,
          `    <p>Stuff</p>`,
          `  }`,
          `</div>\n`,
        ].join('\n'),
      );
    });

    it('should migrate an if else case with condition that has `then` in the string', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf,NgIfElse} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [`<div *ngIf="!(isAuthenticated$ | async) && !reauthRequired">`, `  Hello!`, `</div>`].join(
          '\n',
        ),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (!(isAuthenticated$ | async) && !reauthRequired) {`,
          `  <div>`,
          `    Hello!`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate an if case on a container', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-container *ngIf="show"><span>Content here</span></ng-container>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [`<div>`, `  @if (show) {`, `    <span>Content here</span>`, `  }`, `</div>`].join('\n'),
      );
    });

    it('should migrate an if case on an empty container', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container`,
          `  *ngIf="true; then template"`,
          `></ng-container>`,
          `<ng-template #template>`,
          `  Hello!`,
          `</ng-template>  `,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe([`@if (true) {`, `  Hello!`, `}\n`].join('\n'));
    });

    it('should migrate an if case with an ng-template with i18n', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template *ngIf="show" i18n="@@something"><span>Content here</span></ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <ng-container i18n="@@something"><span>Content here</span></ng-container>`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if case with an ng-template with empty i18n', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template *ngIf="show" i18n><span>Content here</span></ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <ng-container i18n><span>Content here</span></ng-container>`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if case with an ng-container with i18n', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-container *ngIf="show" i18n="@@something"><span>Content here</span></ng-container>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <ng-container i18n="@@something"><span>Content here</span></ng-container>`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate a bound if case on an ng-template with i18n', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template`,
          `  [ngIf]="data$ | async"`,
          `  let-data="ngIf"`,
          `  i18n="@@i18n-label">`,
          `  {{ data }}`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (data$ | async; as data) {`,
          `  <ng-container i18n="@@i18n-label">`,
          `  {{ data }}`,
          `</ng-container>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate an if case with an ng-container with empty i18n', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-container *ngIf="show" i18n><span>Content here</span></ng-container>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <ng-container i18n><span>Content here</span></ng-container>`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate a bound NgIfElse case with ng-templates and remove all unnecessary attributes', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template`,
          `  [ngIf]="fooTemplate"`,
          `  [ngIfElse]="barTemplate"`,
          `  [ngTemplateOutlet]="fooTemplate"`,
          `></ng-template>`,
          `<ng-template #fooTemplate>Foo</ng-template>`,
          `<ng-template #barTemplate>Bar</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (fooTemplate) {`,
          `  <ng-template`,
          `    [ngTemplateOutlet]="fooTemplate"`,
          `  ></ng-template>`,
          `} @else {`,
          `  Bar`,
          `}`,
          `<ng-template #fooTemplate>Foo</ng-template>\n`,
        ].join('\n'),
      );
    });

    it('should migrate a bound NgIfThenElse case with ng-templates with i18n', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template [ngIf]="show" [ngIfThenElse]="thenTmpl" [ngIfElse]="elseTmpl">ignored</ng-template>`,
          `</div>`,
          `<ng-template #thenTmpl i18n="@@something"><span>Content here</span></ng-template>`,
          `<ng-template #elseTmpl i18n="@@somethingElse"><p>other</p></ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <ng-container i18n="@@something"><span>Content here</span></ng-container>`,
          `  } @else {`,
          `    <ng-container i18n="@@somethingElse"><p>other</p></ng-container>`,
          `  }`,
          `</div>\n`,
        ].join('\n'),
      );
    });

    it('should migrate a bound NgIfElse case with ng-templates with i18n', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template [ngIf]="show" [ngIfElse]="elseTmpl" i18n="@@something"><span>Content here</span></ng-template>`,
          `</div>`,
          `<ng-template #elseTmpl i18n="@@somethingElse"><p>other</p></ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <ng-container i18n="@@something"><span>Content here</span></ng-container>`,
          `  } @else {`,
          `    <ng-container i18n="@@somethingElse"><p>other</p></ng-container>`,
          `  }`,
          `</div>\n`,
        ].join('\n'),
      );
    });

    it('should migrate an NgIfElse case with ng-templates with multiple i18n attributes', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template *ngIf="false; else barTempl" i18n="@@foo">`,
          `  Foo`,
          `</ng-template>`,
          `<ng-template i18n="@@bar" #barTempl> Bar </ng-template>`,
          `<a *ngIf="true" i18n="@@bam">Bam</a>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (false) {`,
          `  <ng-container i18n="@@foo">`,
          `  Foo`,
          `</ng-container>`,
          `} @else {`,
          `  <ng-container i18n="@@bar"> Bar </ng-container>`,
          `}`,
          `@if (true) {`,
          `  <a i18n="@@bam">Bam</a>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate an if else case', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show; else elseBlock">Content here</span>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <span>Content here</span>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if else case with no semicolon before else', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show else elseBlock">Content here</span>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <span>Content here</span>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if then else case with no semicolons', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show then thenTmpl else elseTmpl"></span>`,
          `<ng-template #thenTmpl><span>Content here</span></ng-template>`,
          `<ng-template #elseTmpl>Else Content</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <span>Content here</span>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if else case with a colon after else', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show; else: elseTmpl">Content here</span>`,
          `<ng-template #elseTmpl>Else Content</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `<div>`,
        `  @if (show) {`,
        `    <span>Content here</span>`,
        `  } @else {`,
        `    Else Content`,
        `  }`,
        `</div>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate an if else case with no space after ;', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show;else elseBlock">Content here</span>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <span>Content here</span>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if then else case with no spaces before ;', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show;then thenBlock;else elseBlock">Ignored</span>`,
          `<ng-template #thenBlock><div>THEN Stuff</div></ng-template>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <div>THEN Stuff</div>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if else case when the template is above the block', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `<span *ngIf="show; else elseBlock">Content here</span>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <span>Content here</span>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if then else case', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show; then thenBlock; else elseBlock">Ignored</span>`,
          `<ng-template #thenBlock><div>THEN Stuff</div></ng-template>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <div>THEN Stuff</div>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate an if then else case with templates in odd places', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `<span *ngIf="show; then thenBlock; else elseBlock">Ignored</span>`,
          `<ng-template #thenBlock><div>THEN Stuff</div></ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <div>THEN Stuff</div>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate a complex if then else case on ng-containers', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container>`,
          `  <ng-container`,
          `    *ngIf="loading; then loadingTmpl; else showTmpl"`,
          `  >`,
          `  </ng-container>`,
          `<ng-template #showTmpl>`,
          `  <ng-container`,
          `    *ngIf="selected; else emptyTmpl"`,
          `  >`,
          `    <div></div>`,
          `  </ng-container>`,
          `</ng-template>`,
          `<ng-template #emptyTmpl>`,
          `  Empty`,
          `</ng-template>`,
          `</ng-container>`,
          `<ng-template #loadingTmpl>`,
          `  <p>Loading</p>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<ng-container>`,
          `  @if (loading) {`,
          `    <p>Loading</p>`,
          `  } @else {`,
          `    @if (selected) {`,
          `      <div></div>`,
          `    } @else {`,
          `      Empty`,
          `    }`,
          `  }`,
          `</ng-container>\n`,
        ].join('\n'),
      );
    });

    it('should migrate but not remove ng-templates when referenced elsewhere', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<span *ngIf="show; then thenBlock; else elseBlock">Ignored</span>`,
          `<ng-template #thenBlock><div>THEN Stuff</div></ng-template>`,
          `<ng-template #elseBlock>Else Content</ng-template>`,
          `</div>`,
          `<ng-container *ngTemplateOutlet="elseBlock"></ng-container>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (show) {`,
          `    <div>THEN Stuff</div>`,
          `  } @else {`,
          `    Else Content`,
          `  }`,
          `  <ng-template #elseBlock>Else Content</ng-template>`,
          `</div>`,
          `<ng-container *ngTemplateOutlet="elseBlock"></ng-container>`,
        ].join('\n'),
      );
    });

    it('should not remove ng-templates used by other directives', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template #blockUsedElsewhere><div>Block</div></ng-template>`,
          `<ng-container *ngTemplateOutlet="blockUsedElsewhere"></ng-container>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<ng-template #blockUsedElsewhere><div>Block</div></ng-template>`,
          `<ng-container *ngTemplateOutlet="blockUsedElsewhere"></ng-container>`,
        ].join('\n'),
      );
    });

    it('should migrate if with alias', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `,
      );

      writeFile('/comp.html', `<div *ngIf="user$ | async as user">{{ user.name }}</div>`);

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(`@if (user$ | async; as user) {<div>{{ user.name }}</div>}`);
    });

    it('should migrate if/else with alias', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<div *ngIf="user$ | async as user; else noUserBlock">{{ user.name }}</div>`,
          `<ng-template #noUserBlock>No user</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (user$ | async; as user) {`,
          `    <div>{{ user.name }}</div>`,
          `  } @else {`,
          `    No user`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate if/else with semicolon at end', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<div *ngIf="user$ | async as user; else noUserBlock;">{{ user.name }}</div>`,
          `<ng-template #noUserBlock>No user</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (user$ | async; as user) {`,
          `    <div>{{ user.name }}</div>`,
          `  } @else {`,
          `    No user`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate if/else with let variable', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<div *ngIf="user of users; else noUserBlock; let tooltipContent;">{{ user.name }}</div>`,
          `<ng-template #noUserBlock>No user</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (user of users; as tooltipContent) {`,
          `    <div>{{ user.name }}</div>`,
          `  } @else {`,
          `    No user`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate if/else with let variable in wrong place with no semicolons', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<div *ngIf="user of users; let tooltipContent else noUserBlock">{{ user.name }}</div>`,
          `<ng-template #noUserBlock>No user</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (user of users; as tooltipContent) {`,
          `    <div>{{ user.name }}</div>`,
          `  } @else {`,
          `    No user`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate if/then/else with alias', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          user$ = of({ name: 'Jane' }})
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<ng-container *ngIf="user$ | async as user; then userBlock; else noUserBlock">Ignored</ng-container>`,
          `<ng-template #userBlock>User</ng-template>`,
          `<ng-template #noUserBlock>No user</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @if (user$ | async; as user) {`,
          `    User`,
          `  } @else {`,
          `    No user`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate a nested class', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`',
      );
    });

    it('should migrate a nested class', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`',
      );
    });
  });

  describe('ngFor', () => {
    it('should migrate an inline template', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`',
      );
    });

    it('should migrate multiple inline templates in the same file', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`',
      );
      expect(content).toContain(
        'template: `<article>@for (item of items; track item) {<div>{{item.text}}</div>}</article>`',
      );
    });

    it('should migrate an external template', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [`<ul>`, `<li *ngFor="let item of items">{{item.text}}</li>`, `</ul>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<ul>`,
          `  @for (item of items; track item) {`,
          `    <li>{{item.text}}</li>`,
          `  }`,
          `</ul>`,
        ].join('\n'),
      );
    });

    it('should migrate a template referenced by multiple components', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/other-comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [`<ul>`, `<li *ngFor="let item of items">{{item.text}}</li>`, `</ul>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<ul>`,
          `  @for (item of items; track item) {`,
          `    <li>{{item.text}}</li>`,
          `  }`,
          `</ul>`,
        ].join('\n'),
      );
    });

    it('should migrate with a trackBy function', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track trackMeFn($index, itm)) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should migrate with an index alias', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track itm; let index = $index) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should migrate with a comma-separated index alias', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items, let index = index">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track itm; let index = $index) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should migrate with an old style alias', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<tbody>`,
          `  <tr *ngFor="let row of field(); let y = index; trackBy: trackByIndex">`,
          `    <td`,
          `      *ngFor="let cell of row; let x = index; trackBy: trackByIndex"`,
          `    ></td>`,
          `  </tr>`,
          `</tbody>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<tbody>`,
        `  @for (row of field(); track trackByIndex(y, row); let y = $index) {`,
        `    <tr>`,
        `      @for (cell of row; track trackByIndex(x, cell); let x = $index) {`,
        `        <td`,
        `        ></td>`,
        `      }`,
        `    </tr>`,
        `  }`,
        `</tbody>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate an index alias after an expression containing commas', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of foo({a: 1, b: 2}, [1, 2]), let index = index">{{itm.text}}</li></ul>\`
        })
        class Comp {}
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of foo({a: 1, b: 2}, [1, 2]); track itm; let index = $index) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should migrate with an index alias with no spaces', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track itm; let index = $index) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should migrate with alias declared with as', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track itm; let myIndex = $index) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should migrate with alias declared with a comma-separated `as` expression', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of items, index as myIndex">{{itm.text}}</li></ul>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track itm; let myIndex = $index) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should not generate aliased variables declared via the `as` syntax with the same name as the original', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<div *ngFor="let item of items; index as $index;">{{$index}}</div>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'}, {id: 2, text: 'stuff'}];
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `@for (item of items; track item) {<div>{{$index}}</div>}`',
      );
    });

    it('should not generate aliased variables declared via the `let` syntax with the same name as the original', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          template: \`<div *ngFor="let item of items; let $index = index">{{$index}}</div>\`
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'}, {id: 2, text: 'stuff'}];
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `@for (item of items; track item) {<div>{{$index}}</div>}`',
      );
    });

    it('should migrate with a trackBy function and an aliased index', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track trackMeFn(i, itm); let i = $index) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should migrate with multiple aliases', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (itm of items; track itm; let count = $count; let first = $first; let last = $last; let ev = $even; let od = $odd) {<li>{{itm.text}}</li>}</ul>`',
      );
    });

    it('should remove unneeded ng-containers', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `@for (item of items; track item) {<p>{{item.text}}</p>}`',
      );
    });

    it('should leave ng-containers with additional attributes', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `@for (item of items; track item) {<ng-container [bindMe]="stuff"><p>{{item.text}}</p></ng-container>}`',
      );
    });

    it('should migrate a nested class', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`',
      );
    });

    it('should migrate a nested class', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<ul>@for (item of items; track item) {<li>{{item.text}}</li>}</ul>`',
      );
    });

    it('should migrate an ngFor with quoted semicolon in expression', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of '1;2;3'">{{itm}}</li></ul>\`
        })
        class Comp {}
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        "template: `<ul>@for (itm of '1;2;3'; track itm) {<li>{{itm}}</li>}</ul>`",
      );
    });

    it('should migrate an ngFor with quoted semicolon in expression', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';

        @Component({
          imports: [NgFor],
          template: \`<ul><li *ngFor="let itm of '1,2,3'">{{itm}}</li></ul>\`
        })
        class Comp {}
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        "template: `<ul>@for (itm of '1,2,3'; track itm) {<li>{{itm}}</li>}</ul>`",
      );
    });

    it('should migrate ngForTemplate', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container *ngFor="let item of things; template: itemTemplate"></ng-container>`,
          `<ng-container *ngFor="let item of items; template: itemTemplate"></ng-container>`,
          `<ng-template #itemTemplate let-item>`,
          `  <p>Stuff</p>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@for (item of things; track item) {`,
        `  <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item}"></ng-container>`,
        `}`,
        `@for (item of items; track item) {`,
        `  <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item}"></ng-container>`,
        `}`,
        `<ng-template #itemTemplate let-item>`,
        `  <p>Stuff</p>`,
        `</ng-template>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate ngForTemplate when template is only used once', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container *ngFor="let item of items; template: itemTemplate"></ng-container>`,
          `<ng-template #itemTemplate let-item>`,
          `  <p>Stuff</p>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [`@for (item of items; track item) {`, `  <p>Stuff</p>`, `}\n`].join('\n');

      expect(actual).toBe(expected);
    });
  });

  describe('ngForOf', () => {
    it('should migrate a basic ngForOf', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor,NgForOf],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<tbody>`,
          `  <ng-template ngFor let-rowData [ngForOf]="things">`,
          `    <tr><td>{{rowData}}</td></tr>`,
          `  </ng-template>`,
          `</tbody>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<tbody>`,
        `  @for (rowData of things; track rowData) {`,
        `    <tr><td>{{rowData}}</td></tr>`,
        `  }`,
        `</tbody>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate ngForOf with an alias', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor,NgForOf],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<tbody>`,
          `  <ng-template ngFor let-rowData let-rowIndex="index" [ngForOf]="things">`,
          `    <tr><td>{{rowIndex}}</td><td>{{rowData}}</td></tr>`,
          `  </ng-template>`,
          `</tbody>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<tbody>`,
        `  @for (rowData of things; track rowData; let rowIndex = $index) {`,
        `    <tr><td>{{rowIndex}}</td><td>{{rowData}}</td></tr>`,
        `  }`,
        `</tbody>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate ngForOf with track by', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor,NgForOf],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<tbody>`,
          `  <ng-template ngFor let-rowData [ngForOf]="things" [ngForTrackBy]="trackMe">`,
          `    <tr><td>{{rowData}}</td></tr>`,
          `  </ng-template>`,
          `</tbody>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<tbody>`,
        `  @for (rowData of things; track trackMe($index, rowData)) {`,
        `    <tr><td>{{rowData}}</td></tr>`,
        `  }`,
        `</tbody>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate ngForOf with track by and alias', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor,NgForOf],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<tbody>`,
          `  <ng-template ngFor let-rowData let-rowIndex="index" [ngForOf]="things" [ngForTrackBy]="trackMe">`,
          `    <tr><td>{{rowIndex}}</td><td>{{rowData}}</td></tr>`,
          `  </ng-template>`,
          `</tbody>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<tbody>`,
        `  @for (rowData of things; track trackMe(rowIndex, rowData); let rowIndex = $index) {`,
        `    <tr><td>{{rowIndex}}</td><td>{{rowData}}</td></tr>`,
        `  }`,
        `</tbody>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate ngFor with a long ternary and trackby', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor,NgForOf],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div`,
          `  *ngFor="`,
          `    let item of section === 'manage'`,
          `      ? filteredPermissions?.manage`,
          `      : section === 'customFields'`,
          `      ? filteredPermissions?.customFields`,
          `      : section === 'createAndDelete'`,
          `      ? filteredPermissions?.createAndDelete`,
          `      : filteredPermissions?.team;`,
          `    trackBy: trackById`,
          `  "`,
          `>`,
          `  {{ item }}`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@for (`,
        `  item of section === 'manage'`,
        `  ? filteredPermissions?.manage`,
        `  : section === 'customFields'`,
        `  ? filteredPermissions?.customFields`,
        `  : section === 'createAndDelete'`,
        `  ? filteredPermissions?.createAndDelete`,
        `  : filteredPermissions?.team; track trackById($index,`,
        `  item)) {`,
        `  <div`,
        `    >`,
        `    {{ item }}`,
        `  </div>`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate ngForOf with track by and multiple aliases', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgFor} from '@angular/common';
        interface Item {
          id: number;
          text: string;
        }

        @Component({
          imports: [NgFor,NgForOf],
          templateUrl: 'comp.html',
        })
        class Comp {
          items: Item[] = [{id: 1, text: 'blah'},{id: 2, text: 'stuff'}];
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<tbody>`,
          `  <ng-template ngFor let-rowData let-rowIndex="index" let-rCount="count" [ngForOf]="things" [ngForTrackBy]="trackMe">`,
          `    <tr><td>{{rowIndex}}</td><td>{{rowData}}</td></tr>`,
          `  </ng-template>`,
          `</tbody>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<tbody>`,
        `  @for (rowData of things; track trackMe(rowIndex, rowData); let rowIndex = $index; let rCount = $count) {`,
        `    <tr><td>{{rowIndex}}</td><td>{{rowData}}</td></tr>`,
        `  }`,
        `</tbody>`,
      ].join('\n');

      expect(actual).toBe(expected);
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>',
      );
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>`',
      );
      expect(content).toContain(
        'template: `<div>@switch (choices) { @case (A) { <p>Choice A</p> } @case (B) { <p>Choice B</p> } @default { <p>Choice Default</p> }}</div>`',
      );
    });

    it('should migrate an external template', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = 2;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div [ngSwitch]="testOpts">`,
          `<p *ngSwitchCase="1">Option 1</p>`,
          `<p *ngSwitchCase="2">Option 2</p>`,
          `<p *ngSwitchDefault>Option 3</p>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');
      expect(content).toBe(
        [
          `<div>`,
          `  @switch (testOpts) {`,
          `    @case (1) {`,
          `      <p>Option 1</p>`,
          `    }`,
          `    @case (2) {`,
          `      <p>Option 2</p>`,
          `    }`,
          `    @default {`,
          `      <p>Option 3</p>`,
          `    }`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate a template referenced by multiple components', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = 2;
        }
      `,
      );

      writeFile(
        '/other-comp.ts',
        `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class OtherComp {
          testOpts = 1;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div [ngSwitch]="testOpts">`,
          `<p *ngSwitchCase="1">Option 1</p>`,
          `<p *ngSwitchCase="2">Option 2</p>`,
          `<p *ngSwitchDefault>Option 3</p>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @switch (testOpts) {`,
          `    @case (1) {`,
          `      <p>Option 1</p>`,
          `    }`,
          `    @case (2) {`,
          `      <p>Option 2</p>`,
          `    }`,
          `    @default {`,
          `      <p>Option 3</p>`,
          `    }`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>',
      );
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>',
      );
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> } @default { <p>Option 3</p> }}</div>',
      );
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> } @default { <p>Option 3</p> }}</div>',
      );
    });

    it('should handle empty default cases', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {ngSwitch, ngSwitchCase} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = "1";
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container [ngSwitch]="type">`,
          `<ng-container *ngSwitchCase="'foo'"> Foo </ng-container>`,
          `<ng-container *ngSwitchCase="'bar'"> Bar </ng-container>`,
          `<ng-container *ngSwitchDefault></ng-container>`,
          `</ng-container>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `\n@switch (type) {`,
        `  @case ('foo') {`,
        `    Foo`,
        `  }`,
        `  @case ('bar') {`,
        `    Bar`,
        `  }`,
        `  @default {`,
        `  }`,
        `}\n`,
      ].join('\n');

      expect(actual).toBe(expected);
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain(
        'template: `<div>@switch (testOpts) { @case (1) { <p>Option 1</p> } @case (2) { <p>Option 2</p> }}</div>`',
      );
    });

    it('should migrate nested switches', async () => {
      writeFile(
        '/comp.ts',
        `
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
      }`,
      );

      writeFile(
        '/comp.html',
        [
          `<div [ngSwitch]="thing">`,
          `  <div *ngSwitchCase="'item'" [ngSwitch]="anotherThing">`,
          `    <img *ngSwitchCase="'png'" src="/img.png" alt="PNG" />`,
          `    <img *ngSwitchDefault src="/default.jpg" alt="default" />`,
          `  </div>`,
          `  <img *ngSwitchDefault src="/default.jpg" alt="default" />`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div>`,
          `  @switch (thing) {`,
          `    @case ('item') {`,
          `      <div>`,
          `        @switch (anotherThing) {`,
          `          @case ('png') {`,
          `            <img src="/img.png" alt="PNG" />`,
          `          }`,
          `          @default {`,
          `            <img src="/default.jpg" alt="default" />`,
          `          }`,
          `        }`,
          `      </div>`,
          `    }`,
          `    @default {`,
          `      <img src="/default.jpg" alt="default" />`,
          `    }`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );
    });
  });

  describe('nested structures', () => {
    it('should migrate an inline template with nested control flow structures and no line breaks', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

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

    it('should migrate an inline template with multiple nested control flow structures', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="show">`,
          `<span>things</span>`,
          `<div *ngIf="nest">`,
          `<span>stuff</span>`,
          `</div>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (show) {`,
          `  <div>`,
          `    <span>things</span>`,
          `    @if (nest) {`,
          `      <div>`,
          `        <span>stuff</span>`,
          `      </div>`,
          `    }`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate an inline template with multiple nested control flow structures', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="show">`,
          `<span>things</span>`,
          `<div *ngIf="nest">`,
          `<span>stuff</span>`,
          `</div>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (show) {`,
          `  <div>`,
          `    <span>things</span>`,
          `    @if (nest) {`,
          `      <div>`,
          `        <span>stuff</span>`,
          `      </div>`,
          `    }`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate a simple nested case', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [`<div *ngIf="show">`, `<div *ngIf="nest">`, `</div>`, `</div>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (show) {`,
          `  <div>`,
          `    @if (nest) {`,
          `      <div>`,
          `      </div>`,
          `    }`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate an if and switch on the same container', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgFor, NgIf],
          templateUrl: './comp.html'
        })
        class Comp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `  <ng-container *ngIf="thing" [ngSwitch]="value.provider">`,
          `    <cmp1 *ngSwitchCase="'value1'" />`,
          `    <cmp2 *ngSwitchCase="'value2'" />`,
          `  </ng-container>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `<div>`,
        `  @if (thing) {`,
        `    @switch (value.provider) {`,
        `      @case ('value1') {`,
        `        <cmp1 />`,
        `      }`,
        `      @case ('value2') {`,
        `        <cmp2 />`,
        `      }`,
        `    }`,
        `  }`,
        `</div>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate a switch with for inside case', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div [formGroup]="form">`,
          `<label [attr.for]="question.key">{{question.label}}</label>`,
          `<div [ngSwitch]="question.controlType">`,
          `  <input *ngSwitchCase="'textbox'" [formControlName]="question.key"`,
          `          [id]="question.key" [type]="question.type" />`,
          `  <select [id]="question.key" *ngSwitchCase="'dropdown'" [formControlName]="question.key">`,
          `    <option *ngFor="let opt of question.options" [value]="opt.key">{{opt.value}}</option>`,
          `  </select>`,
          `</div>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<div [formGroup]="form">`,
          `  <label [attr.for]="question.key">{{question.label}}</label>`,
          `  <div>`,
          `    @switch (question.controlType) {`,
          `      @case ('textbox') {`,
          `        <input [formControlName]="question.key"`,
          `          [id]="question.key" [type]="question.type" />`,
          `      }`,
          `      @case ('dropdown') {`,
          `        <select [id]="question.key" [formControlName]="question.key">`,
          `          @for (opt of question.options; track opt) {`,
          `            <option [value]="opt.key">{{opt.value}}</option>`,
          `          }`,
          `        </select>`,
          `      }`,
          `    }`,
          `  </div>`,
          `</div>`,
        ].join('\n'),
      );
    });

    it('should migrate a simple for inside an if', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ul *ngIf="show">`,
          `<li *ngFor="let h of heroes" [ngValue]="h">{{h.name}} ({{h.emotion}})</li>`,
          `</ul>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (show) {`,
          `  <ul>`,
          `    @for (h of heroes; track h) {`,
          `      <li [ngValue]="h">{{h.name}} ({{h.emotion}})</li>`,
          `    }`,
          `  </ul>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate an if inside a for loop', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<select id="hero">`,
          `<span *ngFor="let h of heroes">`,
          `<span *ngIf="show">`,
          `<option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>`,
          `</span>`,
          `</span>`,
          `</select>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<select id="hero">`,
          `  @for (h of heroes; track h) {`,
          `    <span>`,
          `      @if (show) {`,
          `        <span>`,
          `          <option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>`,
          `        </span>`,
          `      }`,
          `    </span>`,
          `  }`,
          `</select>`,
        ].join('\n'),
      );
    });

    it('should migrate an if inside a for loop with ng-containers', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<select id="hero">`,
          `<ng-container *ngFor="let h of heroes">`,
          `<ng-container *ngIf="show">`,
          `<option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>`,
          `</ng-container>`,
          `</ng-container>`,
          `</select>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `<select id="hero">`,
          `  @for (h of heroes; track h) {`,
          `    @if (show) {`,
          `      <option [ngValue]="h">{{h.name}} ({{h.emotion}})</option>`,
          `    }`,
          `  }`,
          `</select>`,
        ].join('\n'),
      );
    });

    it('should migrate an inline template with if and for loops', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="show">`,
          `<ul *ngIf="nest">`,
          `<li *ngFor="let item of items">{{item.text}}</li>`,
          `</ul>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (show) {`,
          `  <div>`,
          `    @if (nest) {`,
          `      <ul>`,
          `        @for (item of items; track item) {`,
          `          <li>{{item.text}}</li>`,
          `        }`,
          `      </ul>`,
          `    }`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate template with if, else, and for loops', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="show">`,
          `<ul *ngIf="nest; else elseTmpl">`,
          `<li *ngFor="let item of items">{{item.text}}</li>`,
          `</ul>`,
          `<ng-template #elseTmpl><p>Else content</p></ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (show) {`,
          `  <div>`,
          `    @if (nest) {`,
          `      <ul>`,
          `        @for (item of items; track item) {`,
          `          <li>{{item.text}}</li>`,
          `        }`,
          `      </ul>`,
          `    } @else {`,
          `      <p>Else content</p>`,
          `    }`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate an inline template with if, for loops, and switches', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
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
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (show) {`,
          `  <div>`,
          `    @if (again) {`,
          `      <div>`,
          `        @if (more) {`,
          `          <div>`,
          `            <div>`,
          `              @switch (testOpts) {`,
          `                @case (1) {`,
          `                  <p>Option 1</p>`,
          `                }`,
          `                @case (2) {`,
          `                  <p>Option 2</p>`,
          `                }`,
          `                @default {`,
          `                  <p>Option 3</p>`,
          `                }`,
          `              }`,
          `            </div>`,
          `          </div>`,
          `        }`,
          `      </div>`,
          `    }`,
          `    @if (nest) {`,
          `      <ul>`,
          `        @for (item of items; track item) {`,
          `          <li>{{item.text}}</li>`,
          `        }`,
          `      </ul>`,
          `    }`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('complicated case', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
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
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');
      const result = [
        `@for (breadcrumb of breadcrumbItems(); track breadcrumb) {`,
        `  <div class="docs-breadcrumb">`,
        `    @if (breadcrumb.path) {`,
        `      @if (breadcrumb.isExternal) {`,
        `        <a [href]="breadcrumb.path">{{ breadcrumb.label }}</a>`,
        `      } @else {`,
        `        <a [routerLink]="'/' + breadcrumb.path">{{ breadcrumb.label }}</a>`,
        `      }`,
        `    } @else {`,
        `      <span>{{ breadcrumb.label }}</span>`,
        `    }`,
        `  </div>`,
        `}`,
      ].join('\n');

      expect(content).toBe(result);
    });

    it('long file', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      writeFile(
        '/comp.html',
        [
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
        ].join('\n'),
      );

      await runMigration();

      const content = tree.readContent('/comp.html');
      const result = [
        `<div class="class">`,
        `  @if (stuff) {`,
        `    <iframe`,
        `      #preview`,
        `      class="special-class"`,
        `    ></iframe>`,
        `  }`,
        `  @if (shouldDoIt) {`,
        `    <ng-container`,
        `      *ngComponentOutlet="outletComponent; inputs: {errorMessage: errorMessage()}"`,
        `      />`,
        `  }`,
        `  @if (`,
        `    shouldWhat`,
        `    ) {`,
        `    <div`,
        `      class="what"`,
        `      >`,
        `      @switch (currentCase()) {`,
        `        @case (A) {`,
        `          <span`,
        `            class="case-stuff"`,
        `            >`,
        `            Case A`,
        `          </span>`,
        `        }`,
        `        @case (B) {`,
        `          <span class="b-class">`,
        `            Case B`,
        `          </span>`,
        `        }`,
        `        @case (C) {`,
        `          <span`,
        `            class="thing-1"`,
        `            >`,
        `            Case C`,
        `          </span>`,
        `        }`,
        `        @case (D) {`,
        `          <span`,
        `            class="thing-2"`,
        `            >`,
        `            Case D`,
        `          </span>`,
        `        }`,
        `        @case (E) {`,
        `          <span`,
        `            class="thing-3"`,
        `            >`,
        `            Case E`,
        `          </span>`,
        `        }`,
        `      }`,
        `      <progress [value]="progress()" [max]="ready"></progress>`,
        `    </div>`,
        `  }`,
        `</div>`,
      ].join('\n');

      expect(content).toBe(result);
    });

    it('should handle empty cases safely without offset issues', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container *ngIf="generic; else specific">`,
          `  <ng-container [ngSwitch]="dueWhen">`,
          `    <ng-container *ngSwitchCase="due.NOW">`,
          `      <p>Now></p>`,
          `    </ng-container>`,
          `    <ng-container *ngSwitchCase="due.SOON">`,
          `      <p>Soon></p>`,
          `    </ng-container>`,
          `    <ng-container *ngSwitchDefault></ng-container>`,
          `  </ng-container>`,
          `</ng-container>`,
          `<ng-template #specific>`,
          `  <ng-container [ngSwitch]="dueWhen">`,
          `    <ng-container *ngSwitchCase="due.NOW">`,
          `      <p>Now></p>`,
          `    </ng-container>`,
          `    <ng-container *ngSwitchCase="due.SOON">`,
          `      <p>Soon></p>`,
          `    </ng-container>`,
          `    <ng-container *ngSwitchDefault>`,
          `      <p>Default></p>`,
          `    </ng-container>`,
          `  </ng-container>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@if (generic) {`,
        `  @switch (dueWhen) {`,
        `    @case (due.NOW) {`,
        `      <p>Now></p>`,
        `    }`,
        `    @case (due.SOON) {`,
        `      <p>Soon></p>`,
        `    }`,
        `    @default {`,
        `    }`,
        `  }`,
        `} @else {`,
        `  @switch (dueWhen) {`,
        `    @case (due.NOW) {`,
        `      <p>Now></p>`,
        `    }`,
        `    @case (due.SOON) {`,
        `      <p>Soon></p>`,
        `    }`,
        `    @default {`,
        `      <p>Default></p>`,
        `    }`,
        `  }`,
        `}\n`,
      ].join('\n');

      expect(actual).toBe(expected);
    });
  });

  describe('error handling', () => {
    it('should log template migration errors to the console', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `,
      );

      await runMigration();
      tree.readContent('/comp.ts');
    });

    it('should log a migration error when duplicate ng-template names are detected', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          toggle = false;
        }
      `,
      );

      writeFile(
        './comp.html',
        [
          `<div *ngIf="show; else elseTmpl">Content</div>`,
          `<div *ngIf="hide; else elseTmpl">Content</div>`,
          `<ng-template #elseTmpl>Else Content</ng-template>`,
          `<ng-template #elseTmpl>Duplicate</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      tree.readContent('/comp.ts');

      expect(warnOutput.join(' ')).toContain(
        `A duplicate ng-template name "#elseTmpl" was found. ` +
          `The control flow migration requires unique ng-template names within a component.`,
      );
    });

    it('should log a migration error when collection aliasing is detected in ngFor', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          templateUrl: './comp.html'
        })
        class Comp {
          toggle = false;
        }
      `,
      );

      writeFile(
        './comp.html',
        [`<div *ngFor="let item of list$ | async as list;">Content</div>`].join('\n'),
      );

      await runMigration();
      tree.readContent('/comp.ts');

      expect(warnOutput.join(' ')).toContain(
        `Found an aliased collection on an ngFor: "item of list$ | async as list". ` +
          `Collection aliasing is not supported with @for. ` +
          `Refactor the code to remove the \`as\` alias and re-run the migration.`,
      );
    });
  });

  describe('template', () => {
    it('should migrate a root level template thats not used in control flow', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: './comp.html'
        })
        class DeclareComp {
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
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
        ].join('\n'),
      );

      await runMigration();

      const content = tree.readContent('/comp.html');
      const result = [
        `<div class="content">`,
        `  <ng-container *ngTemplateOutlet="navigation" />`,
        `  @if (content()) {`,
        `    <div class="class-1"></div>`,
        `  }`,
        `</div>`,
        `<ng-template #navigation>`,
        `  <div class="cont">`,
        `    @if (shouldShowMe()) {`,
        `      <button`,
        `        class="holy-classname-batman"`,
        `        >`,
        `        Wow...a button!`,
        `      </button>`,
        `    }`,
        `  </div>`,
        `</ng-template>`,
      ].join('\n');

      expect(content).toBe(result);
    });

    it('should not remove a template thats not used in control flow', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain('<ng-template #myTmpl let-greeting>');
    });

    it('should remove a template thats only used in control flow', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div class="statistics">`,
          `    <ng-container *ngIf="null !== value; else preload">`,
          `      <div class="statistics__counter"`,
          `        *ngIf="!isMoney"`,
          `      >`,
          `        {{ value | number }}`,
          `      </div>`,
          `      <div class="statistics__counter"`,
          `        *ngIf="isMoney"`,
          `      >`,
          `      {{ value | number }}$`,
          `      </div>`,
          `    </ng-container>`,
          `</div>`,
          `<ng-template #preload>`,
          `  <preload-rect`,
          `    height="2rem"`,
          `    width="6rem" />`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      const result = [
        `<div class="statistics">`,
        `  @if (null !== value) {`,
        `    @if (!isMoney) {`,
        `      <div class="statistics__counter"`,
        `        >`,
        `        {{ value | number }}`,
        `      </div>`,
        `    }`,
        `    @if (isMoney) {`,
        `      <div class="statistics__counter"`,
        `        >`,
        `        {{ value | number }}$`,
        `      </div>`,
        `    }`,
        `  } @else {`,
        `    <preload-rect`,
        `      height="2rem"`,
        `      width="6rem" />`,
        `  }`,
        `</div>\n`,
      ].join('\n');

      expect(content).toBe(result);
    });

    it('should migrate template with ngTemplateOutlet', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template [ngIf]="!thing" [ngIfElse]="elseTmpl">`,
          `    {{ this.value(option) }}`,
          `</ng-template>`,
          `<ng-template`,
          `    #elseTmpl`,
          `    *ngTemplateOutlet="thing; context: {option: option}">`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      const result = [
        `@if (!thing) {`,
        `  {{ this.value(option) }}`,
        `} @else {`,
        `  <ng-container *ngTemplateOutlet="thing; context: {option: option}"></ng-container>`,
        `}\n`,
      ].join('\n');

      expect(content).toBe(result);
    });

    it('should migrate template with ngTemplateOutlet on if else template', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template`,
          `  [ngIf]="false"`,
          `  [ngIfElse]="fooTemplate"`,
          `  [ngTemplateOutlet]="barTemplate"`,
          `>`,
          `</ng-template>`,
          `<ng-template #fooTemplate>`,
          `  Foo`,
          `</ng-template>`,
          `<ng-template #barTemplate>`,
          `  Bar`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      const result = [
        `@if (false) {`,
        `  <ng-template`,
        `    [ngTemplateOutlet]="barTemplate"`,
        `    >`,
        `  </ng-template>`,
        `} @else {`,
        `  Foo`,
        `}`,
        `<ng-template #barTemplate>`,
        `  Bar`,
        `</ng-template>`,
      ].join('\n');

      expect(content).toBe(result);
    });

    it('should migrate template with ngIfThen and remove template', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template`,
          `  [ngIf]="mode === 'foo'"`,
          `  [ngIfThen]="foo"`,
          `  [ngIfElse]="bar"`,
          `></ng-template>`,
          `<ng-template #foo>`,
          `  Foo`,
          `</ng-template>`,
          `<ng-template #bar>`,
          `  Bar`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      const result = [`@if (mode === 'foo') {`, `  Foo`, `} @else {`, `  Bar`, `}\n`].join('\n');

      expect(content).toBe(result);
    });

    it('should move templates after they were migrated to new syntax', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `  <ng-container *ngIf="cond; else testTpl">`,
          `    bla bla`,
          `  </ng-container>`,
          `</div>`,
          `<ng-template #testTpl>`,
          `  <div class="test" *ngFor="let item of items"></div>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<div>`,
        `  @if (cond) {`,
        `    bla bla`,
        `  } @else {`,
        `    @for (item of items; track item) {`,
        `      <div class="test"></div>`,
        `    }`,
        `  }`,
        `</div>\n`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should preserve i18n attribute on ng-templates in an if/else', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `  <ng-container *ngIf="cond; else testTpl">`,
          `    bla bla`,
          `  </ng-container>`,
          `</div>`,
          `<ng-template #testTpl i18n="@@test_key">`,
          `  <div class="test" *ngFor="let item of items"></div>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<div>`,
        `  @if (cond) {`,
        `    bla bla`,
        `  } @else {`,
        `    <ng-container i18n="@@test_key">`,
        `  @for (item of items; track item) {`,
        `<div class="test"></div>`,
        `}`,
        `</ng-container>`,
        `  }`,
        `</div>\n`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should migrate multiple if/else using the same ng-template', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `  <div *ngIf="hasPermission; else noPermission">presentation</div>`,
          `  <div *ngIf="someOtherPermission; else noPermission">presentation</div>`,
          `</div>`,
          `<ng-template #noPermission>`,
          `  <p>No Permissions</p>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<div>`,
        `  @if (hasPermission) {`,
        `    <div>presentation</div>`,
        `  } @else {`,
        `    <p>No Permissions</p>`,
        `  }`,
        `  @if (someOtherPermission) {`,
        `    <div>presentation</div>`,
        `  } @else {`,
        `    <p>No Permissions</p>`,
        `  }`,
        `</div>\n`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should remove a template with no overlap with following elements', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container *ngIf="stuff">`,
          `  <div>`,
          `    <ul>`,
          `      <li>`,
          `        <span>`,
          `          <ng-container *ngIf="things; else elseTmpl">`,
          `            <p>Hmm</p>`,
          `          </ng-container>`,
          `          <ng-template #elseTmpl> 0 </ng-template></span>`,
          `      </li>`,
          `    </ul>`,
          `  </div>`,
          `</ng-container>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (stuff) {`,
          `  <div>`,
          `    <ul>`,
          `      <li>`,
          `        <span>`,
          `          @if (things) {`,
          `            <p>Hmm</p>`,
          `          } @else {`,
          `            0`,
          `          }`,
          `        </span>`,
          `      </li>`,
          `    </ul>`,
          `  </div>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate nested template usage correctly', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container *ngIf="!(condition$ | async); else template">`,
          `  Hello!`,
          `</ng-container>`,
          `<ng-template #bar>Bar</ng-template>`,
          `<ng-template #foo>Foo</ng-template>`,
          `<ng-template #template>`,
          `  <ng-container`,
          `    *ngIf="(foo$ | async) === true; then foo; else bar"`,
          `  ></ng-container>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (!(condition$ | async)) {`,
          `  Hello!`,
          `} @else {`,
          `  @if ((foo$ | async) === true) {`,
          `    Foo`,
          `  } @else {`,
          `    Bar`,
          `  }`,
          `}\n`,
        ].join('\n'),
      );
    });

    it('should add an ngTemplateOutlet when the template placeholder does not match a template', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [`<button *ngIf="active; else defaultTemplate">`, `  Hello!`, `</button>`].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (active) {`,
          `  <button>`,
          `    Hello!`,
          `  </button>`,
          `} @else {`,
          `  <ng-template [ngTemplateOutlet]="defaultTemplate"></ng-template>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should handle OR logic in ngIf else case', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="condition; else titleTemplate || defaultTemplate">Hello!</div>`,
          `<ng-template #defaultTemplate> Default </ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (condition) {`,
          `  <div>Hello!</div>`,
          `} @else {`,
          `  <ng-template [ngTemplateOutlet]="titleTemplate || defaultTemplate"></ng-template>`,
          `}`,
          `<ng-template #defaultTemplate> Default </ng-template>`,
        ].join('\n'),
      );
    });

    it('should handle ternaries in ngIfElse', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template`,
          `  [ngIf]="customClearTemplate"`,
          `  [ngIfElse]="isSidebarV3 || variant === 'v3' ? clearTemplateV3 : clearTemplate"`,
          `  [ngTemplateOutlet]="customClearTemplate"`,
          `></ng-template>`,
          `<ng-template #clearTemplateV3>v3</ng-template>`,
          `<ng-template #clearTemplate>clear</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (customClearTemplate) {`,
          `  <ng-template`,
          `    [ngTemplateOutlet]="customClearTemplate"`,
          `  ></ng-template>`,
          `} @else {`,
          `  <ng-template [ngTemplateOutlet]="isSidebarV3 || variant === 'v3' ? clearTemplateV3 : clearTemplate"></ng-template>`,
          `}`,
          `<ng-template #clearTemplateV3>v3</ng-template>`,
          `<ng-template #clearTemplate>clear</ng-template>`,
        ].join('\n'),
      );
    });

    it('should handle ternaries in ngIf', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="!vm.isEmpty; else vm.loading ? loader : empty"></div>`,
          `<ng-template #loader>Loading</ng-template>`,
          `<ng-template #empty>Empty</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (!vm.isEmpty) {`,
          `  <div></div>`,
          `} @else {`,
          `  <ng-template [ngTemplateOutlet]="vm.loading ? loader : empty"></ng-template>`,
          `}`,
          `<ng-template #loader>Loading</ng-template>`,
          `<ng-template #empty>Empty</ng-template>`,
        ].join('\n'),
      );
    });

    it('should replace all instances of template placeholders', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="condition; else otherTemplate">`,
          `  <ng-container *ngIf="!defaultTemplate; else defaultTemplate">`,
          `    Hello!`,
          `  </ng-container>`,
          `</div>`,
          `<ng-template #otherTemplate>`,
          `  <div>`,
          `    <ng-container *ngIf="!defaultTemplate; else defaultTemplate">`,
          `      Hello again!`,
          `    </ng-container>`,
          `  </div>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (condition) {`,
          `  <div>`,
          `    @if (!defaultTemplate) {`,
          `      Hello!`,
          `    } @else {`,
          `      <ng-template [ngTemplateOutlet]="defaultTemplate"></ng-template>`,
          `    }`,
          `  </div>`,
          `} @else {`,
          `  <div>`,
          `    @if (!defaultTemplate) {`,
          `      Hello again!`,
          `    } @else {`,
          `      <ng-template [ngTemplateOutlet]="defaultTemplate"></ng-template>`,
          `    }`,
          `  </div>`,
          `}\n`,
        ].join('\n'),
      );
    });

    it('should trim newlines in ngIf conditions', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-template`,
          `  [ngIf]="customClearTemplate"`,
          `  [ngIfElse]="`,
          `    isSidebarV3 || variant === 'v3' ? clearTemplateV3 : clearTemplate`,
          `  "`,
          `></ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');

      expect(content).toBe(
        [
          `@if (customClearTemplate) {`,
          `} @else {`,
          `  <ng-template [ngTemplateOutlet]="isSidebarV3 || variant === 'v3' ? clearTemplateV3 : clearTemplate"></ng-template>`,
          `}`,
        ].join('\n'),
      );
    });

    it('should migrate a template using the θδ characters', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: './comp.html',
          standalone: true,
          imports: [NgIf],
        })
        class DeclareComp {
          show = false;
        }
      `,
      );

      writeFile('/comp.html', `<div *ngIf="show">Some greek characters: θδ!</div>`);

      await runMigration();

      expect(tree.readContent('/comp.html')).toBe(
        '@if (show) {<div>Some greek characters: θδ!</div>}',
      );
    });
  });

  describe('formatting', () => {
    it('should reformat else if', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="true">changed</div>`,
          `<div>`,
          `@if (stuff) {`,
          `<h2>Title</h2>`,
          `<p>Stuff</p>`,
          `} @else if (things) {`,
          `<p>Things</p>`,
          `} @else {`,
          `<p>Huh</p>`,
          `}`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@if (true) {`,
        `  <div>changed</div>`,
        `}`,
        `<div>`,
        `  @if (stuff) {`,
        `    <h2>Title</h2>`,
        `    <p>Stuff</p>`,
        `  } @else if (things) {`,
        `    <p>Things</p>`,
        `  } @else {`,
        `    <p>Huh</p>`,
        `  }`,
        `</div>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should reformat properly with svg', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="true">changed</div>`,
          `<div>`,
          `<svg class="filterthing">`,
          `<filter id="stuff">`,
          `<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>`,
          `<feOffset dx="0" dy="0" result="offsetblur"/>`,
          `<feFlood flood-color="rgba(60,64,67,0.15)"/>`,
          `<feComposite in2="offsetblur" operator="in"/>`,
          `<feMerge>`,
          `<feMergeNode/>`,
          `<feMergeNode in="SourceGraphic"/>`,
          `</feMerge>`,
          `</filter>`,
          `</svg>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@if (true) {`,
        `  <div>changed</div>`,
        `}`,
        `<div>`,
        `  <svg class="filterthing">`,
        `    <filter id="stuff">`,
        `      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>`,
        `      <feOffset dx="0" dy="0" result="offsetblur"/>`,
        `      <feFlood flood-color="rgba(60,64,67,0.15)"/>`,
        `      <feComposite in2="offsetblur" operator="in"/>`,
        `      <feMerge>`,
        `        <feMergeNode/>`,
        `        <feMergeNode in="SourceGraphic"/>`,
        `      </feMerge>`,
        `    </filter>`,
        `  </svg>`,
        `</div>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should reformat properly with if else and containers', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="true">changed</div>`,
          `<div>`,
          `@if (!ruleGroupDropdownLabels?.get(JoinOperator.AND)) {`,
          `<ng-container`,
          `i18n="{{i18n}}"`,
          `>`,
          `Match <strong>EVERY</strong> rule in this group`,
          `</ng-container>`,
          `} @else {`,
          `{{ruleGroupDropdownLabels?.get(JoinOperator.AND)}}`,
          `}`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@if (true) {`,
        `  <div>changed</div>`,
        `}`,
        `<div>`,
        `  @if (!ruleGroupDropdownLabels?.get(JoinOperator.AND)) {`,
        `    <ng-container`,
        `      i18n="{{i18n}}"`,
        `      >`,
        `Match <strong>EVERY</strong> rule in this group`,
        `</ng-container>`,
        `  } @else {`,
        `    {{ruleGroupDropdownLabels?.get(JoinOperator.AND)}}`,
        `  }`,
        `</div>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should remove empty lines only in parts of template that were changed', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>header</div>\n`,
          `<span>header</span>\n\n\n`,
          `<div *ngIf="true">changed</div>`,
          `<div>\n`,
          `  <ul>`,
          `    <li *ngFor="let item of items">{{ item }}</li>`,
          `  </ul>`,
          `</div>\n\n`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `<div>header</div>\n`,
        `<span>header</span>\n\n\n`,
        `@if (true) {`,
        `  <div>changed</div>`,
        `}`,
        `<div>\n`,
        `  <ul>`,
        `    @for (item of items; track item) {`,
        `      <li>{{ item }}</li>`,
        `    }`,
        `  </ul>`,
        `</div>\n\n`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should reformat properly with if else and mixed content', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="true">changed</div>`,
          `<button`,
          `class="things"`,
          `(click)="stuff">`,
          `@if (aCondition) {`,
          `Match <strong>EVERY</strong> rule group`,
          `} @else {`,
          `{{ruleGroupDropdownLabels?.get(JoinOperator.AND)}}`,
          `}`,
          `</button>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@if (true) {`,
        `  <div>changed</div>`,
        `}`,
        `<button`,
        `  class="things"`,
        `  (click)="stuff">`,
        `  @if (aCondition) {`,
        `    Match <strong>EVERY</strong> rule group`,
        `  } @else {`,
        `    {{ruleGroupDropdownLabels?.get(JoinOperator.AND)}}`,
        `  }`,
        `</button>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should reformat self closing tags', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="true">changed</div>`,
          `<div>`,
          `@if (stuff) {`,
          `<img src="path.png" alt="stuff" />`,
          `} @else {`,
          `<img src="path.png"`,
          `alt="stuff" />`,
          `}`,
          `</div>\n`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@if (true) {`,
        `  <div>changed</div>`,
        `}`,
        `<div>`,
        `  @if (stuff) {`,
        `    <img src="path.png" alt="stuff" />`,
        `  } @else {`,
        `    <img src="path.png"`,
        `      alt="stuff" />`,
        `  }`,
        `</div>\n`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should format input tags without self closing slash', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          selector: 'declare-comp',
          templateUrl: 'comp.html',
        })
        class DeclareComp {}
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="true">changed</div>`,
          `<div>`,
          `@if (stuff) {`,
          `<img src="path.png" alt="stuff">`,
          `} @else {`,
          `<img src="path.png"`,
          `alt="stuff">`,
          `}`,
          `</div>\n`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');

      const expected = [
        `@if (true) {`,
        `  <div>changed</div>`,
        `}`,
        `<div>`,
        `  @if (stuff) {`,
        `    <img src="path.png" alt="stuff">`,
        `  } @else {`,
        `    <img src="path.png"`,
        `      alt="stuff">`,
        `  }`,
        `</div>\n`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should preserve inline template indentation', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {NgIf} from '@angular/common';\n`,
          `@Component({`,
          `  selector: 'declare-comp',`,
          `  template: \``,
          `    <div *ngIf="true">changed</div>`,
          `    <div>`,
          `    @if (stuff) {`,
          `    <img src="path.png" alt="stuff" />`,
          `    } @else {`,
          `    <img src="path.png"`,
          `    alt="stuff" />`,
          `    }`,
          `    </div>`,
          ` \`,`,
          `})`,
          `class DeclareComp {}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');

      const expected = [
        `import {Component} from '@angular/core';\n\n`,
        `@Component({`,
        `  selector: 'declare-comp',`,
        `  template: \``,
        `    @if (true) {`,
        `      <div>changed</div>`,
        `    }`,
        `    <div>`,
        `      @if (stuff) {`,
        `        <img src="path.png" alt="stuff" />`,
        `      } @else {`,
        `        <img src="path.png"`,
        `          alt="stuff" />`,
        `      }`,
        `    </div>`,
        `    \`,`,
        `})`,
        `class DeclareComp {}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should ignore formatting on i18n sections', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `  <p i18n>`,
          `  blah`,
          `</p>`,
          `<span *ngIf="show;else elseBlock" i18n>Content here</span>`,
          `<ng-template #elseBlock i18n>`,
          `  `,
          `  <p>Else Content</p>`,
          `</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `<div>`,
        `  <p i18n>`,
        `  blah`,
        `</p>`,
        `  @if (show) {`,
        `    <span i18n>Content here</span>`,
        `  } @else {`,
        `    <ng-container i18n>`,
        `  `,
        `  <p>Else Content</p>`,
        `</ng-container>`,
        `  }`,
        `</div>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should indent multi-line attribute strings to the right place', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="show">show</div>`,
          `<span i18n-message="this is a multi-`,
          `                    line attribute`,
          `                    with cool things">`,
          `  Content here`,
          `</span>`,
          `<span`,
          `    i18n-message="this is a multi-`,
          `                    line attribute`,
          `                    that starts`,
          `                    on a newline">`,
          `  Different Content`,
          `</span>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `@if (show) {`,
        `  <div>show</div>`,
        `}`,
        `<span i18n-message="this is a multi-`,
        `                    line attribute`,
        `                    with cool things">`,
        `  Content here`,
        `</span>`,
        `<span`,
        `    i18n-message="this is a multi-`,
        `                    line attribute`,
        `                    that starts`,
        `                    on a newline">`,
        `  Different Content`,
        `</span>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should indent multi-line attribute strings as single quotes to the right place', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="show">show</div>`,
          `<span i18n-message='this is a multi-`,
          `                    line attribute`,
          `                    with cool things'>`,
          `  Content here`,
          `</span>`,
          `<span`,
          `    i18n-message='this is a multi-`,
          `                    line attribute`,
          `                    that starts`,
          `                    on a newline'>`,
          `  Different here`,
          `</span>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `@if (show) {`,
        `  <div>show</div>`,
        `}`,
        `<span i18n-message='this is a multi-`,
        `                    line attribute`,
        `                    with cool things'>`,
        `  Content here`,
        `</span>`,
        `<span`,
        `    i18n-message='this is a multi-`,
        `                    line attribute`,
        `                    that starts`,
        `                    on a newline'>`,
        `  Different here`,
        `</span>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should handle dom nodes with underscores mixed in', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="show">show</div>`,
          `<a-very-long-component-name-that-has_underscores-too`,
          `  [selected]="selected | async "`,
          `>`,
          `</a-very-long-component-name-that-has_underscores-too>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `@if (show) {`,
        `  <div>show</div>`,
        `}`,
        `<a-very-long-component-name-that-has_underscores-too`,
        `  [selected]="selected | async "`,
        `  >`,
        `</a-very-long-component-name-that-has_underscores-too>`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should handle single-line element with a log tag name and a closing bracket on a new line', async () => {
      writeFile(
        '/comp.ts',
        `
          import {Component} from '@angular/core';
          import {NgIf} from '@angular/common';

          @Component({templateUrl: './comp.html'})
          class Comp {
            show = false;
          }
        `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container *ngIf="true">`,
          `<component-name-with-several-dashes></component-name-with-several-dashes`,
          `></ng-container>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.html');
      const expected = [
        `@if (true) {`,
        `  <component-name-with-several-dashes></component-name-with-several-dashes`,
        `    >`,
        `  }`,
      ].join('\n');

      expect(actual).toBe(expected);
    });
  });

  describe('imports', () => {
    it('should remove common module imports post migration', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {NgIf} from '@angular/common';`,
          `@Component({`,
          `  imports: [NgIf],`,
          `  template: \`<div><span *ngIf="toggle">shrug</span></div>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';\n`,
        `@Component({`,
        `  imports: [],`,
        `  template: \`<div>@if (toggle) {<span>shrug</span>}</div>\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not remove common module imports post migration if errors prevented migrating the external template file', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {NgIf} from '@angular/common';`,
          `@Component({`,
          `  imports: [NgIf],`,
          `  templateUrl: './comp.html',`,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `  <span *ngIf="toggle; else elseTmpl">shrug</span>`,
          `</div>`,
          `<ng-template #elseTmpl>else content</ng-template>`,
          `<ng-template #elseTmpl>different</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const actualCmp = tree.readContent('/comp.ts');
      const expectedCmp = [
        `import {Component} from '@angular/core';`,
        `import {NgIf} from '@angular/common';`,
        `@Component({`,
        `  imports: [NgIf],`,
        `  templateUrl: './comp.html',`,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');
      const actualTemplate = tree.readContent('/comp.html');

      const expectedTemplate = [
        `<div>`,
        `  <span *ngIf="toggle; else elseTmpl">shrug</span>`,
        `</div>`,
        `<ng-template #elseTmpl>else content</ng-template>`,
        `<ng-template #elseTmpl>different</ng-template>`,
      ].join('\n');

      expect(actualCmp).toBe(expectedCmp);
      expect(actualTemplate).toBe(expectedTemplate);
    });

    it('should not remove common module imports post migration if other items used', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {CommonModule} from '@angular/common';`,
          `import {Component} from '@angular/core';\n`,
          `@Component({`,
          `  imports: [NgIf, DatePipe],`,
          `  template: \`<div><span *ngIf="toggle">{{ d | date }}</span></div>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {CommonModule} from '@angular/common';`,
        `import {Component} from '@angular/core';\n`,
        `@Component({`,
        `  imports: [DatePipe],`,
        `  template: \`<div>@if (toggle) {<span>{{ d | date }}</span>}</div>\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not duplicate comments post migration if other items used', async () => {
      writeFile(
        '/comp.ts',
        [
          `// comment here`,
          `import {NgIf, CommonModule} from '@angular/common';`,
          `import {Component} from '@angular/core';\n`,
          `@Component({`,
          `  imports: [NgIf, DatePipe],`,
          `  template: \`<div><span *ngIf="toggle">{{ d | date }}</span></div>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `// comment here`,
        `import { CommonModule } from '@angular/common';`,
        `import {Component} from '@angular/core';\n`,
        `@Component({`,
        `  imports: [DatePipe],`,
        `  template: \`<div>@if (toggle) {<span>{{ d | date }}</span>}</div>\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should leave non-cf common module imports post migration', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {NgIf, AsyncPipe} from '@angular/common';\n`,
          `@Component({`,
          `  imports: [NgIf, AsyncPipe],`,
          `  template: \`<div><span *ngIf="toggle">shrug</span></div>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';`,
        `import { AsyncPipe } from '@angular/common';\n`,
        `@Component({`,
        `  imports: [AsyncPipe],`,
        `  template: \`<div>@if (toggle) {<span>shrug</span>}</div>\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should remove common module post migration', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {CommonModule} from '@angular/common';`,
          `@Component({`,
          `  imports: [CommonModule],`,
          `  template: \`<div><span *ngIf="toggle">shrug</span></div>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';\n`,
        `@Component({`,
        `  imports: [],`,
        `  template: \`<div>@if (toggle) {<span>shrug</span>}</div>\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should leave common module post migration if other common module deps exist', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {CommonModule} from '@angular/common';\n`,
          `@Component({`,
          `  imports: [CommonModule],`,
          `  template: \`<div><span *ngIf="toggle">{{ shrug | lowercase }}</span></div>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';`,
        `import {CommonModule} from '@angular/common';\n`,
        `@Component({`,
        `  imports: [CommonModule],`,
        `  template: \`<div>@if (toggle) {<span>{{ shrug | lowercase }}</span>}</div>\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should remove common module post migration if using external template', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {CommonModule} from '@angular/common';\n`,
          `@Component({`,
          `  imports: [CommonModule],`,
          `  templateUrl: './comp.html',`,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      writeFile(
        '/comp.html',
        [`<div>`, `<span *ngIf="show">Content here</span>`, `</div>`].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';\n\n`,
        `@Component({`,
        `  imports: [],`,
        `  templateUrl: './comp.html',`,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not remove common module when more common module symbols are found', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component, NgModule} from '@angular/core';`,
          `import {CommonModule} from '@angular/common';\n`,
          `@Component({`,
          `  selector: 'example-cmp',`,
          `  templateUrl: './comp.html',`,
          `})`,
          `export class ExampleCmp {`,
          `}`,
          `@Component({`,
          `  standalone: true`,
          `  selector: 'example2-cmp',`,
          `  imports: [CommonModule],`,
          `  templateUrl: './comp.html',`,
          `})`,
          `export class Example2Cmp {`,
          `}`,
          `const NG_MODULE_IMPORTS = [CommonModule, OtherModule];`,
          ``,
          `@NgModule({`,
          `  declarations: [ExampleCmp],`,
          `  exports: [ExampleCmp],`,
          `  imports: [NG_MODULE_IMPORTS],`,
          `})`,
          `export class ExampleModule {}`,
        ].join('\n'),
      );

      writeFile(
        '/comp.html',
        [`<div>`, `<span *ngIf="show">Content here</span>`, `</div>`].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component, NgModule} from '@angular/core';`,
        `import {CommonModule} from '@angular/common';\n`,
        `@Component({`,
        `  selector: 'example-cmp',`,
        `  templateUrl: './comp.html',`,
        `})`,
        `export class ExampleCmp {`,
        `}`,
        `@Component({`,
        `  standalone: true`,
        `  selector: 'example2-cmp',`,
        `  imports: [],`,
        `  templateUrl: './comp.html',`,
        `})`,
        `export class Example2Cmp {`,
        `}`,
        `const NG_MODULE_IMPORTS = [CommonModule, OtherModule];`,
        ``,
        `@NgModule({`,
        `  declarations: [ExampleCmp],`,
        `  exports: [ExampleCmp],`,
        `  imports: [NG_MODULE_IMPORTS],`,
        `})`,
        `export class ExampleModule {}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not remove common module when second run of migration and common module symbols are found', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {CommonModule} from '@angular/common';\n`,
          `@Component({`,
          `  standalone: true`,
          `  selector: 'example-cmp',`,
          `  templateUrl: './comp.html',`,
          `  imports: [CommonModule],`,
          `})`,
          `export class ExampleCmp {`,
          `}`,
        ].join('\n'),
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `  @if (state$ | async; as state) {`,
          `    <div>`,
          `      <span>Content here {{state}}</span>`,
          `    </div>`,
          `  }`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';`,
        `import {CommonModule} from '@angular/common';\n`,
        `@Component({`,
        `  standalone: true`,
        `  selector: 'example-cmp',`,
        `  templateUrl: './comp.html',`,
        `  imports: [CommonModule],`,
        `})`,
        `export class ExampleCmp {`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not remove imports when mismatch in counts', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {CommonModule} from '@angular/common';`,
          `import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';`,
          `@Component({`,
          `  selector: 'description',`,
          `  template: \`<span>{{getDescription()}}</span>\`,`,
          `})`,
          `export class DescriptionController {`,
          `  getDescription(): string {`,
          `    return 'stuff';`,
          `  }`,
          `}`,
          ``,
          `@Pipe({name: 'description'})`,
          `export class DescriptionPipe implements PipeTransform {`,
          `  transform(nameString?: string): string {`,
          `    return nameString ?? '';`,
          `  }`,
          `}`,
          `@NgModule({`,
          `  declarations: [DescriptionController, DescriptionPipe],`,
          `  imports: [CommonModule],`,
          `  providers: [],`,
          `  exports: [DescriptionController, DescriptionPipe],`,
          `})`,
          `export class DescriptionModule {}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {CommonModule} from '@angular/common';`,
        `import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';`,
        `@Component({`,
        `  selector: 'description',`,
        `  template: \`<span>{{getDescription()}}</span>\`,`,
        `})`,
        `export class DescriptionController {`,
        `  getDescription(): string {`,
        `    return 'stuff';`,
        `  }`,
        `}`,
        ``,
        `@Pipe({name: 'description'})`,
        `export class DescriptionPipe implements PipeTransform {`,
        `  transform(nameString?: string): string {`,
        `    return nameString ?? '';`,
        `  }`,
        `}`,
        `@NgModule({`,
        `  declarations: [DescriptionController, DescriptionPipe],`,
        `  imports: [CommonModule],`,
        `  providers: [],`,
        `  exports: [DescriptionController, DescriptionPipe],`,
        `})`,
        `export class DescriptionModule {}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not remove other imports when mismatch in counts', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {DatePipe, NgIf} from '@angular/common';`,
          `import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';`,
          `@Component({`,
          `  selector: 'example',`,
          `  template: \`<span>{{ example | date }}</span>\`,`,
          `})`,
          `export class ExampleCmp {`,
          `  example: 'stuff',`,
          `}`,
          `const NG_MODULE_IMPORTS = [`,
          `  DatePipe,`,
          `  NgIf,`,
          `];`,
          `@NgModule({`,
          `  declarations: [ExampleCmp],`,
          `  imports: [NG_MODULE_IMPORTS],`,
          `  exports: [ExampleCmp],`,
          `})`,
          `export class ExampleModule {}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {DatePipe, NgIf} from '@angular/common';`,
        `import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';`,
        `@Component({`,
        `  selector: 'example',`,
        `  template: \`<span>{{ example | date }}</span>\`,`,
        `})`,
        `export class ExampleCmp {`,
        `  example: 'stuff',`,
        `}`,
        `const NG_MODULE_IMPORTS = [`,
        `  DatePipe,`,
        `  NgIf,`,
        `];`,
        `@NgModule({`,
        `  declarations: [ExampleCmp],`,
        `  imports: [NG_MODULE_IMPORTS],`,
        `  exports: [ExampleCmp],`,
        `})`,
        `export class ExampleModule {}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not modify `imports` initialized to a variable reference', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {CommonModule} from '@angular/common';\n`,
          `const IMPORTS = [CommonModule];\n`,
          `@Component({`,
          `  imports: IMPORTS,`,
          `  template: '<span *ngIf="show">Content here</span>',`,
          `})`,
          `class Comp {`,
          `  show = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';`,
        `import {CommonModule} from '@angular/common';\n`,
        `const IMPORTS = [CommonModule];\n`,
        `@Component({`,
        `  imports: IMPORTS,`,
        `  template: '@if (show) {<span>Content here</span>}',`,
        `})`,
        `class Comp {`,
        `  show = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should handle spread elements in the `imports` array', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {Component} from '@angular/core';`,
          `import {CommonModule} from '@angular/common';\n`,
          `const BEFORE = [];\n`,
          `const AFTER = [];\n`,
          `@Component({`,
          `  imports: [...BEFORE, CommonModule, ...AFTER],`,
          `  template: '<span *ngIf="show">Content here</span>',`,
          `})`,
          `class Comp {`,
          `  show = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {Component} from '@angular/core';\n\n`,
        `const BEFORE = [];\n`,
        `const AFTER = [];\n`,
        `@Component({`,
        `  imports: [...BEFORE, ...AFTER],`,
        `  template: '@if (show) {<span>Content here</span>}',`,
        `})`,
        `class Comp {`,
        `  show = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not remove common module if symbols are used inside new control flow', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {CommonModule} from '@angular/common';`,
          `import {Component} from '@angular/core';\n`,
          `@Component({`,
          `  imports: [CommonModule],`,
          `  template: \`@if (toggle) {<div>{{ d | date }}</div>} <span *ngIf="toggle">hi</span>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {CommonModule} from '@angular/common';`,
        `import {Component} from '@angular/core';\n`,
        `@Component({`,
        `  imports: [CommonModule],`,
        `  template: \`@if (toggle) {<div>{{ d | date }}</div>} @if (toggle) {<span>hi</span>}\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });

    it('should not remove common module if symbols are used inside @let', async () => {
      writeFile(
        '/comp.ts',
        [
          `import {CommonModule} from '@angular/common';`,
          `import {Component} from '@angular/core';\n`,
          `@Component({`,
          `  imports: [CommonModule],`,
          `  template: \`@let foo = 123 | date; <span *ngIf="foo">{{foo}}</span>\``,
          `})`,
          `class Comp {`,
          `  toggle = false;`,
          `}`,
        ].join('\n'),
      );

      await runMigration();
      const actual = tree.readContent('/comp.ts');
      const expected = [
        `import {CommonModule} from '@angular/common';`,
        `import {Component} from '@angular/core';\n`,
        `@Component({`,
        `  imports: [CommonModule],`,
        `  template: \`@let foo = 123 | date; @if (foo) {<span>{{foo}}</span>}\``,
        `})`,
        `class Comp {`,
        `  toggle = false;`,
        `}`,
      ].join('\n');

      expect(actual).toBe(expected);
    });
  });

  describe('no migration needed', () => {
    it('should do nothing when no control flow is present', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div><span>shrug</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain('template: `<div><span>shrug</span></div>`');
    });

    it('should do nothing with already present updated control flow', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<div>@if (toggle) {<span>shrug</span>}</div>\`
        })
        class Comp {
          toggle = false;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain('template: `<div>@if (toggle) {<span>shrug</span>}</div>`');
    });

    it('should migrate an ngif inside a block', async () => {
      writeFile(
        '/comp.ts',
        `
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
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain(
        'template: `<div>@if (toggle) {<div>@if (show) {<span>shrug</span>}</div>}</div>`',
      );
    });

    it('should update let value in a build if block to as value for the new control flow', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';

        @Component({
          imports: [NgIf],
          template: \`<ng-container *ngIf="value$ | async; let value"> {{value}} </ng-container>\`
        })
        class Comp {
          value$ = of('Rica');
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain('template: `@if (value$ | async; as value) { {{value}} }`');
    });

    it('should update let value in a standard if else block to as value for the new control flow', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          imports: [CommonModule],
          template: \`<div *ngIf="(logStatus$ | async)?.name; let userName; else loggedOut"> Hello {{ userName }} ! </div><ng-template #loggedOut></ng-template>\`
        })
        class Comp {
          logStatus$ =  of({ name: 'Robert' });
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain(
        'template: `@if ((logStatus$ | async)?.name; as userName) {<div> Hello {{ userName }} ! </div>} @else {}`',
      );
    });

    it('should update let value in a standard if else, then block to as value for the new control flow', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          imports: [CommonModule],
          template: \`<div *ngIf="isLoggedIn$ | async; let logIn; then loggedIn; else loggedOut"></div><ng-template #loggedIn>Log In</ng-template>
          <ng-template #loggedOut>Log Out</ng-template>\`
        })
        class Comp {
          isLoggedIn$ = of(true);
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain(
        'template: `@if (isLoggedIn$ | async; as logIn) {\n  Log In\n} @else {\n  Log Out\n}\n`',
      );
    });
  });

  describe('error handling', () => {
    it('should not migrate a template that would result in invalid html', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = 2;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div *ngIf="stuff; else elseTmpl">`,
          `    Stuff`,
          `</div>`,
          `<ng-template #elseTmpl>`,
          `  <div>things</div>`,
          `<ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');
      expect(content).toBe(
        [
          `<div *ngIf="stuff; else elseTmpl">`,
          `    Stuff`,
          `</div>`,
          `<ng-template #elseTmpl>`,
          `  <div>things</div>`,
          `<ng-template>`,
        ].join('\n'),
      );

      const warnings = warnOutput.join(' ');

      expect(warnings).toContain('The migration resulted in invalid HTML for');
      expect(warnings).toContain(
        'Please check the template for valid HTML structures and run the migration again.',
      );
    });

    it('should not migrate a template that would result in invalid switch block contents', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = 2;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div [ngSwitch]="testOpts">`,
          `<strong>`,
          `<p *ngSwitchCase="1">Option 1</p>`,
          `<p *ngSwitchCase="2">Option 2</p>`,
          `<p *ngSwitchDefault>Option 3</p>`,
          `</strong>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');
      expect(content).toBe(
        [
          `<div [ngSwitch]="testOpts">`,
          `<strong>`,
          `<p *ngSwitchCase="1">Option 1</p>`,
          `<p *ngSwitchCase="2">Option 2</p>`,
          `<p *ngSwitchDefault>Option 3</p>`,
          `</strong>`,
          `</div>`,
        ].join('\n'),
      );

      expect(warnOutput.join(' ')).toContain(
        `Element node: "strong" would result in invalid migrated @switch block structure. ` +
          `@switch can only have @case or @default as children.`,
      );
    });

    it('should not migrate a template that would result in invalid i18n nesting', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          testOpts = 2;
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<ng-container i18n="messageid">`,
          `  <div *ngIf="condition; else elseTmpl">`,
          `    If content here`,
          `  </div>`,
          `</ng-container>`,
          `<ng-template #elseTmpl i18n="elsemessageid">`,
          `  <div>Else content here</div>`,
          `</ng-template>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');
      expect(content).toBe(
        [
          `<ng-container i18n="messageid">`,
          `  <div *ngIf="condition; else elseTmpl">`,
          `    If content here`,
          `  </div>`,
          `</ng-container>`,
          `<ng-template #elseTmpl i18n="elsemessageid">`,
          `  <div>Else content here</div>`,
          `</ng-template>`,
        ].join('\n'),
      );

      expect(warnOutput.join(' ')).toContain(
        `Element with i18n attribute "ng-container" would result having a child of element with i18n attribute ` +
          `"ng-container". Please fix and re-run the migration.`,
      );
    });

    it('should not remove component reference it is used in component file with viewChild', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
        import { NgIf } from '@angular/common';

        @Component({
          standalone: true
          imports: [NgIf],
          template: \`<h1>Hello from {{ name }}!</h1>
                      <div *ngIf="showContent; then contentTemplate"></div>
                      <ng-template #contentTemplate><div>test content</div></ng-template>\`
        })
        class Comp {
            @ViewChild('contentTemplate') testContainer!: TemplateRef<unknown>;
            name = 'Angular';
            showContent = true;
            options: { value: string; html: any }[] = [];

            constructor(private viewContainerRef: ViewContainerRef) {}

            ngAfterViewInit(): void {
              this.viewContainerRef.createEmbeddedView(this.testContainer);
            }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain('<ng-template #contentTemplate>');
    });

    it('should not remove component reference it is used in component file with viewChildren', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component, TemplateRef, ViewChildren, ViewContainerRef, QueryList} from '@angular/core';
        import { NgIf } from '@angular/common';

        @Component({
          standalone: true
          imports: [NgIf],
          template: \`<h1>Hello from {{ name }}!</h1>
                      <div *ngIf="showContent; then contentTemplate"></div>
                      <ng-template #contentTemplate><div>test content</div></ng-template>\`
        })
        class Comp {
            @ViewChildren('contentTemplate') testContainer!: QueryList<TemplateRef<unknown>>;
            name = 'Angular';
            showContent = true;
            options: { value: string; html: any }[] = [];

            constructor(private viewContainerRef: ViewContainerRef) {}

            ngAfterViewInit(): void {
              this.viewContainerRef.createEmbeddedView(this.testContainer.last);
            }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).toContain('<ng-template #contentTemplate>');
    });

    it('should remove component reference when viewChild is commented in component file', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component, TemplateRef, ViewChild} from '@angular/core';
        import { NgIf } from '@angular/common';

        @Component({
          standalone: true
          imports: [NgIf],
          template: \`<h1>Hello from {{ name }}!</h1>
                      <div *ngIf="showContent; then contentTemplate"></div>
                      <ng-template #contentTemplate><div>test content</div></ng-template>\`
        })
        class Comp {
            // @ViewChild('contentTemplate') testContainer!: TemplateRef<unknown>;
            name = 'Angular';
            showContent = true;
            options: { value: string; html: any }[] = [];
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');
      expect(content).not.toContain('<ng-template #contentTemplate>');
    });

    it('should remove ng-template reference when use in if-else block', async () => {
      writeFile(
        '/comp.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
        }
      `,
      );

      writeFile(
        '/comp.html',
        [
          `<div>`,
          `<div *ngIf="param; else loading">`,
          `<div>content</div>`,
          `</div>`,
          `<ng-template #loading>`,
          `<div>loading</div>`,
          `</ng-template>`,
          `</div>`,
        ].join('\n'),
      );

      await runMigration();
      const content = tree.readContent('/comp.html');
      expect(content).not.toContain('<ng-template #loading>');
    });
  });
});

describe('control flow migration (ng generate)', () => {
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

  function runMigration(path: string | undefined = undefined, format: boolean = true) {
    return runner.runSchematic('control-flow-migration', {path, format}, tree);
  }

  const collectionJsonPath = resolve('../collection.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
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
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
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

  describe('path', () => {
    it('should throw an error if no files match the passed-in path', async () => {
      let error: string | null = null;

      writeFile(
        'dir.ts',
        `
        import {Directive} from '@angular/core';
        @Directive({selector: '[dir]'})
        export class MyDir {}
      `,
      );

      try {
        await runMigration('./foo');
      } catch (e: any) {
        error = e.message;
      }

      expect(error).toMatch(
        /Could not find any files to migrate under the path .*\/foo\. Cannot run the control flow migration/,
      );
    });

    it('should throw an error if a path outside of the project is passed in', async () => {
      let error: string | null = null;

      writeFile(
        'dir.ts',
        `
        import {Directive} from '@angular/core';
        @Directive({selector: '[dir]'})
        export class MyDir {}
      `,
      );

      try {
        await runMigration('../foo');
      } catch (e: any) {
        error = e.message;
      }
      expect(error).toBe('Cannot run control flow migration outside of the current project.');
    });

    it('should only migrate the paths that were passed in', async () => {
      writeFile(
        'comp.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';
        @Component({
          imports: [NgIf, NgFor,NgSwitch,NgSwitchCase ,NgSwitchDefault],
          template: \`<div><span *ngIf="toggle">This should be hidden</span></div>\`
        })
        class Comp {
          toggle = false;
        }
      `,
      );

      writeFile(
        'skip.ts',
        `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';
        @Component({
          imports: [NgIf],
          template: \`<div *ngIf="show">Show me</div>\`
        })
        class Comp {
          show = false;
        }
      `,
      );

      await runMigration('./comp.ts');
      const migratedContent = tree.readContent('/comp.ts');
      const skippedContent = tree.readContent('/skip.ts');

      expect(migratedContent).toContain(
        'template: `<div>@if (toggle) {<span>This should be hidden</span>}</div>`',
      );
      expect(migratedContent).toContain('imports: []');
      expect(migratedContent).not.toContain(`import {NgIf} from '@angular/common';`);
      expect(skippedContent).toContain('template: `<div *ngIf="show">Show me</div>`');
      expect(skippedContent).toContain('imports: [NgIf]');
      expect(skippedContent).toContain(`import {NgIf} from '@angular/common';`);
    });
  });

  it('should migrate an if else case and not format', async () => {
    writeFile(
      '/comp.ts',
      `
        import {Component} from '@angular/core';
        import {NgIf} from '@angular/common';
        @Component({
          templateUrl: './comp.html'
        })
        class Comp {
          show = false;
        }
      `,
    );

    writeFile(
      '/comp.html',
      [
        `<div>`,
        `<span *ngIf="show;else elseBlock">Content here</span>`,
        `<ng-template #elseBlock>Else Content</ng-template>`,
        `</div>`,
      ].join('\n'),
    );

    await runMigration(undefined, false);
    const content = tree.readContent('/comp.html');

    expect(content).toBe(
      [
        `<div>`,
        `@if (show) {`,
        `<span>Content here</span>`,
        `} @else {`,
        `Else Content`,
        `}\n`,
        `</div>`,
      ].join('\n'),
    );
  });
});
