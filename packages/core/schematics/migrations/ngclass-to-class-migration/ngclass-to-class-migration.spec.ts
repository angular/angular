/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom} from '@angular/compiler-cli';
import {diffText, runTsurgeMigration} from '../../utils/tsurge/testing';
import {NgClassMigration} from './ngclass-to-class-migration';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

describe('ngClass migrator', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('No change cases', () => {
    it('should not change static HTML elements', async () => {
      await verifyDeclarationNoChange(`<button id="123"></button>`);
    });

    it('should not change existing [class] bindings', async () => {
      await verifyDeclarationNoChange(`<div [class.active]="isActive"></div>`);
    });

    it('should not change empty ngClass binding', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="{}"></div>`);
    });

    it('should not change ngClass with empty string key', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="{'': condition}"></div>`);
    });

    it('should not change ngClass with empty array', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="[]"></div>`);
    });
  });

  describe('Simple ngClass object migrations', () => {
    it('should migrate single condition', async () => {
      await verifyDeclaration({
        before: `<div [ngClass]="{'active': isActive}"></div>`,
        after: `<div [class.active]="isActive"></div>`,
      });
    });

    it('should migrate multiple class conditions', async () => {
      await verifyDeclaration({
        before: `<div [ngClass]="{'class1': condition1, 'class2': condition2}"></div>`,
        after: `<div [class.class1]="condition1" [class.class2]="condition2"></div>`,
      });
    });

    it('should migrate quoted class names', async () => {
      await verifyDeclaration({
        before: `<div [ngClass]="{'admin-panel': isAdmin, 'user-dense': isDense}"></div>`,
        after: `<div [class.admin-panel]="isAdmin" [class.user-dense]="isDense"></div>`,
      });
    });

    it('should split and migrate multiple classes in one key', async () => {
      await verifyDeclaration({
        before: `<div [ngClass]="{'class1 class2': condition}"></div>`,
        after: `<div [class.class1]="condition" [class.class2]="condition"></div>`,
      });
    });
  });

  describe('Complex and multi-element migrations', () => {
    it('should migrate complex object literals with mixed class keys', async () => {
      await verifyDeclaration({
        before: `<div [ngClass]="{'class1 class2': condition, 'class3': anotherCondition}"></div>`,
        after: `<div [class.class1]="condition" [class.class2]="condition" [class.class3]="anotherCondition"></div>`,
      });
    });

    it('should trim and migrate keys with extra whitespace', async () => {
      await verifyDeclaration({
        before: `<div [ngClass]="{'  class1  ': condition, 'class2': anotherCondition}"></div>`,
        after: `<div [class.class1]="condition" [class.class2]="anotherCondition"></div>`,
      });
    });

    it('should migrate multiple ngClass bindings across multiple elements', async () => {
      await verifyDeclaration({
        before: `
        <div [ngClass]="{'class1': condition1, 'class2': condition2}"></div>
        <div [ngClass]="{'class3': condition3}"></div>`,
        after: `
        <div [class.class1]="condition1" [class.class2]="condition2"></div>
        <div [class.class3]="condition3"></div>`,
      });
    });
  });

  describe('Non-migratable and edge cases', () => {
    it('should not migrate invalid object literal syntax', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="{foo isActive}"></div>`);
    });

    it('should not migrate string literal class list', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="'class1 class2'"></div>`);
    });

    it('should not migrate dynamic variable bindings', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="dynamicClassObject"></div>`);
    });

    it('should not migrate function call bindings', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="getClasses()"></div>`);
    });

    it('should not migrate object with spread syntax', async () => {
      await verifyDeclarationNoChange(`<div [ngClass]="{foo: true, ...other}"></div>`);
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
  const {fs} = await runTsurgeMigration(new NgClassMigration(), [
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
  return `import {Component} from '@angular/core';
@Component({ template: \`${declaration}\` })
export class AppComponent {}`;
}

function populateExpectedResult(declaration: string): string {
  return `import {Component} from '@angular/core';
@Component({ template: \`${declaration}\` })
export class AppComponent {}`;
}
