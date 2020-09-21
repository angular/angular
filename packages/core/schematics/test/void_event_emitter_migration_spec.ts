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

describe('EventEmitter<void> migration', () => {
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
        strictNullChecks: true,
      },
    }));
    writeFile('/angular.json', JSON.stringify({
      version: 1,
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
    }));

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('/node_modules/@angular/core/index.d.ts', `
      export declare class EventEmitter<T = any> {}
    `);

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


  it('should add <void> when .emit() without an argument is called in the component', async () => {
    writeFile('/index.ts', `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: ''})
      export class MyComponent {
        change = new EventEmitter();

        onClick() {
          this.change.emit();
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`change = new EventEmitter<void>()`);
    expect(warnOutput.length).toBe(0);
  });

  it('should treat .next() method of event emitter the same as .emit', async () => {
    writeFile('/index.ts', `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: ''})
      export class MyComponent {
        alwaysVoid = new EventEmitter();
        mixed = new EventEmitter();

        onClick() {
          this.alwaysVoid.next();

          this.mixed.next();
          this.mixed.emit(999);
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`alwaysVoid = new EventEmitter<void>()`);
    expect(tree.readContent('/index.ts')).toContain(`mixed = new EventEmitter()`);

    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/\s+index\.ts@12:11: .next\(\) call requires an argument/);
  });

  it('should keep a property as is if it already has type parameter on the constructor call',
     async () => {
       const originalContents = `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: ''})
      export class MyComponent {
        change = new EventEmitter<number>();

        onClick() {
          this.change.emit();
        }
      }
    `;
       writeFile('/index.ts', originalContents);

       await runMigration();
       expect(tree.readContent('/index.ts')).toEqual(originalContents);

       expect(warnOutput.length).toBe(1);
       expect(warnOutput[0]).toMatch(/\s+index\.ts@9:11: .emit\(\) call requires an argument/);
     });

  it('should keep a property as is if used with both void and non-void calls', async () => {
    const originalContents = `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: ''})
      export class MyComponent {
        change = new EventEmitter();

        onClick() {
          this.change.emit();
          this.change.emit(666);
        }
      }
    `;
    writeFile('/index.ts', originalContents);


    await runMigration();
    expect(tree.readContent('/index.ts')).toEqual(originalContents);

    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/\s+index\.ts@9:11: .emit\(\) call requires an argument/);
  });

  it('should keep a property as is if it has explicit type', async () => {
    const originalContents = `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: ''})
      export class MyComponent {
        change: EventEmitter<void> = new EventEmitter();

        onClick() {
          this.change.emit();
        }
      }
    `;
    writeFile('/index.ts', originalContents);

    await runMigration();
    expect(tree.readContent('/index.ts')).toEqual(originalContents);
    expect(warnOutput.length).toBe(0);
  });

  it('should analyze .emit calls in an inline component template', async () => {
    writeFile('/index.ts', `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: '<button (click)="change.emit()"></button>'})
      export class MyComponent {
        change = new EventEmitter();
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`change = new EventEmitter<void>()`);
    expect(warnOutput.length).toBe(0);
  });

  it('should analyze .emit calls in a template references via templateUrl', async () => {
    writeFile('/my.component.html', '<button (click)="change.emit()"></button>');
    writeFile('/index.ts', `
      import { EventEmitter, Component } from '@angular/core';

      @Component({templateUrl: './my.component.html'})
      export class MyComponent {
        change = new EventEmitter();
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`change = new EventEmitter<void>()`);
    expect(warnOutput.length).toBe(0);
  });

  it('should keep a property as is if .emit is called with an argument in a template', async () => {
    const originalContents = `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: '<button (click)="change.emit(777)"></button>'})
      export class MyComponent {
        change = new EventEmitter();
      }
    `;
    writeFile('/index.ts', originalContents);

    await runMigration();
    expect(tree.readContent('/index.ts')).toEqual(originalContents);
    expect(warnOutput.length).toBe(0);
  });

  it('should handle a file with multiple classes and multiple event emitters', async () => {
    const originalContents = `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: '<button (click)="emitInTemplate.emit()"></button>'})
      export class AComponent {
        emitInTemplate = new EventEmitter();
        emitInClass = new EventEmitter();
        emitWithArg = new EventEmitter();

        emitEvents() {
          this.emitInClass.emit();
          this.emitWithArg.emit(123);
        }
      }

      @Component({template: ''})
      export class BComponent {
        emitInClass = new EventEmitter();

        emitEvent() {
          this.emitInClass.emit(777);
        }
      }
    `;

    const expectedOutput = `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: '<button (click)="emitInTemplate.emit()"></button>'})
      export class AComponent {
        emitInTemplate = new EventEmitter<void>();
        emitInClass = new EventEmitter<void>();
        emitWithArg = new EventEmitter();

        emitEvents() {
          this.emitInClass.emit();
          this.emitWithArg.emit(123);
        }
      }

      @Component({template: ''})
      export class BComponent {
        emitInClass = new EventEmitter();

        emitEvent() {
          this.emitInClass.emit(777);
        }
      }
    `;

    writeFile('/index.ts', originalContents);
    await runMigration();
    expect(tree.readContent('/index.ts')).toEqual(expectedOutput);
    expect(warnOutput.length).toBe(0);
  });


  it('should print correct line/character in warnings for inline template', async () => {
    writeFile('/index.ts', `
      import { EventEmitter, Component } from '@angular/core';

      @Component({template: '<button (click)="change.emit()"></button>'})
      export class MyComponent {
        change = new EventEmitter<number>();
      }
    `);

    await runMigration();
    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/\s+index\.ts@4:47: .emit\(\) call requires an argument/);
  });


  it('should print correct line/character in warnings for template references via templateUrl',
     async () => {
       writeFile('/my.component.html', '<button (click)="change.emit()"></button>');
       writeFile('/index.ts', `
      import { EventEmitter, Component } from '@angular/core';

      @Component({templateUrl: './my.component.html'})
      export class MyComponent {
        change = new EventEmitter<number>();
      }
    `);

       await runMigration();
       expect(warnOutput.length).toBe(1);
       expect(warnOutput[0])
           .toMatch(/\s+my\.component\.html@1:18: .emit\(\) call requires an argument/);
     });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v14-void-event-emitter', {}, tree).toPromise();
  }
});
