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

describe('invalid interpolation migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;
  let logs: string[];

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

    logs = [];
    runner.logger.subscribe(logEntry => {
      logs.push(logEntry.message);
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
    return runner.runSchematicAsync('migration-v12-invalid-interpolations', {}, tree).toPromise();
  }

  it('should fix interpolations with only one terminating brace', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`
          <div>{{ 1 + 2 }</div> {{ 5 + 6 }
        \`;
      })
      class Test {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toBe(`
      import {Component} from '@angular/core';

      @Component({
        template: \`
          <div>{{ '{{' }} 1 + 2 {{ '}' }}</div> {{ '{{' }} 5 + 6 {{ '}' }}
        \`;
      })
      class Test {}
    `);

    expect(logs).toEqual(jasmine.arrayContaining([
      '    index.ts@6:16: {{ 1 + 2 }',
      '    index.ts@6:33: {{ 5 + 6 }',
    ]));
  });

  it('should fix interpolations with interpolations with comment between terminating braces',
     async () => {
       writeFile('/index.ts', `
         import {Component} from '@angular/core';

         @Component({
           template: \`
             {{ 1 + 2 }<!---->} is a literal
             <span>{{ 3 }<!-- so is this one -->}</span>
           \`;
         })
         class Test {}
       `);

       await runMigration();

       expect(tree.readContent('/index.ts')).toBe(`
         import {Component} from '@angular/core';

         @Component({
           template: \`
             {{ '{{' }} 1 + 2 {{ '}}' }} is a literal
             <span>{{ '{{' }} 3 {{ '}}' }}</span>
           \`;
         })
         class Test {}
       `);

       expect(logs).toEqual(jasmine.arrayContaining([
         '    index.ts@6:14: {{ 1 + 2 }<!---->}',
         '    index.ts@7:20: {{ 3 }<!-- so is this one -->}',
       ]));
     });

  it('should fix mixed types of invalid interpolations', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        template: \`
          {{ 1 + 2 }<!---->}
          {{ 1 + 2 }
        \`;
      })
      class Test {}

      @Component({
        template: \`
          {{ 1 + 2 }<!---->}
          {{ 1 + 2 }
        \`;
      })
      class Test2 {}
    `);

    await runMigration();

    expect(tree.readContent('/index.ts')).toBe(`
      import {Component} from '@angular/core';

      @Component({
        template: \`
          {{ '{{' }} 1 + 2 {{ '}}' }}
          {{ '{{' }} 1 + 2 {{ '}' }}
        \`;
      })
      class Test {}

      @Component({
        template: \`
          {{ '{{' }} 1 + 2 {{ '}}' }}
          {{ '{{' }} 1 + 2 {{ '}' }}
        \`;
      })
      class Test2 {}
    `);
  });

  it('should not replace valid interpolations', async () => {
    const contents = `
      import {Component} from '@angular/core';

      @Component({
        template: \`
          {{ 1 + 2 }}
          <span>{{ 3 }} or {{ '{' + "a" + '}' }}</span> or {{ "{{" + "b" + "}}" }}
        \`;
      })
      class Test {}
    `;
    writeFile('/index.ts', contents);

    await runMigration();

    expect(tree.readContent('/index.ts')).toBe(contents);
  });

  it('should fix invalid interpolations in external templates', async () => {
    writeFile('/index.ts', `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './template.html',
      })
      class Test {}
    `);
    writeFile('/template.html', `
      <span>{{ 'Hello' }}</span>
      {{ 1 + 2 }<!---->}
      {{ 1 + 2 }
    `);

    await runMigration();

    expect(tree.readContent('/template.html')).toBe(`
      <span>{{ 'Hello' }}</span>
      {{ '{{' }} 1 + 2 {{ '}}' }}
      {{ '{{' }} 1 + 2 {{ '}' }}
    `);
  });
});
