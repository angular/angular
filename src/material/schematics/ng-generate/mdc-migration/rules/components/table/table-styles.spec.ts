import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('table styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['table'], runner, cliAppTree);
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
        @include mat.legacy-table-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.table-theme($theme);
        @include mat.table-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-table-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.table-theme($theme);
        @include arbitrary.table-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-table-theme($light-theme);
        @include mat.legacy-table-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.table-theme($light-theme);
        @include mat.table-typography($light-theme);
        @include mat.table-theme($dark-theme);
        @include mat.table-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-table-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.table-theme($theme);
        @include mat.table-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-table classname', async () => {
      await runMigrationTest(
        `
        .mat-table {
          padding: 4px;
        }
      `,
        `
        .mat-mdc-table {
          padding: 4px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-header-row {
          background: red;
        }
        .mat-footer-row {
          background: red;
        }
      `,
        `
        .mat-mdc-header-row {
          background: red;
        }
        .mat-mdc-footer-row {
          background: red;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-table-sticky-border-elem-left, .another-class {
          border-right: 2px solid red;
        }
      `,
        `
        .some-class.mat-mdc-table-sticky-border-elem-left, .another-class {
          border-right: 2px solid red;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-table,
        .another-class { padding: 4px; }
      `,
        `
        .some-class,
        .mat-mdc-table,
        .another-class { padding: 4px; }
      `,
      );
    });
  });
});
