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
import * as shx from 'shelljs';

describe('routerlink emptyExpr assignment migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let warnOutput: string[];

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({
      compilerOptions: {
        lib: ['es2015'],
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    warnOutput = [];
    runner.logger.subscribe(logEntry => {
      if (logEntry.level === 'warn') {
        warnOutput.push(logEntry.message);
      }
    });

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

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v13-router-link-empty-expression', {}, tree)
        .toPromise();
  }

  it('should warn for emptyExpr assignment in inline template', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: '<div [routerLink]=""></div>',
      })
      export class MyComp {}
    `);

    await runMigration();
    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/^⮑ {3}index\.ts@5:25/);

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`<div [routerLink]="[]"></div>`);
  });

  it('should warn for EmptyExpr assignment in external templatae', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/tmpl.html', `
      <div *ngIf="somePartner() | async as partner">
        <some-comp [routerLink]=""></some-comp>
      </div>
    `);

    await runMigration();

    expect(warnOutput.length).toBe(1);
    expect(warnOutput).toMatch(/^⮑ {3}tmpl\.html@3:20/);

    const content = tree.readContent('/tmpl.html');
    expect(content).toContain(`<some-comp [routerLink]="[]"></some-comp>`);
  });

  it('should warn for `[routerLink]`', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/tmpl.html', `
    <div>
      <some-comp [routerLink]></some-comp>
    </div>
    `);

    await runMigration();

    const content = tree.readContent('/tmpl.html');
    expect(content).toContain(`<some-comp [routerLink]="[]"></some-comp>`);
  });

  it('should work for many instances in a single template', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/tmpl.html', `
        <some-comp1 [routerLink]=""></some-comp1> <some-comp2 [routerLink]=""></some-comp2>
        <some-comp3 [routerLink]=""></some-comp3> <some-comp4 [routerLink]=""></some-comp4>
    `);

    await runMigration();
    const content = tree.readContent('/tmpl.html');

    expect(content).toContain(
        `<some-comp1 [routerLink]="[]"></some-comp1> <some-comp2 [routerLink]="[]"></some-comp2>`);
    expect(content).toContain(
        `<some-comp3 [routerLink]="[]"></some-comp3> <some-comp4 [routerLink]="[]"></some-comp4>`);
  });

  it('should work for many references to one template', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp {}

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp2 {}
    `);

    writeFile('/tmpl.html', `<some-comp1 [routerLink]=""></some-comp1>`);

    await runMigration();
    const content = tree.readContent('/tmpl.html');

    expect(content).toContain(`<some-comp1 [routerLink]="[]"></some-comp1>`);
  });

  it('does not migrate empty attribute expression because it is equivalent to empty string, not undefined',
     async () => {
       writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp {}

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp2 {}
    `);

       const contents = `<some-comp1 routerLink=""></some-comp1>`;
       writeFile('/tmpl.html', contents);

       await runMigration();
       const content = tree.readContent('/tmpl.html');

       expect(content).toEqual(contents);
     });

  it('should work for files that use CRLF line endings', async () => {
    writeFile(
        '/index.ts',
        `
      import {Component} from '@angular/core';

      @Component({` +
            'template: `<div [routerLink]=\'\'>\r\n{{1}}\r\n</div>`' +
            `})
      export class MyComp {}
    `);

    await runMigration();
    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/^⮑ {3}index\.ts@4:35/);

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`<div [routerLink]='[]'>\r\n{{1}}\r\n</div>`);
  });

  it('should work for files that use CRLF line endings before routerLink bindings', async () => {
    writeFile(
        '/index.ts',
        `
      import {Component} from '@angular/core';

      @Component({` +
            'template: `' +
            '\r\n\r\n\r\n<div [routerLink]>{{1}}</div>`' +
            `})
      export class MyComp {}
    `);

    await runMigration();
    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/^⮑ {3}index\.ts@7:6/);

    const content = tree.readContent('/index.ts');
    expect(content).toContain(`\r\n\r\n\r\n<div [routerLink]="[]">{{1}}</div>`);
  });
});
