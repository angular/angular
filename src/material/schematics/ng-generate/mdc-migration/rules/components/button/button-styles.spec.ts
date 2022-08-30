import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('button styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['button'], runner, cliAppTree);
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
        @include mat.legacy-button-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.button-theme($theme);
        @include mat.button-typography($theme);
        @include mat.fab-theme($theme);
        @include mat.fab-typography($theme);
        @include mat.icon-button-theme($theme);
        @include mat.icon-button-typography($theme);
      `,
      );
    });

    it('should replace the old theme with the non-duplicated new ones', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.button-theme($theme);
        @include mat.button-typography($theme);
        @include mat.legacy-button-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.button-theme($theme);
        @include mat.button-typography($theme);
        @include mat.fab-theme($theme);
        @include mat.fab-typography($theme);
        @include mat.icon-button-theme($theme);
        @include mat.icon-button-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-button-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.button-theme($theme);
        @include arbitrary.button-typography($theme);
        @include arbitrary.fab-theme($theme);
        @include arbitrary.fab-typography($theme);
        @include arbitrary.icon-button-theme($theme);
        @include arbitrary.icon-button-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-button-theme($light-theme);
        @include mat.legacy-button-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.button-theme($light-theme);
        @include mat.button-typography($light-theme);
        @include mat.fab-theme($light-theme);
        @include mat.fab-typography($light-theme);
        @include mat.icon-button-theme($light-theme);
        @include mat.icon-button-typography($light-theme);
        @include mat.button-theme($dark-theme);
        @include mat.button-typography($dark-theme);
        @include mat.fab-theme($dark-theme);
        @include mat.fab-typography($dark-theme);
        @include mat.icon-button-theme($dark-theme);
        @include mat.icon-button-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-button-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.button-theme($theme);
        @include mat.button-typography($theme);
        @include mat.fab-theme($theme);
        @include mat.fab-typography($theme);
        @include mat.icon-button-theme($theme);
        @include mat.icon-button-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-button classname', async () => {
      await runMigrationTest(
        `
        .mat-button {
          padding: 50px;
        }
      `,
        `
        .mat-mdc-button {
          padding: 50px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-button {
          padding: 50px;
        }
        .mat-raised-button {
          padding: 25px;
        }
      `,
        `
        .mat-mdc-button {
          padding: 50px;
        }
        .mat-mdc-raised-button {
          padding: 25px;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-button, .another-class {
          padding: 50px;
        }
      `,
        `
        .some-class.mat-mdc-button, .another-class {
          padding: 50px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-button,
        .another-class { padding: 50px; }
      `,
        `
        .some-class,
        .mat-mdc-button,
        .another-class { padding: 50px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-button-focus-overlay {
          background-color: transparent;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of button that may no longer apply for the MDC version. */

        .mat-button-focus-overlay {
          background-color: transparent;
        }
      `,
      );
    });

    it('should not add comment for legacy selector that also starts with deprecated prefix', async () => {
      await runMigrationTest(
        `
        .mat-button-base {
          padding: 12px;
        }
      `,
        `
        .mat-mdc-button-base {
          padding: 12px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-button-focus-overlay {
          background-color: transparent;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of button that may no longer apply for the MDC version. */

        .some-class
        .mat-button-focus-overlay {
          background-color: transparent;
        }
      `,
      );
    });

    it('should update the legacy mat-button class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-fab.some-class, .mat-button-focus-overlay {
          background-color: transparent;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of button that may no longer apply for the MDC version. */

        .mat-mdc-fab.some-class, .mat-button-focus-overlay {
          background-color: transparent;
        }
      `,
      );
    });
  });
});
