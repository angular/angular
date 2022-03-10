import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, TEMPLATE_FILE} from '../test-setup-helper';

describe('card template migrator', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(TEMPLATE_FILE, oldFileContent);
    const tree = await migrateComponents(['card'], runner, cliAppTree);
    expect(tree.readContent(TEMPLATE_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should not update other elements', async () => {
    await runMigrationTest('<mat-button></mat-button>', '<mat-button></mat-button>');
  });

  it('should update single', async () => {
    await runMigrationTest('<mat-card></mat-card>', '<mat-card appearance="outlined"></mat-card>');
  });

  it('should update multiple same-line unnested', async () => {
    await runMigrationTest(
      '<mat-card></mat-card><mat-card></mat-card>',
      '<mat-card appearance="outlined"></mat-card><mat-card appearance="outlined"></mat-card>',
    );
  });

  it('should update multiple same-line nested', async () => {
    await runMigrationTest(
      '<mat-card><mat-card></mat-card></mat-card>',
      '<mat-card appearance="outlined"><mat-card appearance="outlined"></mat-card></mat-card>',
    );
  });

  it('should update multiple same-line nested and unnested', async () => {
    await runMigrationTest(
      '<mat-card><mat-card></mat-card><mat-card></mat-card></mat-card>',
      '<mat-card appearance="outlined"><mat-card appearance="outlined"></mat-card><mat-card appearance="outlined"></mat-card></mat-card>',
    );
  });

  it('should update multiple multi-line unnested', async () => {
    await runMigrationTest(
      `
        <mat-card></mat-card>
        <mat-card></mat-card>
      `,
      `
        <mat-card appearance="outlined"></mat-card>
        <mat-card appearance="outlined"></mat-card>
      `,
    );
  });

  it('should update multiple multi-line nested', async () => {
    await runMigrationTest(
      `
        <mat-card>
          <mat-card></mat-card>
        </mat-card>
      `,
      `
        <mat-card appearance="outlined">
          <mat-card appearance="outlined"></mat-card>
        </mat-card>
      `,
    );
  });

  it('should update multiple multi-line nested and unnested', async () => {
    await runMigrationTest(
      `
        <mat-card>
          <mat-card></mat-card>
          <mat-card></mat-card>
        </mat-card>
      `,
      `
        <mat-card appearance="outlined">
          <mat-card appearance="outlined"></mat-card>
          <mat-card appearance="outlined"></mat-card>
        </mat-card>
      `,
    );
  });
});
