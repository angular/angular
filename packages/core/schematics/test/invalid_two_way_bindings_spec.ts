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

describe('Invalid two-way bindings migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('invalid-two-way-bindings', {}, tree);
  }

  beforeEach(() => {
    runner = new SchematicTestRunner('test', runfiles.resolvePackageRelative('../migrations.json'));
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

  it('should migrate a two-way binding with a binary expression', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<input [(ngModel)]="a && b.c"/>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain(
        'template: `<input [ngModel]="a && b.c" (ngModelChange)="a && (b.c = $event)"/>`');
  });

  it('should migrate a two-way binding with a single unary expression', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<input [(ngModel)]="!a.b"/>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain(
        'template: `<input [ngModel]="!a.b" (ngModelChange)="a.b = $event"/>`');
  });

  it('should migrate a two-way binding with a nested unary expression', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<input [(ngModel)]="!!!!!!!a.b"/>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain(
        'template: `<input [ngModel]="!!!!!!!a.b" (ngModelChange)="a.b = $event"/>`');
  });

  it('should migrate a two-way binding with a conditional expression', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<input [(ngModel)]="a ? b : c.d"/>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain(
        'template: `<input [ngModel]="a ? b : c.d" (ngModelChange)="a ? b : c.d = $event"/>`');
  });

  it('should migrate multiple inline templates in the same file', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<input [(ngModel)]="a && b"/>\`
      })
      class Comp {}

      @Component({
        template: \`<input [(ngModel)]="a || b"/>\`
      })
      class Comp2 {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain(
        'template: `<input [ngModel]="a && b" (ngModelChange)="a && (b = $event)"/>`');
    expect(content).toContain(
        'template: `<input [ngModel]="a || b" (ngModelChange)="a || (b = $event)"/>`');
  });

  it('should migrate an external template', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class Comp {}
    `);

    writeFile('/comp.html', [
      `<div>`,
      `hello`,
      `<span>`,
      `<input [(ngModel)]="a && b"/>`,
      `</span>`,
      `</div>`,
    ].join('\n'));

    await runMigration();
    const content = tree.readContent('/comp.html');

    expect(content).toBe([
      `<div>`,
      `hello`,
      `<span>`,
      `<input [ngModel]="a && b" (ngModelChange)="a && (b = $event)"/>`,
      `</span>`,
      `</div>`,
    ].join('\n'));
  });

  it('should migrate a template referenced by multiple components', async () => {
    writeFile('/comp-a.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class CompA {}
    `);

    writeFile('/comp-b.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class CompB {}
    `);

    writeFile('/comp.html', [
      `<div>`,
      `hello`,
      `<span>`,
      `<input [(ngModel)]="a && b"/>`,
      `</span>`,
      `</div>`,
    ].join('\n'));

    await runMigration();
    const content = tree.readContent('/comp.html');

    expect(content).toBe([
      `<div>`,
      `hello`,
      `<span>`,
      `<input [ngModel]="a && b" (ngModelChange)="a && (b = $event)"/>`,
      `</span>`,
      `</div>`,
    ].join('\n'));
  });

  it('should migrate multiple two-way bindings on the same element', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<input [(foo)]="a && b" bar="123" [(baz)]="!!a"/>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain(
        'template: \`<input [foo]="a && b" (fooChange)="a && (b = $event)" ' +
        'bar="123" [baz]="!!a" (bazChange)="a = $event"/>\`');
  });

  it('should not stop the migration if a file cannot be read', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './does-not-exist.html'
      })
      class BrokenComp {}
    `);

    writeFile('/other-comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './comp.html'
      })
      class Comp {}
    `);

    writeFile('/comp.html', '<input [(ngModel)]="a || b"/>');

    await runMigration();
    const content = tree.readContent('/comp.html');

    expect(content).toBe('<input [ngModel]="a || b" (ngModelChange)="a || (b = $event)"/>');
  });

  it('should migrate a component that is not at the top level', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      function foo() {
        @Component({
          template: \`<input [(ngModel)]="a || b"/>\`
        })
        class Comp {}
      }
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');

    expect(content).toContain(
        'template: `<input [ngModel]="a || b" (ngModelChange)="a || (b = $event)"/>`');
  });

  it('should preserve a valid expression', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<input [(ngModel)]="a.b.c"/>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain('template: `<input [(ngModel)]="a.b.c"/>`');
  });

  it('should not migrate an invalid expression if an event listener for the same binding exists',
     async () => {
       writeFile('/comp.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: \`<input [(ngModel)]="a || b" (ngModelChange)="foo($event)"/>\`
        })
        class Comp {}
      `);

       await runMigration();
       const content = tree.readContent('/comp.ts');
       expect(content).toContain(
           'template: `<input [(ngModel)]="a || b" (ngModelChange)="foo($event)"/>`');
     });

  it('should not migrate an invalid expression if a property binding for the same binding exists',
     async () => {
       writeFile('/comp.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: \`<input [(ngModel)]="a || b" [ngModel]="foo"/>\`
        })
        class Comp {}
      `);

       await runMigration();
       const content = tree.readContent('/comp.ts');
       expect(content).toContain('template: `<input [(ngModel)]="a || b" [ngModel]="foo"/>`');
     });

  it('should migrate a two-way binding on an ng-template', async () => {
    writeFile('/comp.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`<ng-template [(ngModel)]="a && b.c"></ng-template>\`
      })
      class Comp {}
    `);

    await runMigration();
    const content = tree.readContent('/comp.ts');
    expect(content).toContain(
        'template: `<ng-template [ngModel]="a && b.c" (ngModelChange)="a && (b.c = $event)"></ng-template>`');
  });
});
