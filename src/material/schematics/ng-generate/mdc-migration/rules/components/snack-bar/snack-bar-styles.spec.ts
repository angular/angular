import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('snack-bar styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['snack-bar'], runner, cliAppTree);
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
        @include mat.legacy-snack-bar-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.snack-bar-theme($theme);
        @include mat.button-theme($theme);
      `,
      );
    });

    it('should replace the old theme with the new ones and keep the non MDC button theme', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-button-theme($theme);
        @include mat.legacy-snack-bar-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-button-theme($theme);
        @include mat.snack-bar-theme($theme);
        @include mat.button-theme($theme);
      `,
      );
    });

    it('should replace the old theme with the non-duplicated new ones', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-snack-bar-theme($theme);
        @include mat.button-theme($theme);
        @include mat.button-typography($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.snack-bar-theme($theme);
        @include mat.button-theme($theme);
        @include mat.button-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-snack-bar-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.snack-bar-theme($theme);
        @include arbitrary.button-theme($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-snack-bar-theme($light-theme);
        @include mat.legacy-snack-bar-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.snack-bar-theme($light-theme);
        @include mat.button-theme($light-theme);
        @include mat.snack-bar-theme($dark-theme);
        @include mat.button-theme($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-snack-bar-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.snack-bar-theme($theme);
        @include mat.button-theme($theme);


      `,
      );
    });

    it('should update color mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-snack-bar-color($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.snack-bar-color($theme);
        @include mat.button-color($theme);
      `,
      );
    });

    it('should update typography mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-snack-bar-typography($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.snack-bar-typography($theme);
        @include mat.button-typography($theme);
      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-snack-bar-container classname', async () => {
      await runMigrationTest(
        `
        .mat-snack-bar-container {
          padding: 24px;
        }
      `,
        `
        .mat-mdc-snack-bar-container {
          padding: 24px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-snack-bar-container {
          padding: 24px;
        }
        .mat-simple-snackbar {
          color: red;
        }
      `,
        `
        .mat-mdc-snack-bar-container {
          padding: 24px;
        }
        .mat-mdc-simple-snack-bar {
          color: red;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-snack-bar-container, .another-class {
          padding: 24px;
        }
      `,
        `
        .some-class.mat-mdc-snack-bar-container, .another-class {
          padding: 24px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-snack-bar-container,
        .another-class { padding: 24px; }
      `,
        `
        .some-class,
        .mat-mdc-snack-bar-container,
        .another-class { padding: 24px; }
      `,
      );
    });
  });
});
