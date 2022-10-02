import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('optgroup styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['optgroup'], runner, cliAppTree);
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
        @include mat.legacy-optgroup-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.optgroup-theme($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-optgroup-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.optgroup-theme($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-optgroup-theme($light-theme);
        @include mat.legacy-optgroup-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.optgroup-theme($light-theme);
        @include mat.optgroup-theme($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-optgroup-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.optgroup-theme($theme);


      `,
      );
    });

    it('should update color mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-optgroup-color($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.optgroup-color($theme);
      `,
      );
    });

    it('should update typography mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-optgroup-typography($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.optgroup-typography($theme);
      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-optgroup classname', async () => {
      await runMigrationTest(
        `
        .mat-optgroup .mat-optgroup-label {
          width: 50%;
        }
      `,
        `
        .mat-mdc-optgroup .mat-mdc-optgroup-label {
          width: 50%;
        }
      `,
      );
    });
  });
});
