/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as shx from 'shelljs';

describe('Undecorated classes with decorated fields migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));

    writeFile('/tsconfig.json', JSON.stringify({compilerOptions: {lib: ['es2015']}}));
    writeFile('/angular.json', JSON.stringify({
      projects: {t: {architect: {build: {options: {tsConfig: './tsconfig.json'}}}}}
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

  it(`should add an import for Directive if there isn't one already`, async() => {
    writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`import { Input, Directive } from '@angular/core';`);
  });

  it('should not change the imports if there is an import for Directive already', async() => {
    writeFile('/index.ts', `
      import { Directive, Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }

      @Directive({})
      export class Child extends Base {
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts'))
        .toContain(`import { Directive, Input } from '@angular/core';`);
  });

  it('should add @Directive to undecorated classes that have @Input', async() => {
    writeFile('/index.ts', `
      import { Input } from '@angular/core';

      export class Base {
        @Input() isActive: boolean;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  it('should not change decorated classes', async() => {
    writeFile('/index.ts', `
      import { Input, Component, Output, EventEmitter } from '@angular/core';

      @Component({})
      export class Base {
        @Input() isActive: boolean;
      }

      export class Child extends Base {
        @Output() clicked = new EventEmitter<void>();
      }
    `);

    await runMigration();
    const content = tree.readContent('/index.ts');
    expect(content).toContain(
        `import { Input, Component, Output, EventEmitter, Directive } from '@angular/core';`);
    expect(content).toContain(`@Component({})\n      export class Base {`);
    expect(content).toContain(`@Directive({})\nexport class Child extends Base {`);
  });

  it('should add @Directive to undecorated classes that have @Output', async() => {
    writeFile('/index.ts', `
      import { Output, EventEmitter } from '@angular/core';

      export class Base {
        @Output() clicked = new EventEmitter<void>();
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a host binding', async() => {
    writeFile('/index.ts', `
      import { HostBinding } from '@angular/core';

      export class Base {
        @HostBinding('attr.id')
        get id() {
          return 'id-' + Date.now();
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a host listener', async() => {
    writeFile('/index.ts', `
      import { HostListener } from '@angular/core';

      export class Base {
        @HostListener('keydown')
        handleKeydown() {
          console.log('Key has been pressed');
        }
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ViewChild query', async() => {
    writeFile('/index.ts', `
      import { ViewChild, ElementRef } from '@angular/core';

      export class Base {
        @ViewChild('button', { static: false }) button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ViewChildren query', async() => {
    writeFile('/index.ts', `
      import { ViewChildren, ElementRef } from '@angular/core';

      export class Base {
        @ViewChildren('button') button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ContentChild query', async() => {
    writeFile('/index.ts', `
      import { ContentChild, ElementRef } from '@angular/core';

      export class Base {
        @ContentChild('button', { static: false }) button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  it('should add @Directive to undecorated classes that have a ContentChildren query', async() => {
    writeFile('/index.ts', `
      import { ContentChildren, ElementRef } from '@angular/core';

      export class Base {
        @ContentChildren('button') button: ElementRef<HTMLElement>;
      }
    `);

    await runMigration();
    expect(tree.readContent('/index.ts')).toContain(`@Directive({})\nexport class Base {`);
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner
        .runSchematicAsync('migration-v9-undecorated-classes-with-decorated-fields', {}, tree)
        .toPromise();
  }
});
