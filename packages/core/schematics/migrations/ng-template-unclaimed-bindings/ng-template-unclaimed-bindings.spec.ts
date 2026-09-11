/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {initMockFileSystem} from '@angular/compiler-cli/private/testing';
import {runTsurgeMigration} from '../../utils/tsurge/testing';
import {NgTemplateUnclaimedBindingsMigration} from './migration';

describe('NgTemplateUnclaimedBindingsMigration', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  async function migrateSingleFile(contents: string): Promise<string> {
    const {fs} = await runTsurgeMigration(new NgTemplateUnclaimedBindingsMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents,
      },
    ]);

    return fs.readFile(absoluteFrom('/app.component.ts'));
  }

  it('should remove a property binding on an ng-template not claimed by any directive', async () => {
    const content = await migrateSingleFile(`
      import {Component} from '@angular/core';

      @Component({
        template: '<ng-template [someDir]="value">content</ng-template>',
      })
      export class AppComponent {
        value = 1;
      }
    `);

    expect(content).toContain(`template: '<ng-template>content</ng-template>'`);
  });

  it('should remove a two-way binding on an ng-template not claimed by any directive', async () => {
    const content = await migrateSingleFile(`
      import {Component} from '@angular/core';

      @Component({
        template: '<ng-template [(someDir)]="value">content</ng-template>',
      })
      export class AppComponent {
        value = 1;
      }
    `);

    expect(content).toContain(`template: '<ng-template>content</ng-template>'`);
  });

  it('should not remove a binding claimed by an imported directive', async () => {
    const content = await migrateSingleFile(`
      import {Component, Directive, Input} from '@angular/core';

      @Directive({selector: '[someDir]'})
      export class SomeDirective {
        @Input() someDir: any;
      }

      @Component({
        imports: [SomeDirective],
        template: '<ng-template [someDir]="value">content</ng-template>',
      })
      export class AppComponent {
        value = 1;
      }
    `);

    expect(content).toContain(`template: '<ng-template [someDir]="value">content</ng-template>'`);
  });

  it('should not remove a binding that matches a directive selector without a corresponding input', async () => {
    const content = await migrateSingleFile(`
      import {Component, Directive} from '@angular/core';

      @Directive({selector: '[foobar]'})
      export class FoobarDirective {}

      @Component({
        imports: [FoobarDirective],
        template: '<ng-template #foo [foobar]>content</ng-template>',
      })
      export class AppComponent {}
    `);

    expect(content).toContain(`template: '<ng-template #foo [foobar]>content</ng-template>'`);
  });

  it('should only remove the unclaimed bindings when the ng-template has multiple bindings', async () => {
    const content = await migrateSingleFile(`
      import {Component} from '@angular/core';

      @Component({
        template: '<ng-template let-item [someDir]="value" #ref>content</ng-template>',
      })
      export class AppComponent {
        value = 1;
      }
    `);

    expect(content).toContain(`template: '<ng-template let-item #ref>content</ng-template>'`);
  });

  it('should not touch bindings on regular elements', async () => {
    const content = await migrateSingleFile(`
      import {Component} from '@angular/core';

      @Component({
        template: '<div [unknownProp]="value"></div>',
      })
      export class AppComponent {
        value = 1;
      }
    `);

    expect(content).toContain(`template: '<div [unknownProp]="value"></div>'`);
  });

  it('should remove unclaimed bindings in an external template', async () => {
    const {fs} = await runTsurgeMigration(new NgTemplateUnclaimedBindingsMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: './app.component.html',
          })
          export class AppComponent {
            value = 1;
          }
        `,
      },
      {
        name: absoluteFrom('/app.component.html'),
        contents: [`<h1>Hello</h1>`, `<ng-template [someDir]="value">content</ng-template>`].join(
          '\n',
        ),
      },
    ]);

    const content = fs.readFile(absoluteFrom('/app.component.html'));
    expect(content).toContain('<ng-template>content</ng-template>');
    expect(content).toContain('<h1>Hello</h1>');
  });

  it('should remove a binding that spans its own line', async () => {
    const {fs} = await runTsurgeMigration(new NgTemplateUnclaimedBindingsMigration(), [
      {
        name: absoluteFrom('/app.component.ts'),
        isProgramRootFile: true,
        contents: `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: './app.component.html',
          })
          export class AppComponent {
            value = 1;
          }
        `,
      },
      {
        name: absoluteFrom('/app.component.html'),
        contents: [`<ng-template`, `  [someDir]="value"`, `  #ref>content</ng-template>`].join(
          '\n',
        ),
      },
    ]);

    const content = fs.readFile(absoluteFrom('/app.component.html'));
    expect(content).toBe(['<ng-template', '  #ref>content</ng-template>'].join('\n'));
  });
});
