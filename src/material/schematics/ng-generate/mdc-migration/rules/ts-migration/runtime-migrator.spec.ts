import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {join} from 'path';
import {
  APP_MODULE_FILE,
  createNewTestRunner,
  migrateComponents,
  TS_CONFIG,
  APP_ROOT,
} from '../components/test-setup-helper';

describe('runtime code migration', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(APP_MODULE_FILE, oldFileContent);
    const tree = await migrateComponents(
      ['button', 'card', 'chips', 'dialog', 'progress-bar'],
      runner,
      cliAppTree,
    );
    expect(tree.readContent(APP_MODULE_FILE)).toBe(newFileContent);
  }

  /** Declares library symbols used for type checking during the migration. */
  function declareLibrarySymbols(moduleName: string, content: string) {
    const dtsPath = join(APP_ROOT, `${moduleName}.d.ts`);

    cliAppTree.create(dtsPath, content);

    cliAppTree.overwrite(
      TS_CONFIG,
      JSON.stringify({
        compilerOptions: {
          paths: {
            [`@angular/material/${moduleName}`]: [dtsPath],
          },
        },
      }),
    );
  }

  it('should replace the old import with the new one', async () => {
    declareLibrarySymbols('legacy-button', 'export declare class MatLegacyButtonModule {};');

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

  it('should replace the old import with the new one for hyphenated component names', async () => {
    declareLibrarySymbols(
      'legacy-progress-bar',
      'export declare class MatLegacyProgressBarModule {};',
    );

    await runMigrationTest(
      `
        import {NgModule} from '@angular/core';
        import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';

        @NgModule({imports: [MatLegacyProgressBarModule]})
        export class AppModule {}
      `,
      `
        import {NgModule} from '@angular/core';
        import {MatProgressBarModule} from '@angular/material/progress-bar';

        @NgModule({imports: [MatProgressBarModule]})
        export class AppModule {}
      `,
    );
  });

  it('should replace the old imports with the new ones', async () => {
    declareLibrarySymbols(
      'legacy-dialog',
      `
        export declare class MatLegacyDialogModule {};
        export declare const MAT_LEGACY_DIALOG_DEFAULT_OPTIONS: {};
      `,
    );

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

  it('should replace the old imports with the new ones including different specified module name prefixes', async () => {
    declareLibrarySymbols(
      'legacy-chips',
      `
        export declare class MatLegacyChipsModule {};
        export declare class MatLegacyChipEvent {};
      `,
    );

    await runMigrationTest(
      `
        import {NgModule} from '@angular/core';
        import {MatLegacyChipsModule, MatLegacyChipEvent} from '@angular/material/legacy-chips';

        @NgModule({imports: [MatLegacyChipsModule]})
        export class AppModule {}
      `,
      `
        import {NgModule} from '@angular/core';
        import {MatChipsModule, MatChipEvent} from '@angular/material/chips';

        @NgModule({imports: [MatChipsModule]})
        export class AppModule {}
      `,
    );
  });

  it('should replace the old imports with the new ones including custom replacements', async () => {
    declareLibrarySymbols(
      'legacy-dialog',
      `
          export declare class MatLegacyDialogModule {};
          export declare type LegacyDialogRole = 'dialog' | 'alertdialog';
        `,
    );

    await runMigrationTest(
      `
        import {NgModule} from '@angular/core';
        import {MatLegacyDialogModule, LegacyDialogRole} from '@angular/material/legacy-dialog';

        @NgModule({imports: [MatLegacyDialogModule]})
        export class AppModule {}
      `,
      `
        import {NgModule} from '@angular/core';
        import {MatDialogModule, DialogRole} from '@angular/material/dialog';

        @NgModule({imports: [MatDialogModule]})
        export class AppModule {}
      `,
    );
  });

  it('should migrate multi-line imports', async () => {
    declareLibrarySymbols(
      'legacy-button',
      `
        export declare class MatLegacyButton {};
        export declare class MatLegacyButtonModule {};
      `,
    );

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
    declareLibrarySymbols(
      'legacy-button',
      `
          export declare class MatLegacyButton {};
          export declare class MatLegacyButtonModule {};
        `,
    );

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
    declareLibrarySymbols(
      'legacy-button',
      `
          export declare class MatLegacyButton {};
          export declare class MatLegacyButtonModule {};
        `,
    );

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
    declareLibrarySymbols(
      'legacy-button',
      `
          export declare class MatLegacyButton {};
          export declare class MatLegacyButtonModule {};
        `,
    );

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
    declareLibrarySymbols(
      'legacy-button',
      `
          export declare class MatLegacyButton {};
          export declare class MatLegacyButtonModule {};
        `,
    );

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

  it('should migrate re-exported modules', async () => {
    declareLibrarySymbols('legacy-button', `export declare class MatLegacyButtonModule {};`);

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
    declareLibrarySymbols(
      'legacy-button',
      `
          export declare class MatLegacyButton {};
          export declare class MatLegacyButtonModule {};
        `,
    );

    await runMigrationTest(
      `
        import {MatLegacyButton, MatLegacyButtonModule} from '@angular/material/legacy-button';

        @Component({
          standalone: true,
          selector: 'button-example',
          imports: [MatLegacyButton, MatLegacyButtonModule]
        })
        class ButtonExample {}
      `,
      `
        import {MatButton, MatButtonModule} from '@angular/material/button';

        @Component({
          standalone: true,
          selector: 'button-example',
          imports: [MatButton, MatButtonModule]
        })
        class ButtonExample {}
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
            /* TODO(mdc-migration): The following rule targets internal classes of button that may no longer apply for the MDC version. */
            ::ng-deep .mat-button-wrapper{ color: darkblue; }\`
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
    declareLibrarySymbols('legacy-card', `export declare class MatLegacyCardModule {};`);

    await runMigrationTest(
      `
        import {MatLegacyCardModule} from '@angular/material/legacy-card';

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
        import {MatCardModule} from '@angular/material/card';

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

  it('should replace references to classes', async () => {
    declareLibrarySymbols(
      'legacy-button',
      `
        export declare class MatLegacyButtonModule {};
        export declare class MatLegacyButton {};
      `,
    );

    await runMigrationTest(
      `
        import {NgModule, Component} from '@angular/core';
        import {MatLegacyButtonModule, MatLegacyButton} from '@angular/material/legacy-button';

        export interface SomeInterface {
          buttonType: typeof MatLegacyButton;
        }

        export const something: MatLegacyButton = null!;
        export const somethingElse: MatLegacyButton|MatLegacyButtonModule = null!;

        @Component({selector: 'my-button'})
        export class CustomButton extends MatLegacyButton {
          @ViewChild(MatLegacyButton) button: MatLegacyButton;

          constructor(public closestButton: MatLegacyButton) {}

          callStatic() {
            MatLegacyButton.someStaticMethod();
          }
        }

        @NgModule({
          imports: [MatLegacyButtonModule],
          declarations: [CustomButton],
          exports: [MatLegacyButton]
        })
        export class AppModule {}
      `,
      `
        import {NgModule, Component} from '@angular/core';
        import {MatButtonModule, MatButton} from '@angular/material/button';

        export interface SomeInterface {
          buttonType: typeof MatButton;
        }

        export const something: MatButton = null!;
        export const somethingElse: MatButton|MatButtonModule = null!;

        @Component({selector: 'my-button'})
        export class CustomButton extends MatButton {
          @ViewChild(MatButton) button: MatButton;

          constructor(public closestButton: MatButton) {}

          callStatic() {
            MatButton.someStaticMethod();
          }
        }

        @NgModule({
          imports: [MatButtonModule],
          declarations: [CustomButton],
          exports: [MatButton]
        })
        export class AppModule {}
      `,
    );
  });

  it('should not rename a custom alias of a legacy import', async () => {
    declareLibrarySymbols('legacy-button', `export declare class MatLegacyButton {};`);

    await runMigrationTest(
      `
        import {Component, ContentChild} from '@angular/core';
        import {MatLegacyButton as Foo} from '@angular/material/legacy-button';

        @Component({template: '<ng-content></ng-content>'})
        export class App {
          @ContentChild(Foo) button: Foo;
        }
      `,
      `
        import {Component, ContentChild} from '@angular/core';
        import {MatButton as Foo} from '@angular/material/button';

        @Component({template: '<ng-content></ng-content>'})
        export class App {
          @ContentChild(Foo) button: Foo;
        }
      `,
    );
  });

  it('should collapse an alias that ends up being the same as the non-legacy symbol', async () => {
    declareLibrarySymbols('legacy-button', `export declare class MatLegacyButton {};`);

    await runMigrationTest(
      `
        import {Component, ContentChild} from '@angular/core';
        import {MatLegacyButton as MatButton} from '@angular/material/legacy-button';

        @Component({template: '<ng-content></ng-content>'})
        export class App {
          @ContentChild(MatButton) button: MatButton;
        }
      `,
      `
        import {Component, ContentChild} from '@angular/core';
        import {MatButton} from '@angular/material/button';

        @Component({template: '<ng-content></ng-content>'})
        export class App {
          @ContentChild(MatButton) button: MatButton;
        }
      `,
    );
  });

  it('should rename enum references', async () => {
    declareLibrarySymbols(
      'legacy-button',
      `
      export declare enum MatLegacyButtonAppearance {
        RAISED,
        OUTLINED,
      };
    `,
    );

    await runMigrationTest(
      `
        import {Component} from '@angular/core';
        import {MatLegacyButtonAppearance} from '@angular/material/legacy-button';

        @Component({template: '<ng-content></ng-content>'})
        export class App {
          isButtonRaised(appearance: MatLegacyButtonAppearance) {
            return appearance === MatLegacyButtonAppearance.RAISED;
          }
        }
      `,
      `
        import {Component} from '@angular/core';
        import {MatButtonAppearance} from '@angular/material/button';

        @Component({template: '<ng-content></ng-content>'})
        export class App {
          isButtonRaised(appearance: MatButtonAppearance) {
            return appearance === MatButtonAppearance.RAISED;
          }
        }
      `,
    );
  });

  it('should rename type references', async () => {
    declareLibrarySymbols(
      'legacy-dialog',
      `export declare type LegacyDialogType = 'dialog' | 'alertdialog';`,
    );

    await runMigrationTest(
      `
        import {Component} from '@angular/core';
        import {LegacyDialogType} from '@angular/material/legacy-dialog';

        export const dialogType: LegacyDialogType = 'alertdialog';
        export const otherDialogType = 'dialog' as LegacyDialogType;
      `,
      `
        import {Component} from '@angular/core';
        import {DialogType} from '@angular/material/dialog';

        export const dialogType: DialogType = 'alertdialog';
        export const otherDialogType = 'dialog' as DialogType;
      `,
    );
  });
});
