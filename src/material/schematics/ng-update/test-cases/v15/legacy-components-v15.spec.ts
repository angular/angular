import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {join} from 'path';
import {COMPONENTS} from '../../migrations/legacy-components-v15/constants';
import {MIGRATION_PATH} from '../../../paths';

const PROJECT_ROOT_DIR = '/projects/cdk-testing';
const THEME_FILE_PATH = join(PROJECT_ROOT_DIR, 'src/theme.scss');
const TS_FILE_PATH = join(PROJECT_ROOT_DIR, 'src/app/app.component.ts');

describe('v15 legacy components migration', () => {
  let tree: UnitTestTree;

  /** Writes an single line file. */
  let writeLine: (path: string, line: string) => void;

  /** Writes multiple lines to a file. */
  let writeLines: (path: string, lines: string[]) => void;

  /** Reads a single line file. */
  let readLine: (path: string) => string;

  /** Reads multiple lines from a file. */
  let readLines: (path: string) => string[];

  /** Runs the v15 migration on the test application. */
  let runMigration: () => Promise<{logOutput: string}>;

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v15', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    runMigration = testSetup.runFixers;
    readLine = (path: string) => tree.readContent(path);
    readLines = (path: string) => tree.readContent(path).split('\n');
    writeLine = (path: string, lines: string) => testSetup.writeFile(path, lines);
    writeLines = (path: string, lines: string[]) => testSetup.writeFile(path, lines.join('\n'));
  });

  describe('typescript migrations', () => {
    async function runTypeScriptMigrationTest(ctx: string, opts: {old: string; new: string}) {
      writeLine(TS_FILE_PATH, opts.old);
      await runMigration();
      expect(readLine(TS_FILE_PATH)).withContext(ctx).toEqual(opts.new);
    }

    async function runMultilineTypeScriptMigrationTest(
      ctx: string,
      opts: {old: string[]; new: string[]},
    ) {
      writeLines(TS_FILE_PATH, opts.old);
      await runMigration();
      expect(readLines(TS_FILE_PATH)).withContext(ctx).toEqual(opts.new);
    }

    describe('material --> legacy', () => {
      it('updates import declarations', async () => {
        await runTypeScriptMigrationTest('named binding', {
          old: `import {MatButton} from '@angular/material/button';`,
          new: `import {MatLegacyButton as MatButton} from '@angular/material/legacy-button';`,
        });
        await runTypeScriptMigrationTest('named binding w/ alias', {
          old: `import {MatButton as Button} from '@angular/material/button';`,
          new: `import {MatLegacyButton as Button} from '@angular/material/legacy-button';`,
        });
        await runTypeScriptMigrationTest('multiple named bindings', {
          old: `import {MatButton, MatButtonModule} from '@angular/material/button';`,
          new: `import {MatLegacyButton as MatButton, MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';`,
        });
        await runTypeScriptMigrationTest('multiple named bindings w/ alias', {
          old: `import {MatButton, MatButtonModule as ButtonModule} from '@angular/material/button';`,
          new: `import {MatLegacyButton as MatButton, MatLegacyButtonModule as ButtonModule} from '@angular/material/legacy-button';`,
        });
        await runMultilineTypeScriptMigrationTest('specific cases', {
          old: [
            `import {ProgressAnimationEnd, ProgressBarMode} from '@angular/material/progress-bar';`,
            `import {ProgressSpinnerMode} from '@angular/material/progress-spinner';`,
            `import {AutoFocusTarget, DialogRole, DialogPosition, _closeDialogVia, MatTestDialogOpener} from '@angular/material/dialog';`,
            `import {SimpleSnackBar, TextOnlySnackBar} from '@angular/material/snack-bar';`,
          ],
          new: [
            `import {LegacyProgressAnimationEnd as ProgressAnimationEnd, LegacyProgressBarMode as ProgressBarMode} from '@angular/material/legacy-progress-bar';`,
            `import {LegacyProgressSpinnerMode as ProgressSpinnerMode} from '@angular/material/legacy-progress-spinner';`,
            `import {LegacyAutoFocusTarget as AutoFocusTarget, LegacyDialogRole as DialogRole, LegacyDialogPosition as DialogPosition, _closeLegacyDialogVia as _closeDialogVia, MatTestLegacyDialogOpener as MatTestDialogOpener} from '@angular/material/legacy-dialog';`,
            `import {LegacySimpleSnackBar as SimpleSnackBar, LegacyTextOnlySnackBar as TextOnlySnackBar} from '@angular/material/legacy-snack-bar';`,
          ],
        });
        await runTypeScriptMigrationTest('specific case w/ alias', {
          old: `import {ProgressBarMode as MatProgressBarMode} from '@angular/material/progress-bar';`,
          new: `import {LegacyProgressBarMode as MatProgressBarMode} from '@angular/material/legacy-progress-bar';`,
        });
        await runTypeScriptMigrationTest('test code', {
          old: `import {MatButtonHarness, ButtonHarnessFilters} from '@angular/material/button/testing';`,
          new: `import {MatLegacyButtonHarness as MatButtonHarness, LegacyButtonHarnessFilters as ButtonHarnessFilters} from '@angular/material/legacy-button/testing';`,
        });
      });

      it('updates import expressions', async () => {
        await runTypeScriptMigrationTest('destructured & awaited', {
          old: `const {MatButton} = await import('@angular/material/button');`,
          new: `const {MatLegacyButton: MatButton} = await import('@angular/material/legacy-button');`,
        });
        await runTypeScriptMigrationTest('destructured & awaited w/ alias', {
          old: `const {MatButton: Button} = await import('@angular/material/button');`,
          new: `const {MatLegacyButton: Button} = await import('@angular/material/legacy-button');`,
        });
        await runTypeScriptMigrationTest('promise', {
          old: `const promise = import('@angular/material/button');`,
          new: `const promise = import('@angular/material/legacy-button');`,
        });
        await runTypeScriptMigrationTest('.then', {
          old: `import('@angular/material/button').then(() => {});`,
          new: `import('@angular/material/legacy-button').then(() => {});`,
        });
      });

      it('does not update non-legacy imports', async () => {
        await runTypeScriptMigrationTest('non-legacy component', {
          old: `import {MatButtonToggleModule} from '@angular/material/button-toggle';`,
          new: `import {MatButtonToggleModule} from '@angular/material/button-toggle';`,
        });
      });

      it('splits @angular/material/core imports', async () => {
        await runMultilineTypeScriptMigrationTest('core imports', {
          old: [
            `import {VERSION, MatOption} from '@angular/material/core';`,
            `import {CanDisable} from '@angular/material/core';`,
            `import {MatOptionHarness} from '@angular/material/core/testing';`,
            `import {VERSION as a, MatOption as b} from '@angular/material/core';`,
            `const {mixinDisable, MatOptgroup} = await import('@angular/material/core');`,
            `const {mixinDisable: c, MatOptgroup: d} = await import('@angular/material/core');`,
          ],
          new: [
            `import {VERSION} from '@angular/material/core';`,
            `import {MatLegacyOption as MatOption} from '@angular/material/legacy-core';`,
            `import {CanDisable} from '@angular/material/core';`,
            `import {MatLegacyOptionHarness as MatOptionHarness} from '@angular/material/legacy-core/testing';`,
            `import {VERSION as a} from '@angular/material/core';`,
            `import {MatLegacyOption as b} from '@angular/material/legacy-core';`,
            `const {mixinDisable} = await import('@angular/material/core');`,
            `const {MatLegacyOptgroup: MatOptgroup} = await import('@angular/material/legacy-core');`,
            `const {mixinDisable: c} = await import('@angular/material/core');`,
            `const {MatLegacyOptgroup: d} = await import('@angular/material/legacy-core');`,
          ],
        });
      });
    });

    describe('material-experimental --> material', () => {
      it('updates import declarations', async () => {
        await runTypeScriptMigrationTest('named binding', {
          old: `import {MatButton} from '@angular/material-experimental/mdc-button';`,
          new: `import {MatButton} from '@angular/material/button';`,
        });
        await runTypeScriptMigrationTest('named binding w/ alias', {
          old: `import {MatButton as Button} from '@angular/material-experimental/mdc-button';`,
          new: `import {MatButton as Button} from '@angular/material/button';`,
        });
        await runTypeScriptMigrationTest('multiple named bindings', {
          old: `import {MatButton, MatButtonModule} from '@angular/material-experimental/mdc-button';`,
          new: `import {MatButton, MatButtonModule} from '@angular/material/button';`,
        });
        await runTypeScriptMigrationTest('multiple named bindings w/ alias', {
          old: `import {MatButton, MatButtonModule as ButtonModule} from '@angular/material-experimental/mdc-button';`,
          new: `import {MatButton, MatButtonModule as ButtonModule} from '@angular/material/button';`,
        });
        await runTypeScriptMigrationTest('test code', {
          old: `import {MatButtonHarness, ButtonHarnessFilters} from '@angular/material-experimental/mdc-button/testing';`,
          new: `import {MatButtonHarness, ButtonHarnessFilters} from '@angular/material/button/testing';`,
        });
      });

      it('updates import expressions', async () => {
        await runTypeScriptMigrationTest('destructured & awaited', {
          old: `const {MatButton} = await import('@angular/material-experimental/mdc-button');`,
          new: `const {MatButton} = await import('@angular/material/button');`,
        });
        await runTypeScriptMigrationTest('destructured & awaited w/ alias', {
          old: `const {MatButton: Button} = await import('@angular/material-experimental/mdc-button');`,
          new: `const {MatButton: Button} = await import('@angular/material/button');`,
        });
        await runTypeScriptMigrationTest('promise', {
          old: `const promise = import('@angular/material-experimental/mdc-button');`,
          new: `const promise = import('@angular/material/button');`,
        });
        await runTypeScriptMigrationTest('.then', {
          old: `import('@angular/material-experimental/mdc-button').then(() => {});`,
          new: `import('@angular/material/button').then(() => {});`,
        });
      });
    });
  });

  describe('style migrations', () => {
    async function runSassMigrationTest(ctx: string, opts: {old: string[]; new: string[]}) {
      writeLines(THEME_FILE_PATH, opts.old);
      await runMigration();
      expect(readLines(THEME_FILE_PATH)).withContext(ctx).toEqual(opts.new);
    }

    it('updates all mixins', async () => {
      const oldFile: string[] = [
        `@use '@angular/material' as mat;`,
        `@include mat.all-component-themes($theme);`,
        `@include mat.all-component-colors($theme);`,
        `@include mat.private-all-component-densities($theme);`,
        `@include mat.all-component-typographies($theme);`,
      ];
      const newFile: string[] = [
        `@use '@angular/material' as mat;`,
        `@include mat.all-legacy-component-themes($theme);`,
        `@include mat.all-legacy-component-colors($theme);`,
        `@include mat.private-all-legacy-component-densities($theme);`,
        `@include mat.all-legacy-component-typographies($theme);`,
      ];
      for (let i = 0; i < COMPONENTS.length; i++) {
        oldFile.push(
          ...[
            `@include mat.${COMPONENTS[i]}-theme($theme);`,
            `@include mat.${COMPONENTS[i]}-color($theme);`,
            `@include mat.${COMPONENTS[i]}-density($theme);`,
            `@include mat.${COMPONENTS[i]}-typography($theme);`,
          ],
        );
        newFile.push(
          ...[
            `@include mat.legacy-${COMPONENTS[i]}-theme($theme);`,
            `@include mat.legacy-${COMPONENTS[i]}-color($theme);`,
            `@include mat.legacy-${COMPONENTS[i]}-density($theme);`,
            `@include mat.legacy-${COMPONENTS[i]}-typography($theme);`,
          ],
        );
      }
      await runSassMigrationTest('all components', {
        old: oldFile,
        new: newFile,
      });
      await runSassMigrationTest('w/ unique namespaces', {
        old: [`@use '@angular/material' as material;`, `@include material.button-theme($theme);`],
        new: [
          `@use '@angular/material' as material;`,
          `@include material.legacy-button-theme($theme);`,
        ],
      });
      await runSassMigrationTest('w/ unique whitespace', {
        old: [
          `	 	@use	 	'@angular/material'	 	as	 	material	 	;	 	`,
          `	 	@include	 	material.button-theme(	 	$theme	 	)	 	;	 	`,
        ],
        new: [
          `	 	@use	 	'@angular/material'	 	as	 	material	 	;	 	`,
          `	 	@include	 	material.legacy-button-theme(	 	$theme	 	)	 	;	 	`,
        ],
      });
    });

    it('does not update non-mdc component mixins', async () => {
      await runSassMigrationTest('datepicker', {
        old: [`@use '@angular/material' as mat;`, `@include mat.datepicker-theme($theme);`],
        new: [`@use '@angular/material' as mat;`, `@include mat.datepicker-theme($theme);`],
      });
      await runSassMigrationTest('button-toggle', {
        old: [`@use '@angular/material' as mat;`, `@include mat.button-toggle-theme($theme);`],
        new: [`@use '@angular/material' as mat;`, `@include mat.button-toggle-theme($theme);`],
      });
    });

    it('updates sass functions', async () => {
      await runSassMigrationTest('variable assignment', {
        old: [
          `@use '@angular/material' as mat;`,
          `$typography: mat.define-typography-config();`,
          `@include mat.all-component-typographies(mat.define-typography-config());`,
        ],
        new: [
          `@use '@angular/material' as mat;`,
          `$typography: mat.define-legacy-typography-config();`,
          `@include mat.all-legacy-component-typographies(mat.define-legacy-typography-config());`,
        ],
      });
    });

    it('updates mat.core mixin', async () => {
      await runSassMigrationTest('mat.core mixin', {
        old: [
          `@use '@angular/material' as mat;`,
          `@include mat.core();`,
          `@include mat.core(mat.define-typography-config());`,
        ],
        new: [
          `@use '@angular/material' as mat;`,
          `// TODO(v15): As of v15 mat.legacy-core no longer includes default typography styles.`,
          `//  Instead an explicit typography include has been automatically added here.`,
          `//  If you add typography styles elsewhere, you may want to remove this.`,
          `@include mat.all-legacy-component-typographies();`,
          `@include mat.legacy-core();`,
          `// TODO(v15): As of v15 mat.legacy-core no longer includes default typography styles.`,
          `//  Instead an explicit typography include has been automatically added here.`,
          `//  If you add typography styles elsewhere, you may want to remove this.`,
          `@include mat.all-legacy-component-typographies(mat.define-legacy-typography-config());`,
          `@include mat.legacy-core();`,
        ],
      });
    });
  });
});
