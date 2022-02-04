import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponent, THEME_FILE} from '../util';

describe('button styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponent('button', runner, cliAppTree);
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
        @include mat.button-theme($theme);
      `,
        `
        @use '@angular/material' as mat;
        $theme: ();
        @include mat.mdc-button-theme($theme);
        @include mat.mdc-button-typography($theme);
        @include mat.mdc-fab-theme($theme);
        @include mat.mdc-fab-typography($theme);
        @include mat.mdc-icon-button-theme($theme);
        @include mat.mdc-icon-button-typography($theme);
      `,
      );
    });

    it('should use the correct namespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.button-theme($theme);
      `,
        `
        @use '@angular/material' as arbitrary;
        $theme: ();
        @include arbitrary.mdc-button-theme($theme);
        @include arbitrary.mdc-button-typography($theme);
        @include arbitrary.mdc-fab-theme($theme);
        @include arbitrary.mdc-fab-typography($theme);
        @include arbitrary.mdc-icon-button-theme($theme);
        @include arbitrary.mdc-icon-button-typography($theme);
      `,
      );
    });

    it('should handle updating multiple themes', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.button-theme($light-theme);
        @include mat.button-theme($dark-theme);
      `,
        `
        @use '@angular/material' as mat;
        $light-theme: ();
        $dark-theme: ();
        @include mat.mdc-button-theme($light-theme);
        @include mat.mdc-button-typography($light-theme);
        @include mat.mdc-fab-theme($light-theme);
        @include mat.mdc-fab-typography($light-theme);
        @include mat.mdc-icon-button-theme($light-theme);
        @include mat.mdc-icon-button-typography($light-theme);
        @include mat.mdc-button-theme($dark-theme);
        @include mat.mdc-button-typography($dark-theme);
        @include mat.mdc-fab-theme($dark-theme);
        @include mat.mdc-fab-typography($dark-theme);
        @include mat.mdc-icon-button-theme($dark-theme);
        @include mat.mdc-icon-button-typography($dark-theme);
      `,
      );
    });

    it('should preserve whitespace', async () => {
      await runMigrationTest(
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.button-theme($theme);


      `,
        `
        @use '@angular/material' as mat;
        $theme: ();


        @include mat.mdc-button-theme($theme);
        @include mat.mdc-button-typography($theme);
        @include mat.mdc-fab-theme($theme);
        @include mat.mdc-fab-typography($theme);
        @include mat.mdc-icon-button-theme($theme);
        @include mat.mdc-icon-button-typography($theme);


      `,
      );
    });
  });

  describe('selector migrations', () => {
    it('should update the legacy mat-button classname', async () => {
      await runMigrationTest(
        `
        .mat-button {
          padding: 50px;
        }
      `,
        `
        .mat-mdc-button {
          padding: 50px;
        }
      `,
      );
    });

    it('should update multiple legacy classnames', async () => {
      await runMigrationTest(
        `
        .mat-button {
          padding: 50px;
        }
        .mat-button-base {
          padding: 25px;
        }
      `,
        `
        .mat-mdc-button {
          padding: 50px;
        }
        .mat-mdc-button-base {
          padding: 25px;
        }
      `,
      );
    });

    it('should update a legacy classname w/ multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class.mat-button, .another-class {
          padding: 50px;
        }
      `,
        `
        .some-class.mat-mdc-button, .another-class {
          padding: 50px;
        }
      `,
      );
    });

    it('should preserve the whitespace of multiple selectors', async () => {
      await runMigrationTest(
        `
        .some-class,
        .mat-button,
        .another-class { padding: 50px; }
      `,
        `
        .some-class,
        .mat-mdc-button,
        .another-class { padding: 50px; }
      `,
      );
    });
  });
});
