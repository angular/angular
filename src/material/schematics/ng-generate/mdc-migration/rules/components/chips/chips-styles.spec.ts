import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('chips styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['chips'], runner, cliAppTree);
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
        @include mat.legacy-chips-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.chips-theme($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-chips-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.chips-theme($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-chips-theme($light-theme);
        @include mat.legacy-chips-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.chips-theme($light-theme);
        @include mat.chips-theme($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-chips-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.chips-theme($theme);


      `,
      );
    });

    it('should update color mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-chips-color($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.chips-color($theme);
      `,
      );
    });

    it('should update typography mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-chips-typography($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.chips-typography($theme);
      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-chip classname', async () => {
      await runMigrationTest(
        `
        .mat-chip {
          padding: 50px;
        }
      `,
        `
        .mat-mdc-chip {
          padding: 50px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-chip {
          height: 50px;
        }
        .mat-basic-chip {
          background: red;
        }
      `,
        `
        .mat-mdc-chip {
          height: 50px;
        }
        .mat-mdc-basic-chip {
          background: red;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-chip, .another-class {
          height: 50px;
        }
      `,
        `
        .some-class.mat-mdc-chip, .another-class {
          height: 50px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-chip,
        .another-class { height: 50px; }
      `,
        `
        .some-class,
        .mat-mdc-chip,
        .another-class { height: 50px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-chip-avatar {
          border-radius: 4px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of chips that may no longer apply for the MDC version. */
        .mat-chip-avatar {
          border-radius: 4px;
        }
      `,
      );
    });

    it('should not add comment for legacy selector that also starts with deprecated prefix', async () => {
      await runMigrationTest(
        `
        .mat-chip-grid {
          padding: 12px;
        }
      `,
        `
        .mat-mdc-chip-grid {
          padding: 12px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-chip-avatar {
          border-radius: 4px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of chips that may no longer apply for the MDC version. */
        .some-class
        .mat-chip-avatar {
          border-radius: 4px;
        }
      `,
      );
    });

    it('should update the legacy mat-chip class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-chip.some-class, .mat-chip-avatar {
          border-radius: 4px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of chips that may no longer apply for the MDC version. */
        .mat-mdc-chip.some-class, .mat-chip-avatar {
          border-radius: 4px;
        }
      `,
      );
    });
  });
});
