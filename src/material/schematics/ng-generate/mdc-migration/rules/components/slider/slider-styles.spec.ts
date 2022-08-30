import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('slider styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['slider'], runner, cliAppTree);
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
        @include mat.legacy-slider-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.slider-theme($theme);
        @include mat.slider-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-slider-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.slider-theme($theme);
        @include arbitrary.slider-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-slider-theme($light-theme);
        @include mat.legacy-slider-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.slider-theme($light-theme);
        @include mat.slider-typography($light-theme);
        @include mat.slider-theme($dark-theme);
        @include mat.slider-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-slider-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.slider-theme($theme);
        @include mat.slider-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-slider classname', async () => {
      await runMigrationTest(
        `
        .mat-slider {
          width: 100%;
        }
      `,
        `
        .mat-mdc-slider {
          width: 100%;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-slider-thumb {
          height: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of slider that may no longer apply for the MDC version. */

        .some-class
        .mat-slider-thumb {
          height: 16px;
        }
      `,
      );
    });

    it('should update the legacy mat-slider class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-slider.some-class, .mat-slider-thumb {
          background-color: transparent;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of slider that may no longer apply for the MDC version. */

        .mat-mdc-slider.some-class, .mat-slider-thumb {
          background-color: transparent;
        }
      `,
      );
    });
  });
});
