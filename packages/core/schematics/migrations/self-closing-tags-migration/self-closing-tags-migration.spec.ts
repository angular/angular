/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, initMockFileSystem} from '@angular/compiler-cli';
import {diffText, runTsurgeMigration} from '../../utils/tsurge/testing';
import {SelfClosingTagsMigration} from './self-closing-tags-migration';

describe('self-closing tags', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('self-closing tags migration', () => {
    it('should skip dom elements', async () => {
      await verifyDeclarationNoChange(`<button id="123"></button>`);
    });

    it('should skip custom elements with content', async () => {
      await verifyDeclarationNoChange(`<my-cmp>1</my-cmp>`);
    });

    it('should skip already self-closing custom elements', async () => {
      await verifyDeclarationNoChange(`<my-cmp /> <my-cmp with="attributes" />`);
    });

    it('should migrate custom elements', async () => {
      await verifyDeclaration({
        before: `<my-cmp></my-cmp>`,
        after: `<my-cmp />`,
      });
    });

    it('should migrate custom elements with attributes', async () => {
      await verifyDeclaration({
        before: `<my-cmp attr="value"></my-cmp>`,
        after: `<my-cmp attr="value" />`,
      });
    });

    it('should migrate multiple custom elements in the template', async () => {
      await verifyDeclaration({
        before: `<my-cmp></my-cmp><my-cmp></my-cmp>`,
        after: `<my-cmp /><my-cmp />`,
      });
    });

    it('should migrate a template that contains directives, pipes, inputs, outputs, and events', async () => {
      await verifyDeclaration({
        before: `
          <app-management *ngIf="
              categoryList &&
              ((test1 && test1.length > 0) ||
              (test && test.length > 0))
            "
            [test]="test > 2"
            [test2]="test | uppercase"
            (click)="test.length > 0 ? test($event) : null"
            (testEvent)="test1($event)"></app-management>
        `,
        after: `
          <app-management *ngIf="
              categoryList &&
              ((test1 && test1.length > 0) ||
              (test && test.length > 0))
            "
            [test]="test > 2"
            [test2]="test | uppercase"
            (click)="test.length > 0 ? test($event) : null"
            (testEvent)="test1($event)" />
        `,
      });
    });

    it('should migrate multiple cases of spacing', async () => {
      await verifyDeclaration({
        before: `<app-my-cmp1>   </app-my-cmp1>`,
        after: `<app-my-cmp1 />`,
      });

      await verifyDeclaration({
        before: `
          <app-my-cmp1 test="hello">

          </app-my-cmp1>
        `,
        after: `<app-my-cmp1 test="hello" />`,
      });

      await verifyDeclarationNoChange(`
         <app-my-cmp4
            test="hello"
          >
            123
          </app-my-cmp4>
      `);

      await verifyDeclaration({
        before: `
          <app-my-cmp1 hello="world">
            <app-my-cmp1 hello="world">
            </app-my-cmp1>
          </app-my-cmp1>
        `,
        after: `
          <app-my-cmp1 hello="world">
            <app-my-cmp1 hello="world" />
          </app-my-cmp1>
        `,
      });

      await verifyDeclaration({
        before: `
          <app-my-cmp10 test="hello"
            [test]="hello"
            (test)="hello()"
          >
          </app-my-cmp10>
        `,
        after: `
          <app-my-cmp10 test="hello"
            [test]="hello"
            (test)="hello()"
           />
        `,
      });
    });

    it('should migrate the template with multiple nested elements', async () => {
      await verifyDeclaration({
        before: `
          <hello-world12>
            <hello-world13>
              <hello-world14 count="1" [test]="hello" (test)="test" ></hello-world14>
                <hello-world15>
                  <hello-world16  count="1" [test]="hello" (test)="test"  />
                  <hello-world17  count="1" [test]="hello" (test)="test" ></hello-world17>
                  <hello-world18
                   count="1" [test]="hello"
                    (test)="test"
                    >

                  </hello-world18>
                </hello-world15>
            </hello-world13>
          </hello-world12>
          `,
        after: `
          <hello-world12>
            <hello-world13>
              <hello-world14 count="1" [test]="hello" (test)="test"  />
                <hello-world15>
                  <hello-world16  count="1" [test]="hello" (test)="test"  />
                  <hello-world17 count="1" [test]="hello" (test)="test"  />
                  <hello-world18 count="1" [test]="hello"
                    (test)="test"
                     />
                </hello-world15>
            </hello-world13>
          </hello-world12>
          `,
      });
    });

    it('should migrate multiple components in a file', async () => {
      await verify({
        before: `
            import {Component} from '@angular/core';
            @Component({ template: '<my-cmp></my-cmp>' })
            export class Cmp1 {}

            @Component({ template: '<my-cmp></my-cmp><my-cmp></my-cmp>' })
            export class Cmp2 {}
          `,
        after: `
            import {Component} from '@angular/core';
            @Component({ template: '<my-cmp />' })
            export class Cmp1 {}

            @Component({ template: '<my-cmp /><my-cmp />' })
            export class Cmp2 {}
          `,
      });
    });

    it('should migrate an external template file', async () => {
      const templateFileContent = `
        <app-my-cmp1>   </app-my-cmp1>
        <app-my-cmp1>

        </app-my-cmp1>

        <app-my-cmp1 hello="world">
          <app-my-cmp1 hello="world">
          </app-my-cmp1>
        </app-my-cmp1>
      `;

      const templateFileExpected = `
        <app-my-cmp1 />
        <app-my-cmp1 />

        <app-my-cmp1 hello="world">
          <app-my-cmp1 hello="world" />
        </app-my-cmp1>
      `;

      const tsFileContent = `
        import {Component} from '@angular/core';
        @Component({ templateUrl: 'app.component.html' })
        export class AppComponent {}
      `;

      const {fs} = await runTsurgeMigration(new SelfClosingTagsMigration(), [
        {
          name: absoluteFrom('/app.component.ts'),
          isProgramRootFile: true,
          contents: tsFileContent,
        },
        {
          name: absoluteFrom('/app.component.html'),
          contents: templateFileContent,
        },
      ]);

      const componentTsFile = fs.readFile(absoluteFrom('/app.component.ts')).trim();
      const actualComponentHtmlFile = fs.readFile(absoluteFrom('/app.component.html')).trim();
      const expectedTemplate = templateFileExpected.trim();

      // no changes should be made to the component TS file
      expect(componentTsFile).toEqual(tsFileContent.trim());

      expect(actualComponentHtmlFile)
        .withContext(diffText(expectedTemplate, actualComponentHtmlFile))
        .toEqual(expectedTemplate);
    });
  });
});

async function verifyDeclaration(testCase: {before: string; after: string}) {
  await verify({
    before: populateDeclarationTestCase(testCase.before.trim()),
    after: populateExpectedResult(testCase.after.trim()),
  });
}

async function verifyDeclarationNoChange(beforeAndAfter: string) {
  await verifyDeclaration({before: beforeAndAfter, after: beforeAndAfter});
}

async function verify(testCase: {before: string; after: string}) {
  const {fs} = await runTsurgeMigration(new SelfClosingTagsMigration(), [
    {
      name: absoluteFrom('/app.component.ts'),
      isProgramRootFile: true,
      contents: testCase.before,
    },
  ]);

  const actual = fs.readFile(absoluteFrom('/app.component.ts')).trim();
  const expected = testCase.after.trim();

  expect(actual).withContext(diffText(expected, actual)).toEqual(expected);
}

function populateDeclarationTestCase(declaration: string): string {
  return `
      import {Component} from '@angular/core';
      @Component({ template: \`${declaration}\` })
      export class AppComponent {}
  `;
}

function populateExpectedResult(declaration: string): string {
  return `
      import {Component} from '@angular/core';
      @Component({ template: \`${declaration}\` })
      export class AppComponent {}
  `;
}
