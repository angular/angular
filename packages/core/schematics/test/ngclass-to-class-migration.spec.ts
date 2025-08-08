/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {normalize, virtualFs} from '@angular-devkit/core';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {resolve} from 'path';

describe('ngClass migrator', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {path?: string; migrateSpaceSeparatedKey?: boolean}) {
    return runner.runSchematic('ngclass-to-class', options, tree);
  }

  const collectionJsonPath = resolve('../collection.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    initMockFileSystem('Native');
    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );
  });

  it('should handle a file that is present in multiple projects', async () => {
    writeFile('/tsconfig-2.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          a: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}},
          b: {root: '', architect: {build: {options: {tsConfig: './tsconfig-2.json'}}}},
        },
      }),
    );

    writeFile(
      '/app.component.ts',
      `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/core';
        @Component({ template: \`
          <div [ngClass]="{'admin': isAdmin}">
            <p>it works</p>
          </div>
        \` })
        export class Cmp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/app.component.ts');
    expect(content).toContain('<div [class.admin]="isAdmin">');
  });

  it('should remove NgClass import when no longer needed', async () => {
    writeFile(
      '/app.component.ts',
      `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'admin': isAdmin}">
            <p>it works</p>
          </div>
        \` })
        export class Cmp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/app.component.ts');

    expect(content).toContain('[class.admin]="isAdmin"');
    expect(content).not.toContain("import {NgClass} from '@angular/common';");
  });

  describe('No change cases', () => {
    it('should not change static HTML elements', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <button id="123"></button>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<button id="123"></button>');
    });

    it('should not change existing [class] bindings', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [class.active]="isActive"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div [class.active]="isActive"></div>');
    });

    it('should change empty ngClass binding', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div [class]=""></div>');
    });

    it('should not change ngClass with empty string key', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'': condition}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div [class]=""></div>');
    });

    it('should change ngClass with empty array', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="[]"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div [class]=""></div>');
    });
  });

  describe('Simple ngClass object migrations', () => {
    it('should migrate single condition', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'active': isActive}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div [class.active]="isActive"></div>');
    });

    it('should migrate a binded object with multiple keys to class bindings', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'class1': condition1, 'class2': condition2}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`@Component({ template: \`
          <div [class]="{'class1': condition1, 'class2': condition2}"></div>
        \` })
      `);
    });

    it('should migrate quoted class names for multiple conditions', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'admin-panel': isAdmin, 'user-dense': isDense}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(
        `<div [class]="{'admin-panel': isAdmin, 'user-dense': isDense}"></div>`,
      );
    });

    it('should migrate single condition', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div ngClass="foo"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div class="foo"></div>`);
    });
  });

  describe('Complex and multi-element migrations', () => {
    it('should migrate complex object literals with mixed class keys to [class] binding', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'class1 class2': condition, 'class3': anotherCondition}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(
        `<div [class]="{'class1 class2': condition, 'class3': anotherCondition}"></div>`,
      );
    });

    it('should migrate keys with extra whitespace for multiple conditions', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'  class1  ': condition, 'class2': anotherCondition}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(
        `<div [class]="{'  class1  ': condition, 'class2': anotherCondition}"></div>`,
      );
    });

    it('should migrate multiple ngClass bindings across multiple elements', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'class1': condition1, 'class2': condition2}"></div>
          <div [ngClass]="{'class3': condition3}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`@Component({ template: \`
          <div [class]="{'class1': condition1, 'class2': condition2}"></div>
          <div [class.class3]="condition3"></div>
        \` })
      `);
    });
  });

  describe('Non-migratable and edge cases', () => {
    it('should not migrate invalid object literal syntax', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{foo isActive}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [ngClass]="{foo isActive}"></div>`);
    });

    it('should not migrate string literal class list', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="'class1 class2'"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [ngClass]="'class1 class2'"></div>`);
    });

    it('should not migrate dynamic variable bindings', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="dynamicClassObject"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [ngClass]="dynamicClassObject"></div>`);
    });

    it('should not migrate function call bindings', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="getClasses()"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [ngClass]="getClasses()"></div>`);
    });
  });

  it('should not migrate key separated with space', async () => {
    writeFile(
      '/app.component.ts',
      `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'class1 class2': condition}"></div>
        \` })
        export class Cmp {}
      `,
    );

    await runMigration({migrateSpaceSeparatedKey: false});

    const content = tree.readContent('/app.component.ts');

    expect(content).toContain(`<div [ngClass]="{'class1 class2': condition}"></div>`);
  });
});

describe('migrateSpaceSeparatedKey option', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {path?: string; migrateSpaceSeparatedKey?: boolean}) {
    return runner.runSchematic('ngclass-to-class', options, tree);
  }

  const collectionJsonPath = resolve('../collection.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', collectionJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    initMockFileSystem('Native');
    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );
  });

  it('should split and migrate multiple classes in one key', async () => {
    writeFile(
      '/app.component.ts',
      `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({ template: \`
          <div [ngClass]="{'class1 class2': condition}"></div>
        \` })
        export class Cmp {}
      `,
    );

    await runMigration({migrateSpaceSeparatedKey: true});

    const content = tree.readContent('/app.component.ts');

    expect(content).toContain(`<div [class.class1]="condition" [class.class2]="condition"></div>`);
  });
});
