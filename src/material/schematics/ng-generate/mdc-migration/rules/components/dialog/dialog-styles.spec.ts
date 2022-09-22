import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('dialog styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['dialog'], runner, cliAppTree);
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
        @include mat.legacy-dialog-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.dialog-theme($theme);
        @include mat.dialog-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-dialog-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.dialog-theme($theme);
        @include arbitrary.dialog-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-dialog-theme($light-theme);
        @include mat.legacy-dialog-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.dialog-theme($light-theme);
        @include mat.dialog-typography($light-theme);
        @include mat.dialog-theme($dark-theme);
        @include mat.dialog-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-dialog-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.dialog-theme($theme);
        @include mat.dialog-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-dialog classname', async () => {
      await runMigrationTest(
        `
        .mat-dialog {
          background: red;
        }
      `,
        `
        .mat-mdc-dialog {
          background: red;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-dialog {
          background: red;
        }
        .mat-dialog-container {
          padding: 25px;
        }
      `,
        `
        .mat-mdc-dialog {
          background: red;
        }
        .mat-mdc-dialog-container {
          padding: 25px;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-dialog, .another-class {
          background: red;
        }
      `,
        `
        .some-class.mat-mdc-dialog, .another-class {
          background: red;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-dialog-content,
        .another-class { padding: 16px; }
      `,
        `
        .some-class,
        .mat-mdc-dialog-content,
        .another-class { padding: 16px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-dialog-close {
          font-size: 24px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of dialog that may no longer apply for the MDC version. */
        .mat-dialog-close {
          font-size: 24px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-dialog-close {
          font-size: 24px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of dialog that may no longer apply for the MDC version. */
        .some-class
        .mat-dialog-close {
          font-size: 24px;
        }
      `,
      );
    });

    it('should update the legacy mat-dialog class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-dialog.some-class, .mat-dialog-close {
          font-size: 24px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of dialog that may no longer apply for the MDC version. */
        .mat-mdc-dialog.some-class, .mat-dialog-close {
          font-size: 24px;
        }
      `,
      );
    });
  });
});
