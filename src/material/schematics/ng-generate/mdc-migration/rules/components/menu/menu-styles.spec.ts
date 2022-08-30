import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('menu styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents(['menu'], runner, cliAppTree);
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
        @include mat.legacy-menu-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.menu-theme($theme);
        @include mat.menu-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.legacy-menu-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.menu-theme($theme);
        @include arbitrary.menu-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.legacy-menu-theme($light-theme);
        @include mat.legacy-menu-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.menu-theme($light-theme);
        @include mat.menu-typography($light-theme);
        @include mat.menu-theme($dark-theme);
        @include mat.menu-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.legacy-menu-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.menu-theme($theme);
        @include mat.menu-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-menu-panel classname', async () => {
      await runMigrationTest(
        `
        .mat-menu-panel {
          padding: 12px;
        }
      `,
        `
        .mat-mdc-menu-panel {
          padding: 12px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-menu-panel {
          padding: 12px;
        }
        .mat-menu-item {
          border: solid;
        }
      `,
        `
        .mat-mdc-menu-panel {
          padding: 12px;
        }
        .mat-mdc-menu-item {
          border: solid;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-menu-panel, .another-class {
          padding: 12px;
        }
      `,
        `
        .some-class.mat-mdc-menu-panel, .another-class {
          padding: 12px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-menu-panel,
        .another-class { padding: 12px; }
      `,
        `
        .some-class,
        .mat-mdc-menu-panel,
        .another-class { padding: 12px; }
      `,
      );
    });

    it('should add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-menu-submenu-icon {
          padding: 12px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of menu that may no longer apply for the MDC version. */

        .mat-menu-submenu-icon {
          padding: 12px;
        }
      `,
      );
    });

    it('should add comment for potentially deprecated multi-line selector', async () => {
      await runMigrationTest(
        `
        .some-class
        .mat-menu-submenu-icon {
          padding: 12px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of menu that may no longer apply for the MDC version. */

        .some-class
        .mat-menu-submenu-icon {
          padding: 12px;
        }
      `,
      );
    });

    it('should update the legacy mat-menu-panel class and add comment for potentially deprecated selector', async () => {
      await runMigrationTest(
        `
        .mat-menu-panel.some-class, .mat-menu-submenu-icon {
          padding: 12px;
        }
      `,
        `
        /* TODO: The following rule targets internal classes of menu that may no longer apply for the MDC version. */

        .mat-mdc-menu-panel.some-class, .mat-menu-submenu-icon {
          padding: 12px;
        }
      `,
      );
    });
  });
});
