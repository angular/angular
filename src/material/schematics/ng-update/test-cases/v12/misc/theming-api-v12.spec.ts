import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {migrateFileContent} from '@angular/material/schematics/ng-update/migrations/theming-api-v12/migration';
import {join} from 'path';
import {MIGRATION_PATH} from '../../../../paths';

describe('v12 theming API migration', () => {
  const PROJECT_PATH = '/projects/cdk-testing';
  const THEME_PATH = join(PROJECT_PATH, 'src/theme.scss');
  let tree: UnitTestTree;
  let _writeFile: (filePath: string, text: string) => void;
  let runMigration: () => Promise<{logOutput: string}>;

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v12', MIGRATION_PATH, []);
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

  it('should migrate a theme based on the theming API', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,

      `@include mat-core();`,

      `$candy-app-primary: mat-palette($mat-indigo);`,
      `$candy-app-accent: mat-palette($mat-pink, A200, A100, A400);`,
      `$candy-app-theme: mat-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include angular-material-theme($candy-app-theme);`,

      `$dark-primary: mat-palette($mat-blue-grey);`,
      `$dark-accent: mat-palette($mat-amber, A200, A100, A400);`,
      `$dark-warn: mat-palette($mat-deep-orange);`,
      `$dark-theme: mat-dark-theme((`,
      `color: (`,
      `primary: $dark-primary,`,
      `accent: $dark-accent,`,
      `warn: $dark-warn,`,
      `)`,
      `));`,

      `.unicorn-dark-theme {`,
      `@include angular-material-color($dark-theme);`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,

      `@include mat.core();`,

      `$candy-app-primary: mat.define-palette(mat.$indigo-palette);`,
      `$candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
      `$candy-app-theme: mat.define-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat.all-component-themes($candy-app-theme);`,

      `$dark-primary: mat.define-palette(mat.$blue-grey-palette);`,
      `$dark-accent: mat.define-palette(mat.$amber-palette, A200, A100, A400);`,
      `$dark-warn: mat.define-palette(mat.$deep-orange-palette);`,
      `$dark-theme: mat.define-dark-theme((`,
      `color: (`,
      `primary: $dark-primary,`,
      `accent: $dark-accent,`,
      `warn: $dark-warn,`,
      `)`,
      `));`,

      `.unicorn-dark-theme {`,
      `@include mat.all-component-colors($dark-theme);`,
      `}`,
    ]);
  });

  it('should migrate files using CDK APIs through the theming import', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      ``,
      `@include cdk-overlay();`,
      ``,

      `.my-dialog {`,
      `z-index: $cdk-z-index-overlay-container + 1;`,
      `}`,
      ``,
      `@include cdk-high-contrast(active, off) {`,
      `button {`,
      `outline: solid 1px;`,
      `}`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/cdk' as cdk;`,
      ``,
      `@include cdk.overlay();`,
      ``,
      `.my-dialog {`,
      `z-index: cdk.$overlay-container-z-index + 1;`,
      `}`,
      ``,
      `@include cdk.high-contrast(active, off) {`,
      `button {`,
      `outline: solid 1px;`,
      `}`,
      `}`,
    ]);
  });

  it('should migrate files using both Material and CDK APIs', async () => {
    writeLines(THEME_PATH, [
      `@import './foo'`,
      `@import '@angular/material/theming';`,
      ``,
      `@include cdk-overlay();`,
      `@include mat-core();`,

      `$candy-app-primary: mat-palette($mat-indigo);`,
      `$candy-app-accent: mat-palette($mat-pink, A200, A100, A400);`,
      `$candy-app-theme: mat-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include angular-material-theme($candy-app-theme);`,

      `.my-dialog {`,
      `z-index: $cdk-z-index-overlay-container + 1;`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/cdk' as cdk;`,
      `@import './foo'`,
      ``,
      `@include cdk.overlay();`,
      `@include mat.core();`,

      `$candy-app-primary: mat.define-palette(mat.$indigo-palette);`,
      `$candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
      `$candy-app-theme: mat.define-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat.all-component-themes($candy-app-theme);`,

      `.my-dialog {`,
      `z-index: cdk.$overlay-container-z-index + 1;`,
      `}`,
    ]);
  });

  it('should detect imports using double quotes', async () => {
    writeLines(THEME_PATH, [`@import "@angular/material/theming";`, `@include mat-core();`]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@include mat.core();`,
    ]);
  });

  it('should migrate mixins that are invoked without parentheses', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      `@include mat-base-typography;`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@include mat.typography-hierarchy;`,
    ]);
  });

  it('should migrate files that import the Material APIs transitively', async () => {
    writeLines(THEME_PATH, [
      `@import 're-exports-material-symbols';`,
      `@include mat-core();`,
      `@include mat-button-theme();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@import 're-exports-material-symbols';`,
      `@include mat.core();`,
      `@include mat.button-theme();`,
    ]);
  });

  it('should allow an arbitrary number of spaces after @include and @import', async () => {
    writeLines(THEME_PATH, [
      `@import                  '@angular/material/theming';`,
      `@include     mat-core;`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@include mat.core;`,
    ]);
  });

  it('should insert the new @use statement above other @import statements', async () => {
    writeLines(THEME_PATH, [
      `@import './foo'`,
      `@import "@angular/material/theming";`,
      `@import './bar'`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@import './foo'`,
      `@import './bar'`,
      `@include mat.core();`,
    ]);
  });

  it('should account for other @use statements when inserting the new Material @use', async () => {
    writeLines(THEME_PATH, [
      `@use './foo'`,
      `@import './bar'`,
      `@import "@angular/material/theming";`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@use './foo'`,
      `@import './bar'`,
      `@include mat.core();`,
    ]);
  });

  it('should account for multi-line comment file headers placed aboved the @import statements', async () => {
    writeLines(THEME_PATH, [
      `/** This is a license. */`,
      `@import './foo'`,
      `@import '@angular/material/theming';`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `/** This is a license. */`,
      `@use '@angular/material' as mat;`,
      `@import './foo'`,
      `@include mat.core();`,
    ]);
  });

  it('should account for single-line comment file headers placed aboved the @import statements', async () => {
    writeLines(THEME_PATH, [
      `// This is a license.`,
      `@import './foo'`,
      `@import '@angular/material/theming';`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `// This is a license.`,
      `@use '@angular/material' as mat;`,
      `@import './foo'`,
      `@include mat.core();`,
    ]);
  });

  it('should migrate multiple files within the same project', async () => {
    const componentPath = join(PROJECT_PATH, 'components/dialog.scss');

    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      `@include angular-material-theme();`,
    ]);

    writeLines(componentPath, [
      `@import '@angular/material/theming';`,
      `.my-dialog {`,
      `z-index: $cdk-z-index-overlay-container + 1;`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@include mat.all-component-themes();`,
    ]);

    expect(splitFile(componentPath)).toEqual([
      `@use '@angular/cdk' as cdk;`,
      `.my-dialog {`,
      `z-index: cdk.$overlay-container-z-index + 1;`,
      `}`,
    ]);
  });

  it('should handle variables whose names overlap', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      `$one: $mat-blue-grey;`,
      `$two: $mat-blue;`,
      '$three: $mat-blue',
      '$four: $mat-blue-gray',
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `$one: mat.$blue-grey-palette;`,
      `$two: mat.$blue-palette;`,
      '$three: mat.$blue-palette',
      '$four: mat.$blue-gray-palette',
    ]);
  });

  it('should migrate individual component themes', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,

      `@include mat-core();`,

      `$candy-app-primary: mat-palette($mat-indigo);`,
      `$candy-app-accent: mat-palette($mat-pink, A200, A100, A400);`,
      `$candy-app-theme: mat-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat-button-theme($candy-app-theme);`,
      `@include mat.table-theme($candy-app-theme);`,
      `@include mat-expansion-panel-theme($candy-app-theme);`,
      `@include mat-datepicker-theme($candy-app-theme);`,
      `@include mat-option-theme($candy-app-theme);`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,

      `@include mat.core();`,

      `$candy-app-primary: mat.define-palette(mat.$indigo-palette);`,
      `$candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
      `$candy-app-theme: mat.define-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat.button-theme($candy-app-theme);`,
      `@include mat.table-theme($candy-app-theme);`,
      // This one is a special case, because the migration also fixes an incorrect name.
      `@include mat.expansion-theme($candy-app-theme);`,
      `@include mat.datepicker-theme($candy-app-theme);`,
      `@include mat.option-theme($candy-app-theme);`,
    ]);
  });

  it('should migrate deep imports', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/core/theming/palette';`,
      `@import '@angular/material/core/theming/theming';`,
      `@import '@angular/material/button/button-theme';`,
      `@import '@angular/material/table/table-theme';`,
      `@import '@angular/cdk/overlay';`,
      `@import '@angular/material/datepicker/datepicker-theme';`,
      `@import '@angular/material/option/option-theme';`,

      `@include cdk-overlay();`,

      `$candy-app-primary: mat-palette($mat-indigo);`,
      `$candy-app-accent: mat-palette($mat-pink, A200, A100, A400);`,
      `$candy-app-theme: mat-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat-button-theme($candy-app-theme);`,
      `@include mat.table-theme($candy-app-theme);`,
      `@include mat-datepicker-theme($candy-app-theme);`,
      `@include mat-option-theme($candy-app-theme);`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/cdk' as cdk;`,

      `@include cdk.overlay();`,

      `$candy-app-primary: mat.define-palette(mat.$indigo-palette);`,
      `$candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
      `$candy-app-theme: mat.define-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat.button-theme($candy-app-theme);`,
      `@include mat.table-theme($candy-app-theme);`,
      `@include mat.datepicker-theme($candy-app-theme);`,
      `@include mat.option-theme($candy-app-theme);`,
    ]);
  });

  it('should migrate usages of @use, with and without namespaces', async () => {
    writeLines(THEME_PATH, [
      `@use '@angular/material/core/theming/palette' as palette;`,
      `@use '@angular/material/core/theming/theming';`,
      `@use '@angular/material/button/button-theme' as button;`,
      `@use '@angular/material/table/table-theme' as table;`,
      // Leave one `@import` here to verify mixed usage.
      `@import '@angular/material/option/option-theme';`,
      `@use '@angular/cdk/overlay' as cdk;`,
      `@use '@angular/material/datepicker/datepicker-theme' as datepicker;`,

      `@include cdk.cdk-overlay();`,

      `$candy-app-primary: theming.mat-palette(palette.$mat-indigo);`,
      `$candy-app-accent: theming.mat-palette(palette.$mat-pink, A200, A100, A400);`,
      `$candy-app-theme: theming.mat-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include button.mat-button-theme($candy-app-theme);`,
      `@include table.mat-table-theme($candy-app-theme);`,
      `@include datepicker.mat-datepicker-theme($candy-app-theme);`,
      `@include mat-option-theme($candy-app-theme);`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/cdk' as cdk;`,

      `@include cdk.overlay();`,

      `$candy-app-primary: mat.define-palette(mat.$indigo-palette);`,
      `$candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
      `$candy-app-theme: mat.define-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat.button-theme($candy-app-theme);`,
      `@include mat.table-theme($candy-app-theme);`,
      `@include mat.datepicker-theme($candy-app-theme);`,
      `@include mat.option-theme($candy-app-theme);`,
    ]);
  });

  it('should handle edge case inferred Sass import namespaces', async () => {
    writeLines(THEME_PATH, [
      `@use '@angular/material/core/index';`,
      `@use '@angular/material/button/_button-theme';`,
      `@use '@angular/material/table/table-theme.import';`,
      `@use '@angular/material/datepicker/datepicker-theme.scss';`,

      `@include core.mat-core();`,
      `@include button-theme.mat-button-theme();`,
      `@include table-theme.mat-table-theme();`,
      `@include datepicker-theme.mat-datepicker-theme();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,

      `@include mat.core();`,
      `@include mat.button-theme();`,
      `@include mat.table-theme();`,
      `@include mat.datepicker-theme();`,
    ]);
  });

  it('should drop the old import path even if the file is not using any symbols', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      ``,
      `.my-dialog {`,
      `color: red;`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([`.my-dialog {`, `color: red;`, `}`]);
  });

  it('should replace removed variables with their values', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      ``,
      `@include mat-button-toggle-theme();`,
      ``,

      `.my-button-toggle {`,
      `height: $mat-button-toggle-standard-height + 10px;`,
      `transition: $swift-ease-out;`,
      `}`,
      ``,
      `@media ($mat-small) {`,
      `.my-button-toggle {`,
      `height: $mat-button-toggle-standard-minimum-height;`,
      `}`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      ``,
      `@include mat.button-toggle-theme();`,
      ``,

      `.my-button-toggle {`,
      `height: 48px + 10px;`,
      `transition: all 400ms cubic-bezier(0.25, 0.8, 0.25, 1);`,
      `}`,
      ``,
      `@media (max-width: 959px) {`,
      `.my-button-toggle {`,
      `height: 24px;`,
      `}`,
      `}`,
    ]);
  });

  it('should not replace removed variables whose name overlaps with other variables', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      `$swift-ease-in-duration: 300ms !default`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([`$swift-ease-in-duration: 300ms !default`]);
  });

  it('should not replace assignments to removed variables', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      ``,
      `$mat-button-toggle-standard-height: 50px;`,
      `$mat-button-toggle-standard-minimum-height   : 12px;`,
      `$mat-toggle-padding:10px;`,
      `$mat-toggle-size:     11px;`,
      ``,
      `@include mat-button-toggle-theme();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      ``,
      `$mat-button-toggle-standard-height: 50px;`,
      `$mat-button-toggle-standard-minimum-height   : 12px;`,
      `$mat-toggle-padding:10px;`,
      `$mat-toggle-size:     11px;`,
      ``,
      `@include mat.button-toggle-theme();`,
    ]);
  });

  it('should not migrate files in the node_modules', async () => {
    writeLines('/node_modules/theme.scss', [
      `@import '@angular/material/theming';`,
      ``,
      `@include mat-button-toggle-theme();`,
      ``,
    ]);

    await runMigration();

    expect(splitFile('/node_modules/theme.scss')).toEqual([
      `@import '@angular/material/theming';`,
      ``,
      `@include mat-button-toggle-theme();`,
      ``,
    ]);
  });

  it('should only migrate unprefixed variables if there is a theming import', async () => {
    const otherTheme = join(PROJECT_PATH, 'other-theme.scss');

    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      ``,
      `.my-button {`,
      `z-index: $z-index-fab;`,
      `}`,
    ]);

    writeLines(otherTheme, [
      `@import 're-exports-material-symbols';`,
      ``,
      `.my-drawer {`,
      `z-index: $z-index-drawer;`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([`.my-button {`, `z-index: 20;`, `}`]);

    expect(splitFile(otherTheme)).toEqual([
      `@import 're-exports-material-symbols';`,
      ``,
      `.my-drawer {`,
      `z-index: $z-index-drawer;`,
      `}`,
    ]);
  });

  it(
    'should insert the @use statement at the top of the file, if the theming import is ' +
      'the only import in the file and there is other content before it',
    async () => {
      writeLines(THEME_PATH, [
        `:host {`,
        `display: block;`,
        `width: 100%;`,
        `}`,
        ``,
        `@import '@angular/material/theming';`,
        ``,
        `.button {`,
        `@include mat-elevation(4);`,
        `padding: 8px;`,
        `}`,
      ]);

      await runMigration();

      expect(splitFile(THEME_PATH)).toEqual([
        `@use '@angular/material' as mat;`,
        `:host {`,
        `display: block;`,
        `width: 100%;`,
        `}`,
        ``,
        ``,
        `.button {`,
        `@include mat.elevation(4);`,
        `padding: 8px;`,
        `}`,
      ]);
    },
  );

  it('should migrate extra given mixins and functions', () => {
    const originalContent = [
      `@import '@angular/material/theming';`,
      `$something: mat-mdc-typography-config();`,
      `@include mat-mdc-button-theme();`,
      `$another: $mat-vermillion`,
    ].join('\n');

    const migratedContent = migrateFileContent(
      originalContent,
      '@angular/material/',
      '@angular/cdk/',
      '@angular/material',
      '@angular/cdk',
      {
        mixins: {'mat-mdc-button-theme': 'mdc-button-theme'},
        functions: {'mat-mdc-typography-config': 'mdc-typography-config'},
        variables: {'mat-vermillion': 'vermillion-palette'},
      },
    );

    expect(migratedContent).toBe(
      [
        `@use '@angular/material' as mat;`,
        `$something: mat.mdc-typography-config();`,
        `@include mat.mdc-button-theme();`,
        `$another: mat.$vermillion-palette`,
      ].join('\n'),
    );
  });

  it('should not drop imports of prebuilt styles', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/prebuilt-themes/indigo-pink.css';`,
      `@import '@angular/material/theming';`,
      `@import '@angular/cdk/overlay-prebuilt.css';`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@import '@angular/material/prebuilt-themes/indigo-pink.css';`,
      `@import '@angular/cdk/overlay-prebuilt.css';`,
      `@include mat.core();`,
    ]);
  });

  it('should not add duplicate @use statements', async () => {
    writeLines(THEME_PATH, [
      `@use '@angular/material' as mat;`,
      `@import '@angular/material/theming';`,
      `$something: mat.$red-palette;`,
      `$another: $mat-pink;`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `$something: mat.$red-palette;`,
      `$another: mat.$pink-palette;`,
    ]);
  });

  it('should insert @use before other code when only Angular imports are first', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      `$something: 123;`,
      `@include mat-core();`,
      `@import 'some/other/file';`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `$something: 123;`,
      `@include mat.core();`,
      `@import 'some/other/file';`,
    ]);
  });

  it('should not rename variables appended with extra characters', async () => {
    writeLines(THEME_PATH, [
      `@import '@angular/material/theming';`,
      `$mat-light-theme-background-override: 123;`,
      `@include mat-core();`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `$mat-light-theme-background-override: 123;`,
      `@include mat.core();`,
    ]);
  });

  it('should not rename functions prepended with extra characters', async () => {
    writeLines(THEME_PATH, [`@function gmat-palette() {`, `  @return white;`, `}`]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([`@function gmat-palette() {`, `  @return white;`, `}`]);
  });

  it('should not migrate commented out code', async () => {
    writeLines(THEME_PATH, [
      `// @import '@angular/material/theming';`,
      '/* @include mat-core(); */',
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `// @import '@angular/material/theming';`,
      '/* @include mat-core(); */',
    ]);
  });

  it('should not migrate single-line commented code at the end of the file', async () => {
    writeLines(THEME_PATH, [
      `// @import '@angular/material/theming';`,
      '// @include mat-core();',
      '// @include mat-button-theme();',
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `// @import '@angular/material/theming';`,
      '// @include mat-core();',
      '// @include mat-button-theme();',
    ]);
  });

  it('should handle mixed commented and non-commented content', async () => {
    writeLines(THEME_PATH, [
      `// @import '@angular/material/theming';`,
      '@include mat-core();',
      '@include mat-button-theme();',
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `// @import '@angular/material/theming';`,
      `@use '@angular/material' as mat;`,
      '@include mat.core();',
      '@include mat.button-theme();',
    ]);
  });

  it('should migrate files that import using the tilde', async () => {
    writeLines(THEME_PATH, [
      `@import './foo'`,
      `@import '~@angular/material/theming';`,
      ``,
      `@include cdk-overlay();`,
      `@include mat-core();`,

      `$candy-app-primary: mat-palette($mat-indigo);`,
      `$candy-app-accent: mat-palette($mat-pink, A200, A100, A400);`,
      `$candy-app-theme: mat-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include angular-material-theme($candy-app-theme);`,

      `.my-dialog {`,
      `z-index: $cdk-z-index-overlay-container + 1;`,
      `}`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/cdk' as cdk;`,
      `@import './foo'`,
      ``,
      `@include cdk.overlay();`,
      `@include mat.core();`,

      `$candy-app-primary: mat.define-palette(mat.$indigo-palette);`,
      `$candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
      `$candy-app-theme: mat.define-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat.all-component-themes($candy-app-theme);`,

      `.my-dialog {`,
      `z-index: cdk.$overlay-container-z-index + 1;`,
      `}`,
    ]);
  });

  it('should migrate deep imports using a tilde', async () => {
    writeLines(THEME_PATH, [
      `@import '~@angular/material/core/theming/palette';`,
      `@import '~@angular/material/core/theming/theming';`,
      `@import '~@angular/material/button/button-theme';`,
      `@import '~@angular/material/table/table-theme';`,
      `@import '~@angular/cdk/overlay';`,
      `@import '~@angular/material/datepicker/datepicker-theme';`,
      `@import '~@angular/material/option/option-theme';`,

      `@include cdk-overlay();`,

      `$candy-app-primary: mat-palette($mat-indigo);`,
      `$candy-app-accent: mat-palette($mat-pink, A200, A100, A400);`,
      `$candy-app-theme: mat-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat-button-theme($candy-app-theme);`,
      `@include mat.table-theme($candy-app-theme);`,
      `@include mat-datepicker-theme($candy-app-theme);`,
      `@include mat-option-theme($candy-app-theme);`,
    ]);

    await runMigration();

    expect(splitFile(THEME_PATH)).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/cdk' as cdk;`,

      `@include cdk.overlay();`,

      `$candy-app-primary: mat.define-palette(mat.$indigo-palette);`,
      `$candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
      `$candy-app-theme: mat.define-light-theme((`,
      `color: (`,
      `primary: $candy-app-primary,`,
      `accent: $candy-app-accent,`,
      `)`,
      `));`,

      `@include mat.button-theme($candy-app-theme);`,
      `@include mat.table-theme($candy-app-theme);`,
      `@include mat.datepicker-theme($candy-app-theme);`,
      `@include mat.option-theme($candy-app-theme);`,
    ]);
  });
});
