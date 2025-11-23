/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'path';
import {rmSync} from 'node:fs';

import {dedent} from './helpers';

// Helper function to check if imports array contains specific imports
function expectImportsToContain(content: string, ...importNames: string[]): void {
  // Match imports: [ ... ] including multiline with any whitespace
  const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
  expect(importsMatch).toBeTruthy();
  const importsArray = importsMatch![1];

  for (const importName of importNames) {
    expect(importsArray).toContain(importName);
  }
}

// Helper function to check import declarations with flexible formatting
function expectImportDeclarationToContain(content: string, ...importNames: string[]): void {
  // Create individual patterns for each import name with flexible spacing
  const sortedImports = importNames
    .sort()
    .map((name) => `\\s*${name}\\s*`)
    .join(',');
  // Create regex pattern that matches import with flexible spacing: import { NgIf } or import {NgIf}
  const importPattern = new RegExp(
    `import\\s*\\{${sortedImports}\\}\\s*from\\s*['"]@angular\\/common['"]`,
  );
  expect(content).toMatch(importPattern);
}

describe('Common → standalone imports migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;
  let previousWorkingDir: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration(path?: string, dryRun = false) {
    return runner.runSchematic('common-to-standalone-migration', {path, dryRun}, tree);
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

    previousWorkingDir = process.cwd();
    tmpDirPath = getSystemPath(host.root);

    // Switch into the temporary directory path. This allows us to run
    // the schematic against our custom unit test tree.
    process.chdir(tmpDirPath);
  });

  afterEach(() => {
    process.chdir(previousWorkingDir);
    rmSync(tmpDirPath, {recursive: true});
  });

  describe('NgIf directive', () => {
    it('should migrate NgIf in external template', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-test',
          imports: [CommonModule],
          templateUrl: './comp.html'
        })
        export class TestComponent {
          show = true;
        }
      `,
      );

      writeFile(
        '/comp.html',
        dedent`
        <div *ngIf="show">
          Content shown conditionally
        </div>
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgIf');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgIf');
    });

    it('should migrate NgIf in inline template', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-test',
          imports: [CommonModule],
          template: \`<div *ngIf="visible">Hello</div>\`
        })
        export class TestComponent {
          visible = false;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgIf');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgIf');
    });
  });

  describe('NgFor directive', () => {
    it('should migrate NgFor with trackBy', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-list',
          imports: [CommonModule],
          template: \`
            <div *ngFor="let item of items; trackBy: trackByFn">
              {{ item.name }}
            </div>
          \`
        })
        export class ListComponent {
          items = [{name: 'Item 1'}, {name: 'Item 2'}];
          
          trackByFn(index: number, item: any) {
            return item.id;
          }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgFor');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgFor');
    });
  });

  describe('NgSwitch directives', () => {
    it('should migrate NgSwitch with case and default', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-switch',
          imports: [CommonModule],
          template: \`
            <div [ngSwitch]="condition">
              <p *ngSwitchCase="'A'">Case A</p>
              <p *ngSwitchCase="'B'">Case B</p>
              <p *ngSwitchDefault>Default case</p>
            </div>
          \`
        })
        export class SwitchComponent {
          condition = 'A';
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgSwitch', 'NgSwitchCase', 'NgSwitchDefault');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgSwitch', 'NgSwitchCase', 'NgSwitchDefault');
    });

    it('should migrate ngSwitchCase and ngSwitchDefault without asterisk (attribute directives)', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-switch-attr',
          imports: [CommonModule],
          template: \`
            <p ngSwitch="status">
              <span ngSwitchCase="'ok'">OK</span>
              <span ngSwitchCase="'warn'">Warn</span>
              <span ngSwitchDefault>Unknown</span>
            </p>
          \`
        })
        export class SwitchAttrComponent {
          status = 'ok';
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgSwitch', 'NgSwitchCase', 'NgSwitchDefault');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgSwitch', 'NgSwitchCase', 'NgSwitchDefault');
    });

    it('should migrate ngSwitchCase and ngSwitchDefault with ng-template', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-switch-template',
          imports: [CommonModule],
          template: \`
            <div [ngSwitch]="mode">
              <ng-template ngSwitchCase="'edit'">Edit mode</ng-template>
              <ng-template ngSwitchCase="'view'">View mode</ng-template>
              <ng-template ngSwitchDefault>Default mode</ng-template>
            </div>
          \`
        })
        export class SwitchTemplateComponent {
          mode = 'edit';
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgSwitch', 'NgSwitchCase', 'NgSwitchDefault');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgSwitch', 'NgSwitchCase', 'NgSwitchDefault');
    });
  });

  describe('NgPlural directives', () => {
    it('should migrate ngPluralCase with ng-template', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-plural-template',
          imports: [CommonModule],
          template: \`
            <ng-container [ngPlural]="count">
              <ng-template ngPluralCase="=0">There are no items (case =0).</ng-template>
              <ng-template ngPluralCase="=1">There is one item (case =1).</ng-template>
              <ng-template ngPluralCase="other">There are {{ count }} items (other).</ng-template>
            </ng-container>
          \`
        })
        export class PluralTemplateComponent {
          count = 5;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgPlural', 'NgPluralCase');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgPlural', 'NgPluralCase');
    });

    it('should migrate ngPluralCase with div elements', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-plural-div',
          imports: [CommonModule],
          template: \`
            <div [ngPlural]="messageCount">
              <div ngPluralCase="=0">No messages</div>
              <div ngPluralCase="=1">One message</div>
              <div ngPluralCase="few">Few messages</div>
              <div ngPluralCase="many">Many messages</div>
              <div ngPluralCase="other">{{ messageCount }} messages</div>
            </div>
          \`
        })
        export class PluralDivComponent {
          messageCount = 3;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgPlural', 'NgPluralCase');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgPlural', 'NgPluralCase');
    });

    it('should migrate ngPluralCase with various HTML elements', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-plural-mixed',
          imports: [CommonModule],
          template: \`
            <section [ngPlural]="itemCount">
              <p ngPluralCase="=0">Empty basket</p>
              <span ngPluralCase="=1">Single item</span>
              <article ngPluralCase="other">Multiple items: {{ itemCount }}</article>
            </section>
          \`
        })
        export class PluralMixedComponent {
          itemCount = 0;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgPlural', 'NgPluralCase');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgPlural', 'NgPluralCase');
    });
  });

  describe('NgClass directive', () => {
    it('should migrate ngClass attribute binding', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-class',
          imports: [CommonModule],
          template: \`<div [ngClass]="{ active: isActive, disabled: !enabled }">Content</div>\`
        })
        export class ClassComponent {
          isActive = true;
          enabled = false;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgClass');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgClass');
    });
  });

  describe('NgStyle directive', () => {
    it('should migrate ngStyle attribute binding', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-style',
          imports: [CommonModule],
          template: \`<div [ngStyle]="{ color: textColor, fontSize: fontSize + 'px' }">Styled content</div>\`
        })
        export class StyleComponent {
          textColor = 'red';
          fontSize = 14;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgStyle');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgStyle');
    });
  });

  describe('Template outlet directives', () => {
    it('should migrate NgTemplateOutlet with context', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-outlet',
          imports: [CommonModule],
          template: \`
            <ng-container [ngTemplateOutlet]="templateRef" [ngTemplateOutletContext]="{data: myData}"></ng-container>
            <ng-template #templateRef let-data="data">{{ data }}</ng-template>
          \`
        })
        export class OutletComponent {
          myData = 'Hello World';
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgTemplateOutlet');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgTemplateOutlet');
    });

    it('should migrate NgComponentOutlet', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-dynamic',
          imports: [CommonModule],
          template: \`<ng-container [ngComponentOutlet]="dynamicComponent"></ng-container>\`
        })
        export class DynamicComponent {
          dynamicComponent: any;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgComponentOutlet');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgComponentOutlet');
    });

    it('should migrate NgComponentOutlet with structural directive syntax', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-dynamic-structural',
          imports: [CommonModule],
          template: \`<ng-container *ngComponentOutlet="dynamicComponent"></ng-container>\`
        })
        export class DynamicStructuralComponent {
          dynamicComponent: any;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgComponentOutlet');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgComponentOutlet');
    });

    it('should migrate both NgTemplateOutlet and NgComponentOutlet with mixed syntax', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-mixed-outlets',
          imports: [CommonModule],
          template: \`
            <ng-container *ngTemplateOutlet="template1"></ng-container>
            <ng-container [ngTemplateOutlet]="template2"></ng-container>
            <ng-container *ngComponentOutlet="component1"></ng-container>
            <ng-container [ngComponentOutlet]="component2"></ng-container>
          \`
        })
        export class MixedOutletsComponent {
          template1: any;
          template2: any;
          component1: any;
          component2: any;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgTemplateOutlet', 'NgComponentOutlet');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'NgComponentOutlet', 'NgTemplateOutlet');
    });
  });

  describe('Pipes', () => {
    it('should migrate AsyncPipe in interpolation', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';
        import {Observable, of} from 'rxjs';

        @Component({
          selector: 'app-async',
          imports: [CommonModule],
          template: \`<div>{{ data$ | async }}</div>\`
        })
        export class AsyncComponent {
          data$ = of('Async data');
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'AsyncPipe');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'AsyncPipe');
    });

    it('should migrate multiple pipes: date, currency, decimal, percent', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-pipes',
          imports: [CommonModule],
          template: \`
            <div>{{ now | date:'short' }}</div>
            <div>{{ price | currency:'USD':'symbol':'1.2-2' }}</div>
            <div>{{ value | number:'1.0-2' }}</div>
            <div>{{ ratio | percent }}</div>
          \`
        })
        export class PipesComponent {
          now = new Date();
          price = 123.45;
          value = 3.14159;
          ratio = 0.85;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'CurrencyPipe', 'DatePipe', 'DecimalPipe', 'PercentPipe');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(
        content,
        'CurrencyPipe',
        'DatePipe',
        'DecimalPipe',
        'PercentPipe',
      );
    });

    it('should migrate text transform pipes', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-text',
          imports: [CommonModule],
          template: \`
            <div>{{ text | lowercase }}</div>
            <div>{{ text | uppercase }}</div>
            <div>{{ text | titlecase }}</div>
          \`
        })
        export class TextComponent {
          text = 'Hello World';
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'LowerCasePipe', 'TitleCasePipe', 'UpperCasePipe');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'LowerCasePipe', 'TitleCasePipe', 'UpperCasePipe');
    });

    it('should migrate slice and keyvalue pipes', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-utility',
          imports: [CommonModule],
          template: \`
            <div>{{ items | slice:1:3 }}</div>
            <div *ngFor="let item of obj | keyvalue">{{ item.key }}: {{ item.value }}</div>
          \`
        })
        export class UtilityComponent {
          items = [1, 2, 3, 4, 5];
          obj = { a: 1, b: 2, c: 3 };
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'KeyValuePipe', 'NgFor', 'SlicePipe');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'KeyValuePipe', 'NgFor', 'SlicePipe');
    });

    it('should migrate i18n pipes', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-i18n',
          imports: [CommonModule],
          template: \`
            <div>{{ count | i18nPlural:pluralMap }}</div>
            <div>{{ gender | i18nSelect:genderMap }}</div>
          \`
        })
        export class I18nComponent {
          count = 1;
          gender = 'male';
          pluralMap = { '=0': 'no items', '=1': 'one item', 'other': '# items' };
          genderMap = { 'male': 'he', 'female': 'she', 'other': 'they' };
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'I18nPluralPipe', 'I18nSelectPipe');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'I18nPluralPipe', 'I18nSelectPipe');
    });
  });

  describe('Dont migrate', () => {
    it('when CommonModule dont import from @angular/common', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from 'some-other-package';

        @Component({
          selector: 'app-external',
          imports: [CommonModule],
          template: \`<div *myAwesomeIf="visible">External CommonModule</div>\`
        })
        export class ExternalComponent {
          visible = true;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should preserve CommonModule from external package and not add Angular imports
      expect(content).toContain('CommonModule');
      expect(content).toContain('some-other-package');
      expect(content).not.toContain('@angular/common');
    });

    it('when CommonModule is aliased from external package', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule as ExternalCommon} from 'third-party-lib';

        @Component({
          selector: 'app-aliased',
          imports: [ExternalCommon],
          template: \`<div *ngIf="show">Should not be migrated</div>\`
        })
        export class AliasedComponent {
          show = true;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should preserve aliased CommonModule from external package
      expect(content).toContain('ExternalCommon');
      expect(content).toContain('third-party-lib');
      expect(content).not.toContain('@angular/common');
      expect(content).not.toContain('NgIf');
    });

    it('when no CommonModule is imported at all', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {FormsModule} from '@angular/forms';

        @Component({
          selector: 'app-no-common',
          imports: [FormsModule],
          template: \`<div>No common module features used</div>\`
        })
        export class NoCommonComponent { }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should remain unchanged
      expect(content).toContain('FormsModule');
      expect(content).not.toContain('CommonModule');
      expect(content).not.toContain('@angular/common');
    });

    it('when component has no imports array', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-no-imports',
          template: \`<div>No imports at all</div>\`
        })
        export class NoImportsComponent { }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should remain unchanged
      expect(content).not.toContain('imports:');
      expect(content).not.toContain('@angular/common');
    });

    it('when component is not standalone', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-non-standalone',
          standalone: false,
          template: \`<div *ngIf="show">Non-standalone component</div>\`
        })
        export class NonStandaloneComponent {
          show = true;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should remain unchanged - non-standalone components don't have imports
      expect(content).not.toContain('imports:');
      expect(content).not.toContain('@angular/common');
    });

    it('when CommonModule and external CommonModule coexist', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';
        import {CommonModule as ExternalCommon} from 'external-lib';

        @Component({
          selector: 'app-mixed-common',
          imports: [CommonModule, ExternalCommon],
          template: \`<div *ngIf="visible">{{ value | json }}</div>\`
        })
        export class MixedCommonComponent {
          visible = true;
          value = {test: 'data'};
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should migrate Angular CommonModule but preserve external one
      expect(content).toContain('ExternalCommon');
      expect(content).toContain('external-lib');
      expectImportsToContain(content, 'NgIf', 'JsonPipe');
      expectImportDeclarationToContain(content, 'NgIf', 'JsonPipe');
      // Should not contain the original CommonModule import, only the external alias
      expect(content).not.toContain("import {CommonModule} from '@angular/common'");
    });

    it('when template has Angular patterns but CommonModule is external', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from 'my-custom-lib';

        @Component({
          selector: 'app-patterns-external',
          imports: [CommonModule],
          template: \`
            <div *ngIf="show">Conditional content</div>
            <div *ngFor="let item of items">{{ item | json }}</div>
            <div [ngClass]="classes">Styled content</div>
          \`
        })
        export class PatternsExternalComponent {
          show = true;
          items = [1, 2, 3];
          classes = 'active';
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should NOT add Angular imports since CommonModule is external
      expect(content).toContain('CommonModule');
      expect(content).toContain('my-custom-lib');
      expect(content).not.toContain('@angular/common');
      expect(content).not.toContain('NgIf');
      expect(content).not.toContain('NgFor');
      expect(content).not.toContain('NgClass');
      expect(content).not.toContain('JsonPipe');
    });
  });

  describe('No usage scenarios', () => {
    it('should remove CommonModule when no @angular/common features are used', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-empty',
          imports: [CommonModule],
          template: \`<div>No common features</div>\`
        })
        export class EmptyComponent { }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toMatch(/imports:\s*\[\s*\]/);
      expect(content).not.toContain('CommonModule');
      expect(content).not.toContain('@angular/common');
    });
  });

  describe('Comment preservation', () => {
    it('should preserve comments in imports arrays', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';
        import {FormsModule} from '@angular/forms';

        @Component({
          selector: 'app-comments',
          imports: [
            /* Essential forms */ FormsModule,
            CommonModule, // Common directives and pipes
            // More imports can be added here
          ],
          template: \`<div *ngIf="show">{{ text | uppercase }}</div>\`
        })
        export class CommentsComponent {
          show = true;
          text = 'hello';
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).toContain('/* Essential forms */ FormsModule');
      expectImportsToContain(content, 'NgIf', 'UpperCasePipe');
      expect(content).not.toContain('CommonModule');
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent when run multiple times', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-idempotent',
          imports: [CommonModule],
          template: \`<div *ngIf="show">{{ text | uppercase }}</div>\`
        })
        export class IdempotentComponent {
          show = true;
          text = 'test';
        }
      `,
      );

      // Run migration first time
      await runMigration();
      const firstRun = tree.readContent('/comp.ts');

      // Run migration second time
      await runMigration();
      const secondRun = tree.readContent('/comp.ts');

      expect(firstRun).toBe(secondRun);
      expectImportsToContain(secondRun, 'NgIf', 'UpperCasePipe');
      expect(secondRun).not.toContain('CommonModule');
      expectImportDeclarationToContain(secondRun, 'NgIf', 'UpperCasePipe');
    });
  });

  describe('Edge cases and complex imports', () => {
    it('should handle multiple Angular imports with CommonModule', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule, NgIf, AsyncPipe} from '@angular/common';
        import {FormsModule} from '@angular/forms';

        @Component({
          selector: 'app-mixed-imports',
          imports: [CommonModule, FormsModule],
          template: \`
            <div *ngIf="show">{{ data$ | async }}</div>
            <div *ngFor="let item of items">{{ item | json }}</div>
          \`
        })
        export class MixedImportsComponent {
          show = true;
          data$ = Promise.resolve('test');
          items = [1, 2, 3];
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should remove CommonModule and unused individual imports, add needed ones
      expect(content).not.toContain('CommonModule');
      expect(content).toContain('FormsModule');
      expectImportsToContain(content, 'NgIf', 'AsyncPipe', 'NgFor', 'JsonPipe');
    });

    it('should handle deep import paths correctly', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common/common';

        @Component({
          selector: 'app-deep-import',
          imports: [CommonModule],
          template: \`<div *ngIf="show">Deep import path</div>\`
        })
        export class DeepImportComponent {
          show = true;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should NOT migrate since it's not exactly '@angular/common'
      expect(content).toContain('CommonModule');
      expect(content).toContain('@angular/common/common');
      expect(content).not.toContain('NgIf');
    });

    it('should handle namespace imports', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import * as Common from '@angular/common';

        @Component({
          selector: 'app-namespace',
          imports: [Common.CommonModule],
          template: \`<div *ngIf="show">Namespace import</div>\`
        })
        export class NamespaceComponent {
          show = true;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should NOT migrate namespace imports
      expect(content).toContain('Common.CommonModule');
      expect(content).not.toContain('NgIf');
    });

    it('should handle default imports correctly', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import CommonModule from '@angular/common';

        @Component({
          selector: 'app-default-import',
          imports: [CommonModule],
          template: \`<div *ngIf="show">Default import</div>\`
        })
        export class DefaultImportComponent {
          show = true;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should NOT migrate default imports (CommonModule is not a default export)
      expect(content).toContain('CommonModule');
      expect(content).not.toContain('NgIf');
    });
  });

  describe('Alias handling', () => {
    it('should handle aliased CommonModule import', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule as CM} from '@angular/common';

        @Component({
          selector: 'app-aliased',
          imports: [CM],
          template: \`<div *ngIf="show">Simple test</div>\`
        })
        export class AliasedComponent {
          show = true;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expect(content).not.toContain('CM');
      expect(content).not.toContain('CommonModule');
      expectImportsToContain(content, 'NgIf');
      expectImportDeclarationToContain(content, 'NgIf');
    });

    it('should handle aliased CommonModule import with multiple features', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule as CM} from '@angular/common';

        @Component({
          selector: 'app-complex',
          imports: [CM],
          template: \`
            <div *ngIf="items.length > 0" [ngClass]="containerClass">
              <div *ngFor="let item of items; trackBy: trackByFn" 
                   [ngStyle]="getItemStyle(item)"
                   [class.selected]="item.selected">
                
                <span>{{ item.name | titlecase }}</span>
                <span>{{ item.price | currency:'USD' }}</span>
                <span>{{ item.date | date:'short' }}</span>
                
                <div [ngSwitch]="item.type">
                  <span *ngSwitchCase="'premium'">{{ item.details | json }}</span>
                  <span *ngSwitchCase="'basic'">{{ item.description | slice:0:50 }}</span>
                  <span *ngSwitchDefault>Standard item</span>
                </div>
              </div>
            </div>
          \`
        })
        export class ComplexComponent {
          items: any[] = [];
          containerClass = 'item-container';
          
          trackByFn(index: number, item: any) { return item.id; }
          getItemStyle(item: any) { return {opacity: item.visible ? 1 : 0.5}; }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      const expectedImports = [
        'CurrencyPipe',
        'DatePipe',
        'JsonPipe',
        'NgClass',
        'NgFor',
        'NgIf',
        'NgStyle',
        'NgSwitch',
        'NgSwitchCase',
        'NgSwitchDefault',
        'SlicePipe',
        'TitleCasePipe',
      ];
      expect(content).not.toContain('CM');
      expect(content).not.toContain('CommonModule');
      expectImportsToContain(content, ...expectedImports);
      expectImportDeclarationToContain(content, ...expectedImports);
    });
  });

  describe('Mixed scenarios', () => {
    it('should handle complex template with multiple features', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-complex',
          imports: [CommonModule],
          template: \`
            <div *ngIf="items.length > 0" [ngClass]="containerClass">
              <div *ngFor="let item of items; trackBy: trackByFn" 
                   [ngStyle]="getItemStyle(item)"
                   [class.selected]="item.selected">
                
                <span>{{ item.name | titlecase }}</span>
                <span>{{ item.price | currency:'USD' }}</span>
                <span>{{ item.date | date:'short' }}</span>
                
                <div [ngSwitch]="item.type">
                  <span *ngSwitchCase="'premium'">{{ item.details | json }}</span>
                  <span *ngSwitchCase="'basic'">{{ item.description | slice:0:50 }}</span>
                  <span *ngSwitchDefault>Standard item</span>
                </div>
              </div>
            </div>
          \`
        })
        export class ComplexComponent {
          items: any[] = [];
          containerClass = 'item-container';
          
          trackByFn(index: number, item: any) { return item.id; }
          getItemStyle(item: any) { return {opacity: item.visible ? 1 : 0.5}; }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should import all used features in imports array
      const expectedImports = [
        'CurrencyPipe',
        'DatePipe',
        'JsonPipe',
        'NgClass',
        'NgFor',
        'NgIf',
        'NgStyle',
        'NgSwitch',
        'NgSwitchCase',
        'NgSwitchDefault',
        'SlicePipe',
        'TitleCasePipe',
      ];

      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, ...expectedImports);
    });

    it('should handle mixed ngSwitch and ngPlural patterns in same template', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-mixed-patterns',
          imports: [CommonModule],
          template: \`
            <!-- Structural directive variations -->
            <div [ngSwitch]="status">
              <p *ngSwitchCase="'active'">Currently active</p>
              <p *ngSwitchCase="'inactive'">Currently inactive</p>
              <p *ngSwitchDefault>Status unknown</p>
            </div>

            <!-- Attribute directive variations -->
            <section ngSwitch="userType">
              <div ngSwitchCase="'admin'">Admin user</div>
              <div ngSwitchCase="'user'">Regular user</div>
              <div ngSwitchDefault>Guest user</div>
            </section>

            <!-- Template variations -->
            <div [ngSwitch]="viewMode">
              <ng-template ngSwitchCase="'edit'">Edit view</ng-template>
              <ng-template ngSwitchCase="'preview'">Preview view</ng-template>
              <ng-template ngSwitchDefault>Default view</ng-template>
            </div>

            <!-- NgPlural with template -->
            <ng-container [ngPlural]="count">
              <ng-template ngPluralCase="=0">No items found</ng-template>
              <ng-template ngPluralCase="=1">Found one item</ng-template>
              <ng-template ngPluralCase="other">Found {{ count }} items</ng-template>
            </ng-container>

            <!-- NgPlural with elements -->
            <div [ngPlural]="notifications">
              <span ngPluralCase="=0">No notifications</span>
              <span ngPluralCase="=1">One notification</span>
              <span ngPluralCase="other">{{ notifications }} notifications</span>
            </div>
          \`
        })
        export class MixedPatternsComponent {
          status = 'active';
          userType = 'admin';
          viewMode = 'edit';
          count = 5;
          notifications = 3;
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(
        content,
        'NgSwitch',
        'NgSwitchCase',
        'NgSwitchDefault',
        'NgPluralCase',
        'NgPluralCase',
      );
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(
        content,
        'NgPlural',
        'NgPluralCase',
        'NgSwitch',
        'NgSwitchCase',
        'NgSwitchDefault',
      );
    });

    it('should not generate false positives for similar text patterns', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-false-positive',
          imports: [CommonModule],
          template: \`
            <!-- These should NOT trigger directive imports -->
            <div class="ngSwitchCase-like-class">Not a directive</div>
            <span title="This text mentions ngPluralCase but not as directive">Content</span>
            <p>Some content with ngSwitchDefault text</p>
            <div id="ngPluralCase-id">Element with ngPluralCase in id</div>
            <input placeholder="Enter ngSwitchCase value">
            
            <!-- But this SHOULD trigger imports -->
            <div *ngIf="show">{{ value | json }}</div>
          \`
        })
        export class FalsePositiveComponent {
          show = true;
          value = {test: 'data'};
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportsToContain(content, 'NgIf', 'JsonPipe');
      expect(content).not.toContain('CommonModule');

      // Check that the imports array doesn't contain the switch/plural directives
      const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
      expect(importsMatch).toBeTruthy();
      const importsArray = importsMatch![1];
      expect(importsArray).not.toContain('NgSwitchCase');
      expect(importsArray).not.toContain('NgSwitchDefault');
      expect(importsArray).not.toContain('NgPluralCase');

      expectImportDeclarationToContain(content, 'JsonPipe', 'NgIf');
    });

    it('should handle JavaScript strings and comments that contain directive-like text', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-string-patterns',
          imports: [CommonModule],
          template: \`
            <!-- Real directive -->
            <div *ngIf="show">Visible content</div>
            
            <!-- String literals that look like directives (should not be detected) -->
            <div>{{ getDirectiveText('ngForExample') }}</div>
            <span [title]="'Use ngIf for conditionals'">Help text</span>
            <p>Documentation: ngSwitchCase should be used with ngSwitch</p>
            
            <!-- Template variables that look like pipes -->
            <div>{{ async + ' is not a pipe here' }}</div>
            <span>{{ 'date' + ' formatting' }}</span>
          \`
        })
        export class StringPatternsComponent {
          show = true;
          async = 'async-value';
          
          getDirectiveText(directive: string) {
            return 'Use ' + directive + ' directive';
          }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should only import NgIf, not other false positive matches
      expectImportsToContain(content, 'NgIf');
      expect(content).not.toContain('CommonModule');

      const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
      const importsArray = importsMatch![1];
      expect(importsArray).not.toContain('NgFor');
      expect(importsArray).not.toContain('AsyncPipe');
      expect(importsArray).not.toContain('DatePipe');
      expect(importsArray).not.toContain('NgSwitchCase');
    });

    it('should handle multiline templates with embedded expressions', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-multiline',
          imports: [CommonModule],
          template: \`
            <div>
              Simple text without directives
            </div>
            <!-- Real directive spread across lines -->
            <div 
              *ngFor="let item of items; 
                      trackBy: trackByFn;
                      index as i">
              Item {{ i }}: {{ item.name | titlecase }}
            </div>
          \`
        })
        export class MultilineComponent {
          items = [{name: 'test'}];
          
          trackByFn(index: number) { return index; }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should detect the real NgFor and TitleCasePipe
      expectImportsToContain(content, 'NgFor', 'TitleCasePipe');
      expect(content).not.toContain('CommonModule');
    });
  });

  describe('Robustness and edge cases', () => {
    it('should handle very large templates without performance issues', async () => {
      // Generate a large template with many directives
      const largeTemplate = Array.from(
        {length: 100},
        (_, i) =>
          `<div *ngIf="items[${i}]" [ngClass]="getClass(${i})">{{ items[${i}] | json }}</div>`,
      ).join('\n            ');

      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-large',
          imports: [CommonModule],
          template: \`
            ${largeTemplate}
          \`
        })
        export class LargeComponent {
          items = Array.from({length: 100}, (_, i) => \`Item \${i}\`);
          
          getClass(index: number) {
            return index % 2 === 0 ? 'even' : 'odd';
          }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      expectImportDeclarationToContain(content, 'NgIf', 'NgClass', 'JsonPipe');
      expect(content).not.toContain('CommonModule');
      expectImportDeclarationToContain(content, 'JsonPipe', 'NgClass', 'NgIf');
    });

    it('should handle malformed templates gracefully', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-malformed',
          imports: [CommonModule],
          template: \`
            <div *ngIf="show">Valid directive</div>
            <div>{{ value | async }}</div>
          \`
        })
        export class MalformedComponent {
          show = true;
          value = Promise.resolve('test');
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should detect valid patterns
      expectImportsToContain(content, 'NgIf', 'AsyncPipe');

      expect(content).not.toContain('CommonModule');
    });

    it('should handle empty and whitespace-only templates', async () => {
      writeFile(
        '/comp1.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-empty',
          imports: [CommonModule],
          template: \`\`
        })
        export class EmptyComponent { }
      `,
      );

      writeFile(
        '/comp2.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-whitespace',
          imports: [CommonModule],
          template: \`
            
            
            
          \`
        })
        export class WhitespaceComponent { }
      `,
      );

      await runMigration();
      const emptyContent = tree.readContent('/comp1.ts');
      const whitespaceContent = tree.readContent('/comp2.ts');

      // Both should remove CommonModule and have empty imports
      expect(emptyContent).toMatch(/imports:\s*\[\s*\]/);
      expect(emptyContent).not.toContain('CommonModule');
      expect(emptyContent).not.toContain('@angular/common');

      expect(whitespaceContent).toMatch(/imports:\s*\[\s*\]/);
      expect(whitespaceContent).not.toContain('CommonModule');
      expect(whitespaceContent).not.toContain('@angular/common');
    });

    it('should handle complex nested structures with all directive types', async () => {
      writeFile(
        '/comp.ts',
        dedent`
        import {Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'app-complex-nested',
          imports: [CommonModule],
          template: \`
            <div *ngIf="showContainer" [ngClass]="containerClasses">
              <div *ngFor="let category of categories; trackBy: trackCategory">
                <h3>{{ category.name | titlecase }}</h3>
                <div [ngSwitch]="category.type">
                  <div *ngSwitchCase="'items'">
                    <div *ngFor="let item of category.items; index as i">
                      <span [ngClass]="getItemClass(item)">
                        {{ i + 1 }}. {{ item.name | uppercase }}
                      </span>
                      <div [ngPlural]="item.count">
                        <span *ngPluralCase="=0">No items</span>
                        <span *ngPluralCase="=1">One item</span>
                        <span *ngPluralCase="other">{{ item.count }} items</span>
                      </div>
                      <div [ngStyle]="getItemStyle(item)">
                        Price: {{ item.price | currency:'USD' }}
                        Updated: {{ item.lastModified | date:'short' }}
                        Progress: {{ item.progress | percent }}
                      </div>
                    </div>
                  </div>
                  <div *ngSwitchCase="'summary'">
                    <ng-container [ngTemplateOutlet]="summaryTemplate" 
                                  [ngTemplateOutletContext]="{data: category}">
                    </ng-container>
                  </div>
                  <div *ngSwitchDefault>
                    <ng-container [ngComponentOutlet]="category.component">
                    </ng-container>
                  </div>
                </div>
              </div>
            </div>
            
            <ng-template #summaryTemplate let-data="data">
              Summary: {{ data | json }}
            </ng-template>
          \`
        })
        export class ComplexNestedComponent {
          showContainer = true;
          containerClasses = 'main-container';
          categories: any[] = [];
          
          trackCategory(index: number, cat: any) { return cat.id; }
          getItemClass(item: any) { return item.active ? 'active' : 'inactive'; }
          getItemStyle(item: any) { return {backgroundColor: item.color}; }
        }
      `,
      );

      await runMigration();
      const content = tree.readContent('/comp.ts');

      // Should import all used Angular Common features
      const expectedImports = [
        'CurrencyPipe',
        'DatePipe',
        'JsonPipe',
        'NgClass',
        'NgComponentOutlet',
        'NgFor',
        'NgIf',
        'NgPlural',
        'NgPluralCase',
        'NgStyle',
        'NgSwitch',
        'NgSwitchCase',
        'NgSwitchDefault',
        'NgTemplateOutlet',
        'PercentPipe',
        'TitleCasePipe',
        'UpperCasePipe',
      ];

      expect(content).not.toContain('CommonModule');
      expectImportsToContain(content, ...expectedImports);
      expect(content).toContain("from '@angular/common'");
    });
  });
});
