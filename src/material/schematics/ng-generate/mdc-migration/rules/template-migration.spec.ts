import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponent, TEMPLATE_FILE} from './components/test-setup-helper';

describe('template migrations', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(TEMPLATE_FILE, oldFileContent);
    const tree = await migrateComponent('card', runner, cliAppTree);
    expect(tree.readContent(TEMPLATE_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should do nothing yet', async () => {
    await runMigrationTest('<h1>Hello</h1>', '<h1>Hello</h1>');
  });
});
