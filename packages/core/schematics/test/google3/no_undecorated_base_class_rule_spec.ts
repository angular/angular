/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 noUndecoratedBaseClass TSLint rule', () => {
  const rulesDirectory = dirname(require.resolve(
      '../../migrations/undecorated-base-class/google3/noUndecoratedBaseClassRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR'] !, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  /** Runs TSLint with the no-undecorated-base-class TSLint rule.*/
  function runTSLint(fix = true) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile(
        {rules: {'no-undecorated-base-class': true}, linterOptions: {typeCheck: true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName) !.getFullText(), config);
    });

    return linter;
  }

  /** Writes a file to the current temporary directory. */
  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) { return readFileSync(join(tmpDir, fileName), 'utf8'); }

  it('should properly apply replacements for base class and referenced modules', () => {
    writeFile('index.ts', `
      import {Component, NgZone} from '@angular/core';
      
      export class Base {
        constructor(zone: NgZone) {}
      }
      
      @Component({template: '<span></span>'})
      export class MyComp extends Base {}
    `);

    writeFile('my-module.ts', `
      import {NgModule} from '@angular/core';
      import {MyComp} from './index';
      
      @NgModule({
        declarations: [MyComp],
      })
      export class MyModule {}
    `);

    runTSLint();

    expect(getFile('index.ts')).toContain(`{ Component, NgZone, Directive } from '@angular/core';`);
    expect(getFile('index.ts')).toMatch(/@Directive\(.*\)\nexport class Base {/);
    expect(getFile('my-module.ts')).toContain(`{ MyComp, Base } from './index';`);
    expect(getFile('my-module.ts')).toContain(`declarations: [MyComp, Base],`);
  });

  it('should apply replacements properly for multiple base classes', () => {
    writeFile('index.ts', `
      import {Component, NgZone} from '@angular/core';
      
      export class Base {
        constructor(zone: NgZone) {}
      }
      
      @Component({template: '<span></span>'})
      export class MyComp extends Base {}
    `);

    writeFile('second.ts', `
      import {Component, NgZone} from '@angular/core';
      
      export class Base {
        constructor(zone: NgZone) {}
      }
      
      @Component({template: '<span></span>'})
      export class MySecondComp extends Base {}
    `);

    writeFile('my-module.ts', `
      import {NgModule} from '@angular/core';
      import {MyComp} from './index';
      import {MySecondComp} from './second';
      
      @NgModule({
        declarations: [MyComp, MySecondComp],
      })
      export class MyModule {}
      
      @NgModule({
        declarations: [MySecondComp],
      })
      export class MySecondModule {}
    `);

    runTSLint();

    expect(getFile('index.ts'))
        .toMatch(/@Directive\({ selector: "_base_class_\d" }\)\nexport class Base {/);
    expect(getFile('second.ts'))
        .toMatch(/@Directive\({ selector: "_base_class_\d" }\)\nexport class Base {/);
    expect(getFile('my-module.ts')).toContain('declarations: [MyComp, MySecondComp, Base, Base_1]');
    expect(getFile('my-module.ts')).toContain('declarations: [MySecondComp, Base_1]');
    expect(getFile('my-module.ts')).toContain(`{ MyComp, Base } from './index';`);
    expect(getFile('my-module.ts')).toContain(`{ MySecondComp, Base as Base_1 } from './second';`);
  });

  it('should create proper rule failures which explain needed changes', () => {
    writeFile('index.ts', `
      import {Component, NgZone} from '@angular/core';
      
      export class Base {
        constructor(zone: NgZone) {}
      }
      
      @Component({template: '<span></span>'})
      export class MyComp extends Base {}
    `);

    writeFile('my-module.ts', `
      import {NgModule} from '@angular/core';
      import {MyComp} from './index';
      
      @NgModule({
        declarations: [MyComp],
      })
      export class MyModule {}
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(4);
    expect(failures[0].getFailure()).toMatch(/Base class needs to be decorated/);
    expect(failures[1].getFailure()).toMatch(/Import needs to be updated.*NgZone, Directive }/);
    expect(failures[2].getFailure()).toMatch(/Import needs to be updated.*MyComp, Base }/);
    expect(failures[3].getFailure()).toMatch(/Module needs to have.*MyComp, Base]/);
  });
});
