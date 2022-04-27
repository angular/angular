import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('checkbox styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['checkbox'], runner, cliAppTree);
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
        @include mat.checkbox-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.mdc-checkbox-theme($theme);
        @include mat.mdc-checkbox-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.checkbox-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.mdc-checkbox-theme($theme);
        @include arbitrary.mdc-checkbox-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.checkbox-theme($light-theme);
        @include mat.checkbox-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.mdc-checkbox-theme($light-theme);
        @include mat.mdc-checkbox-typography($light-theme);
        @include mat.mdc-checkbox-theme($dark-theme);
        @include mat.mdc-checkbox-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.checkbox-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.mdc-checkbox-theme($theme);
        @include mat.mdc-checkbox-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-checkbox classname', async () => {
      await runMigrationTest(
        `
        .mat-checkbox {
          padding-right: 4px;
        }
      `,
        `
        .mat-mdc-checkbox {
          padding-right: 4px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-checkbox-label {
          font-size: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of checkbox that may no longer apply for the MDC version. */

        .mat-checkbox-label {
          font-size: 16px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-checkbox-label {
          font-size: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of checkbox that may no longer apply for the MDC version. */

        .some-class
        .mat-checkbox-label {
          font-size: 16px;
        }
      `,
      );
    });

    it('should update the legacy mat-checkbox class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-checkbox.some-class, .mat-checkbox-label {
          background-color: transparent;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of checkbox that may no longer apply for the MDC version. */

        .mat-mdc-checkbox.some-class, .mat-checkbox-label {
          background-color: transparent;
        }
      `,
      );
    });
  });
});
