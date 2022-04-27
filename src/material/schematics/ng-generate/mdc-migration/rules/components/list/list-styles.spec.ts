import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('list styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['list'], runner, cliAppTree);
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
        @include mat.list-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.mdc-list-theme($theme);
        @include mat.mdc-list-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.list-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.mdc-list-theme($theme);
        @include arbitrary.mdc-list-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.list-theme($light-theme);
        @include mat.list-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.mdc-list-theme($light-theme);
        @include mat.mdc-list-typography($light-theme);
        @include mat.mdc-list-theme($dark-theme);
        @include mat.mdc-list-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.list-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.mdc-list-theme($theme);
        @include mat.mdc-list-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-list classname', async () => {
      await runMigrationTest(
        `
        .mat-list {
          padding: 25px;
        }
      `,
        `
        .mat-mdc-list {
          padding: 25px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-list {
          padding: 25px;
        }
        .mat-subheader {
          color: red;
        }
      `,
        `
        .mat-mdc-list {
          padding: 25px;
        }
        .mat-mdc-subheader {
          color: red;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-list, .another-class {
          padding: 25px;
        }
      `,
        `
        .some-class.mat-mdc-list, .another-class {
          padding: 25px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-list,
        .another-class { padding: 25px; }
      `,
        `
        .some-class,
        .mat-mdc-list,
        .another-class { padding: 25px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-list-item-content {
          padding: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of list that may no longer apply for the MDC version. */

        .mat-list-item-content {
          padding: 16px;
        }
      `,
      );
    });

    it('should not add comment for legacy selector that also starts with deprecated prefix', async () => {
      await runMigrationTest(
        `
        .mat-list-icon {
          color: red;
        }
      `,
        `
        .mat-mdc-list-item-icon {
          color: red;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-list-item-content {
          padding: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of list that may no longer apply for the MDC version. */

        .some-class
        .mat-list-item-content {
          padding: 16px;
        }
      `,
      );
    });

    it('should update the legacy mat-list class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-list.some-class, .mat-list-item-content {
          padding: 16px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of list that may no longer apply for the MDC version. */

        .mat-mdc-list.some-class, .mat-list-item-content {
          padding: 16px;
        }
      `,
      );
    });
  });
});
