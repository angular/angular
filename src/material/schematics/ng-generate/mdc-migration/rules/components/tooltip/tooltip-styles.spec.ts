import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('tooltip styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['tooltip'], runner, cliAppTree);
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
        @include mat.legacy-tooltip-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.tooltip-theme($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-tooltip-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.tooltip-theme($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-tooltip-theme($light-theme);
        @include mat.legacy-tooltip-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.tooltip-theme($light-theme);
        @include mat.tooltip-theme($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-tooltip-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.tooltip-theme($theme);


      `,
      );
    });

    it('should update color mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-tooltip-color($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.tooltip-color($theme);
      `,
      );
    });

    it('should update typography mixin', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.legacy-tooltip-typography($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.tooltip-typography($theme);
      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-tooltip classname', async () => {
      await runMigrationTest(
        `
        .mat-tooltip {
          font-size: 24px;
        }
      `,
        `
        .mat-mdc-tooltip {
          font-size: 24px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-tooltip {
          font-size: 24px;
        }
        .mat-tooltip-panel {
          padding: 12px;
        }
      `,
        `
        .mat-mdc-tooltip {
          font-size: 24px;
        }
        .mat-mdc-tooltip-panel {
          padding: 12px;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-tooltip, .another-class {
          font-size: 24px;
        }
      `,
        `
        .some-class.mat-mdc-tooltip, .another-class {
          font-size: 24px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-tooltip,
        .another-class { font-size: 24px; }
      `,
        `
        .some-class,
        .mat-mdc-tooltip,
        .another-class { font-size: 24px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-tooltip-handset {
          font-size: 24px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of tooltip that may no longer apply for the MDC version. */
        .mat-tooltip-handset {
          font-size: 24px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-tooltip-handset {
          font-size: 24px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of tooltip that may no longer apply for the MDC version. */
        .some-class
        .mat-tooltip-handset {
          font-size: 24px;
        }
      `,
      );
    });

    it('should update the legacy mat-tooltip class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-tooltip.some-class, .mat-tooltip-handset {
          font-size: 24px;
        }
      `,
        `
        /* TODO(mdc-migration): The following rule targets internal classes of tooltip that may no longer apply for the MDC version. */
        .mat-mdc-tooltip.some-class, .mat-tooltip-handset {
          font-size: 24px;
        }
      `,
      );
    });
  });
});
