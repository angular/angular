/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 undecorated classes with decorated fields TSLint rule', () => {
  const rulesDirectory = dirname(
      require.resolve('../../migrations/google3/undecoratedClassesWithDecoratedFieldsRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);
    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({
      rules: {'undecorated-classes-with-decorated-fields': true},
    });

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }

  it('should flag undecorated classes with decorated fields', () => {
    writeFile('/index.ts', `
      import { Input, Directive } from '@angular/core';

      @Directive()
      export class ValidClass {
        @Input() isActive: boolean;
      }

      export class InvalidClass {
        @Input() isActive: boolean;
      }
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());

    expect(failures.length).toBe(1);
    expect(failures[0])
        .toBe('Class needs to be decorated with "@Directive()" because it uses Angular features.');
  });

  it(`should add an import for Directive if there isn't one already`, () => {
    writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`import { Input, Directive } from '@angular/core';`);
  });

  it('should not change the imports if there is an import for Directive already', () => {
    writeFile('/index.ts', `
      import { Directive, Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }

      @Directive()
      export class Child extends Base {
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`import { Directive, Input } from '@angular/core';`);
  });

  it('should not generate conflicting imports there is a different `Directive` symbol',
     async () => {
       writeFile('/index.ts', `
      import { HostBinding } from '@angular/core';

      export class Directive {
        // Simulates a scenario where a library defines a class named "Directive".
        // We don't want to generate a conflicting import.
      }

      export class MyLibrarySharedBaseClass {
        @HostBinding('class.active') isActive: boolean;
      }
    `);

       runTSLint(true);
       const fileContent = getFile('/index.ts');
       expect(fileContent)
           .toContain(`import { HostBinding, Directive as Directive_1 } from '@angular/core';`);
       expect(fileContent).toMatch(/@Directive_1\(\)\s+export class MyLibrarySharedBaseClass/);
     });

  it('should add @Directive to undecorated classes that have @Input', () => {
    writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should not change decorated classes', () => {
    writeFile('/index.ts', `
      import { Input, Component, Directive, Pipe, Injectable } from '@angular/core';

      @Component({})
      export class MyComp {
        @Input() isActive: boolean;
      }
      
      @Directive({selector: 'dir'})
      export class MyDir {
        @Input() isActive: boolean;
      }

      @Injectable()
      export class MyService {
        ngOnDestroy() {}
      }
      
      @Pipe({name: 'my-pipe'})
      export class MyPipe {
        ngOnDestroy() {}
      }
    `);

    runTSLint(true);
    const content = getFile('/index.ts');
    expect(content).toMatch(/@Component\({}\)\s+export class MyComp {/);
    expect(content).toMatch(/@Directive\({selector: 'dir'}\)\s+export class MyDir {/);
    expect(content).toMatch(/@Injectable\(\)\s+export class MyService {/);
    expect(content).toMatch(/@Pipe\({name: 'my-pipe'}\)\s+export class MyPipe {/);
    expect(content).not.toContain('TODO');
  });

  it('should add @Directive to undecorated classes that have @Output', () => {
    writeFile('/index.ts', `
      import { Output, EventEmitter } from '@angular/core';

      export class Base {
        @Output() clicked = new EventEmitter<void>();
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a host binding', () => {
    writeFile('/index.ts', `
      import { HostBinding } from '@angular/core';

      export class Base {
        @HostBinding('attr.id')
        get id() {
          return 'id-' + Date.now();
        }
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a host listener', () => {
    writeFile('/index.ts', `
      import { HostListener } from '@angular/core';

      export class Base {
        @HostListener('keydown')
        handleKeydown() {
          console.log('Key has been pressed');
        }
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ViewChild query', () => {
    writeFile('/index.ts', `
      import { ViewChild, ElementRef } from '@angular/core';

      export class Base {
        @ViewChild('button') button: ElementRef<HTMLElement>;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ViewChildren query', () => {
    writeFile('/index.ts', `
      import { ViewChildren, ElementRef } from '@angular/core';

      export class Base {
        @ViewChildren('button') button: ElementRef<HTMLElement>;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ContentChild query', () => {
    writeFile('/index.ts', `
      import { ContentChild, ElementRef } from '@angular/core';

      export class Base {
        @ContentChild('button') button: ElementRef<HTMLElement>;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ContentChildren query', () => {
    writeFile('/index.ts', `
      import { ContentChildren, ElementRef } from '@angular/core';

      export class Base {
        @ContentChildren('button') button: ElementRef<HTMLElement>;
      }
    `);

    runTSLint(true);
    expect(getFile('/index.ts')).toContain(`@Directive()\nexport class Base {`);
  });

  it('should add @Directive to undecorated derived classes of a migrated class', async () => {
    writeFile('/index.ts', `
      import { Input, Directive, NgModule } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }

      export class DerivedA extends Base {}
      export class DerivedB extends DerivedA {}
      export class DerivedC extends DerivedB {}

      @Directive({selector: 'my-comp'})
      export class MyComp extends DerivedC {}

      export class MyCompWrapped extends MyComp {}

      @NgModule({declarations: [MyComp, MyCompWrapped]})
      export class AppModule {}
    `);

    runTSLint(true);
    const fileContent = getFile('/index.ts');
    expect(fileContent).toContain(`import { Input, Directive, NgModule } from '@angular/core';`);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class Base/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedA/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedB/);
    expect(fileContent).toMatch(/@Directive\(\)\s+export class DerivedC/);
    expect(fileContent).toMatch(/}\s+@Directive\(\{selector: 'my-comp'}\)\s+export class MyComp/);
    expect(fileContent).toMatch(/}\s+export class MyCompWrapped/);
  });
});
