/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {normalize, virtualFs} from '@angular-devkit/core';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {resolve} from 'path';

describe('NgClass migration', () => {
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
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
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
    expect(content).not.toContain('imports:');
  });

  describe('No change cases', () => {
    it('should not change static HTML elements', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
          <div [ngClass]="{'': condition}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div [class]=""></div>');
    });

    it('should migrate string literal values in object syntax', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
          imports: [NgClass],
          template: \`
            <div [ngClass]="{foo: 'bar'}"></div>
          \`
        })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [class.foo]="'bar'"></div>`);
    });

    it('should change ngClass with empty array', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
          <div [ngClass]="[]"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div [class]=""></div>');
    });

    it('should not split and migrate multiple classes in one key without option', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
          <div [ngClass]="{'class1 class2': condition}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`<div [ngClass]="{'class1 class2': condition}"></div>`);
    });
  });

  describe('Simple ngClass object migrations', () => {
    it('should migrate single condition', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
          <div [ngClass]="{'class1': condition1, 'class2': condition2}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(
        `<div [class]="{'class1': condition1, 'class2': condition2}"></div>`,
      );
    });

    it('should migrate quoted class names for multiple conditions', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
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

    it('should migrate single condition with ngClass not binding', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
          <div ngClass="foo"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div class="foo"></div>`);
    });

    it('should migrate single condition with ngClass binding', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
          <div [ngClass]="{foo}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain('<div [class.foo]="foo"></div>');
    });
  });

  describe('Complex and multi-element migrations', () => {
    it('should migrate complex object literals with mixed class keys to [class] binding', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
          <div [ngClass]="{'class1': condition1, 'class2': condition2}"></div>
          <div [ngClass]="{'class3': condition3}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`
          <div [class]="{'class1': condition1, 'class2': condition2}"></div>
          <div [class.class3]="condition3"></div>
      `);
    });
  });

  describe('Import array management', () => {
    it('should keep imports array when NgClass is removed but other imports remain', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [NgClass, NgFor, NgIf],
        template: \`
          <div [ngClass]="{'admin': isAdmin}">
            <p *ngFor="let item of items">{{item}}</p>
          </div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain('[class.admin]="isAdmin"');
      expect(content).toContain('imports: [NgFor, NgIf]');
      expect(content).not.toContain('NgClass');
      expect(content).toContain("import {NgFor, NgIf} from '@angular/common';");
    });

    it('should remove NgClass from middle of imports array', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [NgFor, NgClass, NgIf],
        template: \`
          <div [ngClass]="{'admin': isAdmin}">
            <p *ngFor="let item of items">{{item}}</p>
          </div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain('imports: [NgFor, NgIf]');
      expect(content).not.toContain('imports: [NgFor, , NgIf]'); // No double comma
    });

    it('should remove NgClass from end of imports array', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [NgFor, NgIf, NgClass],
        template: \`
          <div [ngClass]="{'admin': isAdmin}">
            <p *ngFor="let item of items">{{item}}</p>
          </div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain('imports: [NgFor, NgIf]');
      expect(content).not.toContain('imports: [NgFor, NgIf,]'); // No trailing comma
    });

    it('should handle multiline imports array formatting', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [
          NgFor,
          NgClass,
          NgIf
        ],
        template: \`
          <div [ngClass]="{'admin': isAdmin}">
            <p *ngFor="let item of items">{{item}}</p>
          </div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain('imports: [');
      expect(content).toContain('NgFor,');
      expect(content).toContain('NgIf');
      expect(content).not.toContain('NgClass');
    });

    it('should remove imports and trailing comma with only ngClass imported', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';

        @Component({
        imports: [NgClass],
        template: \`<div [ngClass]="{'admin': isAdmin}"></div>\`
        })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`@Component({
        template: \`<div [class.admin]="isAdmin"></div>\`
        })
        export class Cmp {}`);
    });

    it('should migrate when NgClass is provided by CommonModule', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';
        @Component({
          standalone: true,
          imports: [CommonModule],
          template: \`
            <div [ngClass]="{'admin': isAdmin, dense: density === 'high'}">
              <p>{{item}}</p>
            </div>
          \`
        })
        export class Cmp {
          isAdmin = true;
        }
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`[class]="{'admin': isAdmin, dense: density === 'high'}"`);
      expect(content).toContain('imports: [CommonModule]');
      expect(content).toContain("import {CommonModule} from '@angular/common';");
    });
  });

  describe('Non-migratable and edge cases', () => {
    it('should not migrate invalid object literal syntax', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
          <div [ngClass]="getClasses()"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [ngClass]="getClasses()"></div>`);
    });

    it('should not migrate when NgClass import is missing', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        @Component({
        template: \`
          <div [ngClass]="{'active': isActive, 'disabled': !isEnabled}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(
        `<div [ngClass]="{'active': isActive, 'disabled': !isEnabled}"></div>`,
      );
      expect(content).not.toContain(`[class.active]`);
      expect(content).not.toContain(`[class.disabled]`);
    });

    it('should not migrate when NgClass not binding import is missing', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        @Component({
        template: \`
          <div ngClass="foo"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div ngClass="foo"></div>`);
      expect(content).not.toContain(`[class.foo]`);
    });
  });

  it('should not migrate key separated with space', async () => {
    writeFile(
      '/app.component.ts',
      `
        import {Component} from '@angular/core';
        import {NgClass} from '@angular/common';
        @Component({
        imports: [NgClass],
        template: \`
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
        @Component({
        imports: [NgClass],
        template: \`
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
