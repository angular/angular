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

describe('template variable assignment migration', () => {
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
    return runner.runSchematicAsync('migration-v8-template-local-variables', {}, tree).toPromise();
  }

  it('should warn for two-way data binding variable assignment', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: '<cmp *ngFor="let optionName of options" [(opt)]="optionName"></cmp>',
      })
      export class MyComp {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/^⮑ {3}index.ts@5:69: Found assignment/);
  });

  it('should warn for two-way data binding assigning to "as" variable', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/tmpl.html', `
      <div *ngIf="somePartner() | async as partner">
        <some-comp [(value)]="partner"></some-comp>
      </div>
    `);

    await runMigration();

    expect(warnOutput.length).toBe(1);
    expect(warnOutput).toMatch(/^⮑ {3}tmpl.html@3:31: Found assignment/);
  });

  it('should warn for bound event assignments to "as" variable', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/sub_dir/tmpl.html', `
      <div *ngIf="true as visible">
          <div (click)="visible=false">Hide</div>
          <div (click)="visible=true">Show</div>
      </div>
    `);

    await runMigration();

    expect(warnOutput.length).toBe(2);
    expect(warnOutput[0]).toMatch(/^⮑ {3}sub_dir\/tmpl.html@3:25: Found assignment/);
    expect(warnOutput[1]).toMatch(/^⮑ {3}sub_dir\/tmpl.html@4:25: Found assignment/);
  });

  it('should warn for bound event assignments to template "let" variables', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/sub_dir/tmpl.html', `
      <ng-template let-visible="false">
          <div (click)="visible=false">Hide</div>
          <div (click)="visible=true">Show</div>
      </ng-template>
    `);

    await runMigration();

    expect(warnOutput.length).toBe(2);
    expect(warnOutput[0]).toMatch(/^⮑ {3}sub_dir\/tmpl.html@3:25: Found assignment/);
    expect(warnOutput[1]).toMatch(/^⮑ {3}sub_dir\/tmpl.html@4:25: Found assignment/);
  });

  it('should not warn for bound event assignments to component property', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/sub_dir/tmpl.html', `<button (click)="myProp = true"></button>`);

    await runMigration();

    expect(warnOutput.length).toBe(0);
  });

  it('should not warn for bound event assignments to template variable object property',
     async () => {
       writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {}
    `);

       writeFile('/sub_dir/tmpl.html', `
      <button *ngFor="let element of list" (click)="element.value = null">Reset</button>
    `);

       await runMigration();

       expect(warnOutput.length).toBe(0);
     });

  it('should not warn for property writes with template variable name but different receiver',
     async () => {
       writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {
        someProp = {
          element: 'someValue',
        };
      }
    `);

       writeFile('/sub_dir/tmpl.html', `
      <button *ngFor="let element of list" (click)="someProp.element = null">
        Reset
      </button>
    `);

       await runMigration();

       expect(warnOutput.length).toBe(0);
     });

  it('should warn for template variable assignments in expression conditional', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {
        otherVar = false;
      }
    `);

    writeFile('/sub_dir/tmpl.html', `
      <ng-template let-tmplVar>
        <p (click)="enabled ? tmplVar = true : otherVar = true"></p>
      </ng-template>
    `);

    await runMigration();

    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/^⮑ {3}sub_dir\/tmpl.html@3:31: Found assignment/);
  });

  it('should not warn for property writes with template variable name but different scope',
     async () => {
       writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {
        element = 'someValue';
      }
    `);

       writeFile('/sub_dir/tmpl.html', `
      <button *ngFor="let element of list">{{element}}</button>
      <button (click)="element = null"></button>
    `);

       await runMigration();

       expect(warnOutput.length).toBe(0);
     });


  it('should not throw an error if a detected template fails parsing', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './sub_dir/tmpl.html',
      })
      export class MyComp {}
    `);

    writeFile('/sub_dir/tmpl.html', `<x (click)="<invalid-syntax>"></x>`);

    await runMigration();

    expect(warnOutput.length).toBe(0);
  });

  it('should be able to report multiple templates within the same source file', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: '<ng-template let-one><a (sayHello)="one=true"></a></ng-template>',
      })
      export class MyComp {}

      @Component({
        template: '<ng-template let-two><b (greet)="two=true"></b></ng-template>',
      })
      export class MyComp2 {}
    `);

    await runMigration();

    expect(warnOutput.length).toBe(2);
    expect(warnOutput[0]).toMatch(/^⮑ {3}index.ts@5:56: Found assignment/);
    expect(warnOutput[1]).toMatch(/^⮑ {3}index.ts@10:53: Found assignment/);
  });
});
