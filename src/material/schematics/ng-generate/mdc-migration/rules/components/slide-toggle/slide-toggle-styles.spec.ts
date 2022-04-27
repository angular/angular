import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('slide-toggle styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['slide-toggle'], runner, cliAppTree);
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
        @include mat.slide-toggle-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.mdc-slide-toggle-theme($theme);
        @include mat.mdc-slide-toggle-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.slide-toggle-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.mdc-slide-toggle-theme($theme);
        @include arbitrary.mdc-slide-toggle-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.slide-toggle-theme($light-theme);
        @include mat.slide-toggle-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.mdc-slide-toggle-theme($light-theme);
        @include mat.mdc-slide-toggle-typography($light-theme);
        @include mat.mdc-slide-toggle-theme($dark-theme);
        @include mat.mdc-slide-toggle-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.slide-toggle-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.mdc-slide-toggle-theme($theme);
        @include mat.mdc-slide-toggle-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-slide-toggle classname', async () => {
      await runMigrationTest(
        `
        .mat-slide-toggle {
          padding: 4px;
        }
      `,
        `
        .mat-mdc-slide-toggle {
          padding: 4px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-slide-toggle-thumb {
          height: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of slide-toggle that may no longer apply for the MDC version. */

        .mat-slide-toggle-thumb {
          height: 16px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-slide-toggle-thumb {
          height: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of slide-toggle that may no longer apply for the MDC version. */

        .some-class
        .mat-slide-toggle-thumb {
          height: 16px;
        }
      `,
      );
    });

    it('should update the legacy mat-slide-toggle class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-slide-toggle.some-class, .mat-slide-toggle-thumb {
          background-color: transparent;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of slide-toggle that may no longer apply for the MDC version. */

        .mat-mdc-slide-toggle.some-class, .mat-slide-toggle-thumb {
          background-color: transparent;
        }
      `,
      );
    });
  });
});
