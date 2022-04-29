import {
  APP_MODULE_FILE,
  createNewTestRunner,
  migrateComponents,
} from '../components/test-setup-helper';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';

describe('button runtime code', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(APP_MODULE_FILE, oldFileContent);
    const tree = await migrateComponents(['button'], runner, cliAppTree);
    expect(tree.readContent(APP_MODULE_FILE)).toBe(newFileContent);
  }

  describe('import statements', () => {
    it('should replace the old import with the new one', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatButtonModule} from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButtonModule} from '@angular/material-experimental/mdc-button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should migrate multi-line imports', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {
          MatButton,
          MatButtonModule,
        } from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {
          MatButton,
          MatButtonModule,
        } from '@angular/material-experimental/mdc-button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should migrate multiple statements', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatButton} from '@angular/material/button';
        import {MatButtonModule} from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButton} from '@angular/material-experimental/mdc-button';
        import {MatButtonModule} from '@angular/material-experimental/mdc-button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should preserve import comments', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatButton /* comment */} from '@angular/material/button';
        import {MatButtonModule} from '@angular/material/button'; // a comment

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButton /* comment */} from '@angular/material-experimental/mdc-button';
        import {MatButtonModule} from '@angular/material-experimental/mdc-button'; // a comment

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });
  });

  describe('import expressions', () => {
    it('should replace the old import with the new one', async () => {
      await runMigrationTest(
        `
        const buttonModule = import('@angular/material/button');
      `,
        `
        const buttonModule = import('@angular/material-experimental/mdc-button');
      `,
      );
    });

    it('should replace type import expressions', async () => {
      await runMigrationTest(
        `
        let buttonModule: typeof import("@angular/material/button");
      `,
        `
        let buttonModule: typeof import("@angular/material-experimental/mdc-button");
      `,
      );
    });
  });
});
