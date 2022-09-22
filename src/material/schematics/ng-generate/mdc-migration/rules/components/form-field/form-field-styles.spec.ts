import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('form-field styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['form-field'], runner, cliAppTree);
    expect(tree.readContent(THEME_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  describe('mixin migrations', () => {
    it('should replace the old theme with the new ones', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-form-field-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.form-field-theme($theme);
        @include mat.form-field-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-form-field-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.form-field-theme($theme);
        @include arbitrary.form-field-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-form-field-theme($light-theme);
        @include mat.legacy-form-field-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.form-field-theme($light-theme);
        @include mat.form-field-typography($light-theme);
        @include mat.form-field-theme($dark-theme);
        @include mat.form-field-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-form-field-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.form-field-theme($theme);
        @include mat.form-field-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-form-field classname', async () => {
      await runMigrationTest(
        `
        .mat-form-field {
          padding: 16px;
        }
      `,
        `
        .mat-mdc-form-field {
          padding: 16px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-form-field {
          padding: 16px;
        }
        .mat-hint {
          color: red;
        }
      `,
        `
        .mat-mdc-form-field {
          padding: 16px;
        }
        .mat-mdc-form-field-hint {
          color: red;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-form-field, .another-class {
          padding: 16px;
        }
      `,
        `
        .some-class.mat-mdc-form-field, .another-class {
          padding: 16px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-form-field,
        .another-class { padding: 16px; }
      `,
        `
        .some-class,
        .mat-mdc-form-field,
        .another-class { padding: 16px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-form-field-wrapper {
          padding: 16px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of form-field that may no longer apply for the MDC version. */
        .mat-form-field-wrapper {
          padding: 16px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-form-field-wrapper {
          padding: 16px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of form-field that may no longer apply for the MDC version. */
        .some-class
        .mat-form-field-wrapper {
          padding: 16px;
        }
      `,
      );
    });

    it('should update the legacy mat-form-field class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-form-field.some-class, .mat-form-field-wrapper {
          padding: 16px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of form-field that may no longer apply for the MDC version. */
        .mat-mdc-form-field.some-class, .mat-form-field-wrapper {
          padding: 16px;
        }
      `,
      );
    });
  });
});
