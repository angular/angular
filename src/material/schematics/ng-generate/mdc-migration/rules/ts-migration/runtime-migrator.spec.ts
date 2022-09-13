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
    const tree = await migrateComponents(['button', 'card', 'dialog'], runner, cliAppTree);
    expect(tree.readContent(APP_MODULE_FILE)).toBe(newFileContent);
  }

  describe('import statements', () => {
    it('should replace the old import with the new one', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyButtonModule} from '@angular/material/legacy-button';

        @NgModule({imports: [MatLegacyButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButtonModule} from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should replace the old imports with the new ones', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyDialogModule, MAT_LEGACY_DIALOG_DEFAULT_OPTIONS} from '@angular/material/legacy-dialog';

        @NgModule({imports: [MatLegacyDialogModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS} from '@angular/material/dialog';

        @NgModule({imports: [MatDialogModule]})
        export class AppModule {}
      `,
      );
    });

    it('should migrate multi-line imports', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {
          MatLegacyButton,
          MatLegacyButtonModule,
        } from '@angular/material/legacy-button';

        @NgModule({imports: [MatLegacyButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {
          MatButton,
          MatButtonModule,
        } from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should migrate multi-line imports with aliases', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {
          MatLegacyButton as MatButton,
          MatLegacyButtonModule as MatButtonModule,
        } from '@angular/material/legacy-button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {
          MatButton,
          MatButtonModule,
        } from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should migrate multiple statements', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyButton} from '@angular/material/legacy-button';
        import {MatLegacyButtonModule} from '@angular/material/legacy-button';

        @NgModule({imports: [MatLegacyButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButton} from '@angular/material/button';
        import {MatButtonModule} from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should migrate multiple statements with aliases', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyButton as MatButton} from '@angular/material/legacy-button';
        import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButton} from '@angular/material/button';
        import {MatButtonModule} from '@angular/material/button';

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should preserve import comments', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyButton /* comment */} from '@angular/material/legacy-button';
        import {MatLegacyButtonModule} from '@angular/material/legacy-button'; // a comment

        @NgModule({imports: [MatLegacyButtonModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButton /* comment */} from '@angular/material/button';
        import {MatButtonModule} from '@angular/material/button'; // a comment

        @NgModule({imports: [MatButtonModule]})
        export class AppModule {}
      `,
      );
    });

    it('should also migrate re-exported modules', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyButtonModule} from '@angular/material/legacy-button';

        @NgModule({
          imports: [MatLegacyButtonModule],
          exports: [MatLegacyButtonModule],
        })
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatButtonModule} from '@angular/material/button';

        @NgModule({
          imports: [MatButtonModule],
          exports: [MatButtonModule],
        })
        export class AppModule {}
      `,
      );
    });

    it('should migrate module in standalone components', async () => {
      await runMigrationTest(
        `
        @Component({
          standalone: true,
          selector: 'button-example',
          imports: [MatLegacyButton, MatLegacyButtonModule]
        })
        class ButtonExample {}
      `,
        `
        @Component({
          standalone: true,
          selector: 'button-example',
          imports: [MatButton, MatButtonModule]
        })
        class ButtonExample {}
      `,
      );
    });

    it('should not migrate import for unmigrated component', async () => {
      await runMigrationTest(
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyRadioModule} from '@angular/material/legacy-radio';

        @NgModule({imports: [MatLegacyRadioModule]})
        export class AppModule {}
      `,
        `
        import {NgModule} from '@angular/core';
        import {MatLegacyRadioModule} from '@angular/material/legacy-radio';

        @NgModule({imports: [MatLegacyRadioModule]})
        export class AppModule {}
      `,
      );
    });

    it('should migrate styles for a component', async () => {
      await runMigrationTest(
        `
        @Component({
          selector: 'button-example',
          template: '<button mat-button>Learn More</button>',
          styles: ['.mat-button { background: lavender; }'],
        })
        class ButtonExample {}
      `,
        `
        @Component({
          selector: 'button-example',
          template: '<button mat-button>Learn More</button>',
          styles: ['.mat-mdc-button { background: lavender; }'],
        })
        class ButtonExample {}
      `,
      );
    });

    it('should migrate multiline styles for a component', async () => {
      // Note: The spaces in the last style are to perserve indentation on the
      // new line between the comment and rule
      await runMigrationTest(
        `
        @Component({
          selector: "button-example",
          template: "<button mat-button>Learn More</button>",
          styles: [
            ".mat-button { padding: 12px; }",
            "::ng-deep .mat-button-wrapper{ color: darkblue; }"
          ],
        })
        class ButtonExample {}
      `,
        `
        @Component({
          selector: "button-example",
          template: "<button mat-button>Learn More</button>",
          styles: [
            ".mat-mdc-button { padding: 12px; }",
            \`
            /* TODO: The following rule targets internal classes of button that may no longer apply for the MDC version. */
            \n            ::ng-deep .mat-button-wrapper{ color: darkblue; }\`
          ],
        })
        class ButtonExample {}
      `,
      );
    });

    it('should migrate template for a component', async () => {
      await runMigrationTest(
        `
        @Component({
          selector: 'card-example',
          template: '<mat-card>Learn More</mat-card>',
        })
        class CardExample {}
      `,
        `
        @Component({
          selector: 'card-example',
          template: '<mat-card appearance="outlined">Learn More</mat-card>',
        })
        class CardExample {}
      `,
      );
    });

    it('should migrate multiline template for a component', async () => {
      // Note: The spaces in the last style are to perserve indentation on the
      // new line between the comment and rule
      await runMigrationTest(
        `
        @Component({
          selector: 'card-example',
          template: \`<mat-card>
            Learn More
          </mat-card>
          \`,
        })
        class CardExample {}
      `,
        `
        @Component({
          selector: 'card-example',
          template: \`<mat-card appearance="outlined">
            Learn More
          </mat-card>
          \`,
        })
        class CardExample {}
      `,
      );
    });

    it('should migrate template and styles for a component', async () => {
      await runMigrationTest(
        `
        @Component({
          selector: 'card-example',
          template: '<mat-card>Learn More</mat-card>',
          styles: ['.mat-card { padding-right: 4px; }'],
        })
        class CardExample {}
      `,
        `
        @Component({
          selector: 'card-example',
          template: '<mat-card appearance="outlined">Learn More</mat-card>',
          styles: ['.mat-mdc-card { padding-right: 4px; }'],
        })
        class CardExample {}
      `,
      );
    });

    it('should migrate imports, template, and styles for a component', async () => {
      await runMigrationTest(
        `
        @Component({
          standalone: true,
          selector: 'card-example',
          imports: [MatLegacyCardModule],
          template: '<mat-card>Learn More</mat-card>',
          styles: ['.mat-card { padding-right: 4px; }'],
        })
        class CardExample {}
      `,
        `
        @Component({
          standalone: true,
          selector: 'card-example',
          imports: [MatCardModule],
          template: '<mat-card appearance="outlined">Learn More</mat-card>',
          styles: ['.mat-mdc-card { padding-right: 4px; }'],
        })
        class CardExample {}
      `,
      );
    });
  });

  describe('import expressions', () => {
    it('should replace the old import with the new one', async () => {
      await runMigrationTest(
        `
        const buttonModule = import('@angular/material/legacy-button');
      `,
        `
        const buttonModule = import('@angular/material/button');
      `,
      );
    });

    it('should replace type import expressions', async () => {
      await runMigrationTest(
        `
        let buttonModule: typeof import("@angular/material/legacy-button");
      `,
        `
        let buttonModule: typeof import("@angular/material/button");
      `,
      );
    });
  });
});
