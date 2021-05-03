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

describe('move-document migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

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

  describe('move-document', () => {
    it('should properly apply import replacement', async () => {
      writeFile('/index.ts', `
        import {DOCUMENT} from '@angular/platform-browser';
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(`import { DOCUMENT } from "@angular/common";`);
      expect(content).not.toContain(`import {DOCUMENT} from '@angular/platform-browser';`);
    });

    it('should properly apply import replacement (BOM)', async () => {
      writeFile('/index.ts', `\uFEFF
        import {DOCUMENT} from '@angular/platform-browser';
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(`import { DOCUMENT } from "@angular/common";`);
      expect(content).not.toContain(`import {DOCUMENT} from '@angular/platform-browser';`);
    });

    it('should properly apply import replacement with existing import', async () => {
      writeFile('/index.ts', `
        import {DOCUMENT} from '@angular/platform-browser';
        import {someImport} from '@angular/common';
      `);

      writeFile('/reverse.ts', `
        import {someImport} from '@angular/common';
        import {DOCUMENT} from '@angular/platform-browser';
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');
      const contentReverse = tree.readContent('/reverse.ts');

      expect(content).toContain(`import { someImport, DOCUMENT } from '@angular/common';`);
      expect(content).not.toContain(`import {DOCUMENT} from '@angular/platform-browser';`);

      expect(contentReverse).toContain(`import { someImport, DOCUMENT } from '@angular/common';`);
      expect(contentReverse).not.toContain(`import {DOCUMENT} from '@angular/platform-browser';`);
    });

    it('should properly apply import replacement with existing import w/ comments', async () => {
      writeFile('/index.ts', `
        /**
         * this is a comment
         */
        import {someImport} from '@angular/common';
        import {DOCUMENT} from '@angular/platform-browser';
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(`import { someImport, DOCUMENT } from '@angular/common';`);
      expect(content).not.toContain(`import {DOCUMENT} from '@angular/platform-browser';`);

      expect(content).toMatch(/.*this is a comment.*/);
    });

    it('should properly apply import replacement with existing and redundant imports', async () => {
      writeFile('/index.ts', `
        import {DOCUMENT} from '@angular/platform-browser';
        import {anotherImport} from '@angular/platform-browser-dynamic';
        import {someImport} from '@angular/common';
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(`import { someImport, DOCUMENT } from '@angular/common';`);
      expect(content).not.toContain(`import {DOCUMENT} from '@angular/platform-browser';`);
    });

    it('should properly apply import replacement with existing import and leave original import',
       async () => {
         writeFile('/index.ts', `
        import {DOCUMENT, anotherImport} from '@angular/platform-browser';
        import {someImport} from '@angular/common';
      `);

         await runMigration();

         const content = tree.readContent('/index.ts');

         expect(content).toContain(`import { someImport, DOCUMENT } from '@angular/common';`);
         expect(content).toContain(`import { anotherImport } from '@angular/platform-browser';`);
       });

    it('should properly apply import replacement with existing import and alias', async () => {
      writeFile('/index.ts', `
        import {DOCUMENT as doc, anotherImport} from '@angular/platform-browser';
        import {someImport} from '@angular/common';
      `);

      await runMigration();

      const content = tree.readContent('/index.ts');

      expect(content).toContain(`import { someImport, DOCUMENT as doc } from '@angular/common';`);
      expect(content).toContain(`import { anotherImport } from '@angular/platform-browser';`);
    });
  });

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematicAsync('migration-v8-move-document', {}, tree).toPromise();
  }
});
