import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('autocomplete styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['autocomplete'], runner, cliAppTree);
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
        @include mat.autocomplete-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.mdc-autocomplete-theme($theme);
        @include mat.mdc-autocomplete-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.autocomplete-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.mdc-autocomplete-theme($theme);
        @include arbitrary.mdc-autocomplete-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.autocomplete-theme($light-theme);
        @include mat.autocomplete-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.mdc-autocomplete-theme($light-theme);
        @include mat.mdc-autocomplete-typography($light-theme);
        @include mat.mdc-autocomplete-theme($dark-theme);
        @include mat.mdc-autocomplete-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.autocomplete-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.mdc-autocomplete-theme($theme);
        @include mat.mdc-autocomplete-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-autocomplete classname', async () => {
      await runMigrationTest(
        `
        .mat-autocomplete {
          padding: 16px;
        }
      `,
        `
        .mat-mdc-autocomplete {
          padding: 16px;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-autocomplete, .another-class {
          padding: 16px;
        }
      `,
        `
        .some-class.mat-mdc-autocomplete, .another-class {
          padding: 16px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-autocomplete,
        .another-class { padding: 16px; }
      `,
        `
        .some-class,
        .mat-mdc-autocomplete,
        .another-class { padding: 16px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-autocomplete-panel {
          background-color: red;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of autocomplete that may no longer apply for the MDC version. */

        .mat-autocomplete-panel {
          background-color: red;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-autocomplete-panel {
          background-color: red;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of autocomplete that may no longer apply for the MDC version. */

        .some-class
        .mat-autocomplete-panel {
          background-color: red;
        }
      `,
      );
    });

    it('should update the legacy mat-autocomplete class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-autocomplete.some-class, .mat-autocomplete-panel {
          padding: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of autocomplete that may no longer apply for the MDC version. */

        .mat-mdc-autocomplete.some-class, .mat-autocomplete-panel {
          padding: 16px;
        }
      `,
      );
    });
  });
});
