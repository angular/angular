import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {COLLECTION_PATH} from '../../paths';
import {Schema} from './schema';

describe('Material theming API schematic', () => {
  const options: Schema = {};
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should migrate a theme based on the theming API', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import '~@angular/material/theming';`,

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
      `}`
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,

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
      `}`
    ]);
  });

  it('should migrate files using CDK APIs through the theming import', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import '~@angular/material/theming';`,
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
      `}`
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/cdk' as cdk;`,
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
      `}`
    ]);
  });

  it('should migrate files using both Material and CDK APIs', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
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
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/cdk' as cdk;`,
      `@use '~@angular/material' as mat;`,
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
      `}`
    ]);
  });

  it('should detect imports using double quotes', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import "~@angular/material/theming";`,
      `@include mat-core();`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `@include mat.core();`,
    ]);
  });

  it('should migrate mixins that are invoked without parentheses', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import '~@angular/material/theming';`,
      `@include mat-base-typography;`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `@include mat.typography-hierarchy;`,
    ]);
  });

  it('should allow an arbitrary number of spaces after @include and @import', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import                  '~@angular/material/theming';`,
      `@include     mat-core;`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `@include mat.core;`,
    ]);
  });

  it('should insert the new @use statement above other @import statements', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import './foo'`,
      `@import "~@angular/material/theming";`,
      `@import './bar'`,
      `@include mat-core();`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `@import './foo'`,
      `@import './bar'`,
      `@include mat.core();`,
    ]);
  });

  it('should account for other @use statements when inserting the new Material @use', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@use './foo'`,
      `@import './bar'`,
      `@import "~@angular/material/theming";`,
      `@include mat-core();`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use './foo'`,
      `@use '~@angular/material' as mat;`,
      `@import './bar'`,
      `@include mat.core();`,
    ]);
  });

  it('should account for file headers placed aboved the @import statements', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `/** This is a license. */`,
      `@import './foo'`,
      `@import '~@angular/material/theming';`,
      `@include mat-core();`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `/** This is a license. */`,
      `@use '~@angular/material' as mat;`,
      `@import './foo'`,
      `@include mat.core();`,
    ]);
  });

  it('should migrate multiple files within the same project', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import '~@angular/material/theming';`,
      `@include angular-material-theme();`,
    ].join('\n'));

    app.create('/components/dialog.scss', [
      `@import '~@angular/material/theming';`,
      `.my-dialog {`,
        `z-index: $cdk-z-index-overlay-container + 1;`,
      `}`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `@include mat.all-component-themes();`,
    ]);
    expect(getFileContent(tree, '/components/dialog.scss').split('\n')).toEqual([
      `@use '~@angular/cdk' as cdk;`,
      `.my-dialog {`,
        `z-index: cdk.$overlay-container-z-index + 1;`,
      `}`,
    ]);
  });

  it('should handle variables whose names overlap', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import '~@angular/material/theming';`,
      `$one: $mat-blue-grey;`,
      `$two: $mat-blue;`,
      '$three: $mat-blue',
      '$four: $mat-blue-gray',
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `$one: mat.$blue-grey-palette;`,
      `$two: mat.$blue-palette;`,
      '$three: mat.$blue-palette',
      '$four: mat.$blue-gray-palette',
    ]);
  });

  it('should migrate individual component themes', async () => {
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@import '~@angular/material/theming';`,

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
      `@include mat-table-theme($candy-app-theme);`,
      `@include mat-expansion-panel-theme($candy-app-theme);`,
      `@include mat-datepicker-theme($candy-app-theme);`,
      `@include mat-option-theme($candy-app-theme);`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,

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
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
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
      `@include mat-table-theme($candy-app-theme);`,
      `@include mat-datepicker-theme($candy-app-theme);`,
      `@include mat-option-theme($candy-app-theme);`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `@use '~@angular/cdk' as cdk;`,

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
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@use '~@angular/material/core/theming/palette' as palette;`,
      `@use '~@angular/material/core/theming/theming';`,
      `@use '~@angular/material/button/button-theme' as button;`,
      `@use '~@angular/material/table/table-theme' as table;`,
      // Leave one `@import` here to verify mixed usage.
      `@import '~@angular/material/option/option-theme';`,
      `@use '~@angular/cdk/overlay' as cdk;`,
      `@use '~@angular/material/datepicker/datepicker-theme' as datepicker;`,

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
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,
      `@use '~@angular/cdk' as cdk;`,

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
    const app = await createTestApp(runner);
    app.create('/theme.scss', [
      `@use '~@angular/material/core/index';`,
      `@use '~@angular/material/button/_button-theme';`,
      `@use '~@angular/material/table/table-theme.import';`,
      `@use '~@angular/material/datepicker/datepicker-theme.scss';`,

      `@include core.mat-core();`,
      `@include button-theme.mat-button-theme();`,
      `@include table-theme.mat-table-theme();`,
      `@include datepicker-theme.mat-datepicker-theme();`,
    ].join('\n'));

    const tree = await runner.runSchematicAsync('theming-api', options, app).toPromise();
    expect(getFileContent(tree, '/theme.scss').split('\n')).toEqual([
      `@use '~@angular/material' as mat;`,

      `@include mat.core();`,
      `@include mat.button-theme();`,
      `@include mat.table-theme();`,
      `@include mat.datepicker-theme();`,
    ]);
  });

});
