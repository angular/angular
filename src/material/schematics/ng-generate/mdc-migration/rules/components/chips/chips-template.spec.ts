import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, TEMPLATE_FILE} from '../test-setup-helper';

describe('chips template migrator', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(TEMPLATE_FILE, oldFileContent);
    const tree = await migrateComponents(['chips'], runner, cliAppTree);
    expect(tree.readContent(TEMPLATE_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should not update other elements', async () => {
    await runMigrationTest('<mat-button></mat-button>', '<mat-button></mat-button>');
  });

  it('should update list to listbox', async () => {
    await runMigrationTest(
      '<mat-chip-list></mat-chip-list>',
      '<mat-chip-listbox></mat-chip-listbox>',
    );
  });

  it('should update list to grid if referenced by an input', async () => {
    await runMigrationTest(
      `
        <mat-chip-list #chipList>
          <input [matChipInputFor]="chipList">
        </mat-chip-list>
      `,
      `
        <mat-chip-grid #chipList>
          <input [matChipInputFor]="chipList">
        </mat-chip-grid>
      `,
    );
  });

  it('should update mat-chip inside a listbox to option', async () => {
    await runMigrationTest(
      `
        <mat-chip-list>
          <mat-chip>One</mat-chip>
          <mat-chip>Two</mat-chip>
          <mat-chip>Three</mat-chip>
        </mat-chip-list>
      `,
      `
        <mat-chip-listbox>
          <mat-chip-option>One</mat-chip-option>
          <mat-chip-option>Two</mat-chip-option>
          <mat-chip-option>Three</mat-chip-option>
        </mat-chip-listbox>
      `,
    );
  });

  it('should update mat-chip inside a grid to row', async () => {
    await runMigrationTest(
      `
        <mat-chip-list #chipList>
          <mat-chip>One</mat-chip>
          <mat-chip>Two</mat-chip>
          <mat-chip>Three</mat-chip>
          <input [matChipInputFor]="chipList">
        </mat-chip-list>
      `,
      `
        <mat-chip-grid #chipList>
          <mat-chip-row>One</mat-chip-row>
          <mat-chip-row>Two</mat-chip-row>
          <mat-chip-row>Three</mat-chip-row>
          <input [matChipInputFor]="chipList">
        </mat-chip-grid>
      `,
    );
  });

  it('should update list to listbox correctly even if it has a ref', async () => {
    await runMigrationTest(
      '<mat-chip-list #chipList></mat-chip-list>',
      '<mat-chip-listbox #chipList></mat-chip-listbox>',
    );
  });

  it('should update standalone chips', async () => {
    await runMigrationTest('<mat-chip></mat-chip>', '<mat-chip-option></mat-chip-option>');
  });
});
