import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '../../../../testing';
import {join} from 'path';
import {MIGRATION_PATH} from '../../../../paths';

describe('v13 tilde import migration', () => {
  const PROJECT_PATH = '/projects/cdk-testing';
  const TEST_PATH = join(PROJECT_PATH, 'src/test.scss');
  let tree: UnitTestTree;
  let _writeFile: (filePath: string, text: string) => void;
  let runMigration: () => Promise<{logOutput: string}>;

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v13', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    runMigration = testSetup.runFixers;
    _writeFile = testSetup.writeFile;
  });

  /** Writes an array of lines as a single file. */
  function writeLines(path: string, lines: string[]): void {
    _writeFile(path, lines.join('\n'));
  }

  /** Reads a file and split it into an array where each item is a new line. */
  function splitFile(path: string): string[] {
    return tree.readContent(path).split('\n');
  }

  it('should remove the tilde from angular imports', async () => {
    writeLines(TEST_PATH, [
      `@use '~@angular/material' as mat;`,
      `@import '~@angular/material/theming';`,
      `@import '~@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(TEST_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@import '@angular/material/theming';`,
      `@import '@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);
  });

  it('should handle an arbitrary amount of whitespace', async () => {
    writeLines(TEST_PATH, [
      `@use                               '~@angular/material' as mat;`,

      `@include mat.core();`,
    ]);

    await runMigration();

    expect(splitFile(TEST_PATH)).toEqual([
      `@use                               '@angular/material' as mat;`,

      `@include mat.core();`,
    ]);
  });

  it('should preserve tilde after the start', async () => {
    writeLines(TEST_PATH, [
      `@use '~@angular/~material' as mat;`,
      `@import '@angular/cdk/~overlay-prebuilt.css';`,

      `@include mat.core();`,
    ]);

    await runMigration();

    expect(splitFile(TEST_PATH)).toEqual([
      `@use '@angular/~material' as mat;`,
      `@import '@angular/cdk/~overlay-prebuilt.css';`,

      `@include mat.core();`,
    ]);
  });

  it('should handle different types of quotes', async () => {
    writeLines(TEST_PATH, [
      `@use "~@angular/material" as mat;`,
      `@import '~@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(TEST_PATH)).toEqual([
      `@use "@angular/material" as mat;`,
      `@import '@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);
  });

  it('should preserve the tilde in non-angular imports', async () => {
    writeLines(TEST_PATH, [
      `@use '~@angular-momentum/material' as mat;`,
      `@import '~@angular-momentum/material/theming';`,
      `@import '@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(TEST_PATH)).toEqual([
      `@use '~@angular-momentum/material' as mat;`,
      `@import '~@angular-momentum/material/theming';`,
      `@import '@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);
  });

  it('should remove remove .scss file extension', async () => {
    writeLines(TEST_PATH, [
      `@use '~@angular/material.scss' as mat;`,
      `@import '~@angular/material/theming.scss';`,
      `@import '~@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(TEST_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@import '@angular/material/theming';`,
      `@import '@angular/cdk/overlay-prebuilt.css';`,

      `@include mat.button-theme();`,
      `@include mat-core();`,
    ]);
  });
});
