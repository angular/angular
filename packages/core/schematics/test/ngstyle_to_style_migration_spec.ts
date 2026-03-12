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

describe('NgStyle migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {path?: string; bestEffortMode?: boolean}) {
    return runner.runSchematic('ngstyle-to-style', options, tree);
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
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="{'background': 'red'}">
            <p>it works</p>
          </div>
        \` })
        export class Cmp {}
      `,
    );

    await runMigration();

    const content = tree.readContent('/app.component.ts');

    expect(content).toContain(`<div [style.background]="'red'">`);
  });

  describe('No change cases', () => {
    it('should not change static HTML elements', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
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

    it('should not change existing [style] bindings', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';

        @Component({
        template: \`
          <div [style.color]="isError ? 'red' : 'green'"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [style.color]="isError ? 'red' : 'green'"></div>`);
    });

    it('should remove ngStyle with empty object', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="{}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div ></div>');
    });

    it('should remove ngStyle with empty string', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="{'': condition}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain('<div ></div>');
    });

    it('should not migrate a simple object reference without option', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="customObject"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`<div [ngStyle]="customObject"></div>`);
    });

    it('should not migrate a shorthand assignment', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="{background}"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`<div [ngStyle]="{background}"></div>`);
    });
  });

  describe('Simple ngStyle object migrations', () => {
    it('should migrate single key object literals', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="{ color: isError ? 'red' : 'green' }"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');
      expect(content).toContain(`<div [style.color]="isError ? 'red' : 'green'"></div>`);
    });
  });

  describe('Complex and multi-element migrations', () => {
    it('should migrate multi-keys literals', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="{ 'color': 'blue', 'font-weight': 'bold' }"></div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`<div [style]="{ 'color': 'blue', 'font-weight': 'bold' }">`);
    });
  });

  describe('Import array management', () => {
    it('should keep imports array when NgStyle is removed but other imports remain', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [NgStyle, NgFor, NgIf],
        template: \`
          <div [ngStyle]="{'background': 'red'}">
            <p *ngFor="let item of items">{{item}}</p>
          </div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`<div [style.background]="'red'">`);
      expect(content).toContain('imports: [NgFor, NgIf]');
      expect(content).not.toContain('NgStyle');
      expect(content).toContain("import {NgFor, NgIf} from '@angular/common';");
    });

    it('should remove NgStyle from middle of imports array', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [NgFor, NgStyle, NgIf],
        template: \`
          <div [ngStyle]="{'background': 'red'}">
            <p *ngFor="let item of items">{{item}}</p>
          </div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain('imports: [NgFor, NgIf]');
    });

    it('should remove NgStyle from end of imports array', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [NgFor, NgIf, NgStyle],
        template: \`
          <div [ngStyle]="{'background': 'red'}">
            <p *ngFor="let item of items">{{item}}</p>
          </div>
        \` })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain('imports: [NgFor, NgIf]');
    });

    it('should handle multiline imports array formatting', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle, NgFor, NgIf} from '@angular/common';
        @Component({
        imports: [
          NgFor,
          NgStyle,
          NgIf
        ],
        template: \`
          <div [ngStyle]="{'background': 'red'}">
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
      expect(content).not.toContain('NgStyle');
    });

    it('should remove imports and trailing comma with only ngStyle imported', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';

        @Component({
        imports: [NgStyle],
        template: \`<div [ngStyle]="{'background': 'red'}"></div>\`
        })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`@Component({
        template: \`<div [style.background]="'red'"></div>\`
        })
        export class Cmp {}`);
    });

    it('should migrate when NgStyle is provided by CommonModule', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';
        @Component({
          imports: [CommonModule],
          template: \`
            <div [ngStyle]="{'background': 'red'}">
              <p>{{item}}</p>
            </div>
          \`
        })
        export class Cmp {}
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(`<div [style.background]="'red'">`);
      expect(content).not.toContain('imports: [CommonModule]');
      expect(content).not.toContain("import {CommonModule} from '@angular/common';");
    });

    it('should migrate when NgStyle is provided by CommonModule but not remove CommonModule', async () => {
      writeFile(
        '/app.component.ts',
        `
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';
        @Component({
          imports: [CommonModule],
          template: \`
            <div *ngIf='condition' [ngStyle]="{'background': 'red'}">
              <p>{{item}}</p>
            </div>
          \`
        })
        export class Cmp {
          condition = true;
        }
      `,
      );

      await runMigration();

      const content = tree.readContent('/app.component.ts');

      expect(content).toContain(` <div *ngIf='condition' [style.background]="'red'">`);
      expect(content).toContain('imports: [CommonModule]');
      expect(content).toContain("import {CommonModule} from '@angular/common';");
    });
  });
});

describe('NgStyle migration bestEffortMode option', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(options?: {path?: string; bestEffortMode?: boolean}) {
    return runner.runSchematic('ngstyle-to-style', options, tree);
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

  it('should migrate a simple object reference', async () => {
    writeFile(
      '/app.component.ts',
      `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="styleObject"></div>
        \` })
        export class Cmp {}
      `,
    );

    await runMigration({bestEffortMode: true});

    const content = tree.readContent('/app.component.ts');

    expect(content).toContain(`<div [style]="styleObject"></div>`);
  });

  it('should migrate a more complex object reference', async () => {
    writeFile(
      '/app.component.ts',
      `
        import {Component} from '@angular/core';
        import {NgStyle} from '@angular/common';
        @Component({
        imports: [NgStyle],
        template: \`
          <div [ngStyle]="isActive ? stylesA : stylesB"></div>
        \` })
        export class Cmp {}
      `,
    );

    await runMigration({bestEffortMode: true});

    const content = tree.readContent('/app.component.ts');

    expect(content).toContain(`<div [style]="isActive ? stylesA : stylesB"></div>`);
  });
});
