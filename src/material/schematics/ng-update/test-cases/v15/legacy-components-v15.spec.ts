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
        await runTypeScriptMigrationTest('non-legacy symbol', {
          old: `import {VERSION} from '@angular/material/core`,
          new: `import {VERSION} from '@angular/material/legacy-core`,
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
      const oldFile: string[] = [`@use '@angular/material' as mat;`];
      const newFile: string[] = [`@use '@angular/material' as mat;`];
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
  });
});
