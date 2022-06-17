import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {join} from 'path';
import {MIGRATION_PATH} from '../../../paths';

const PROJECT_ROOT_DIR = '/projects/cdk-testing';
const THEME_FILE_PATH = join(PROJECT_ROOT_DIR, 'src/theme.scss');
const TS_FILE_PATH = join(PROJECT_ROOT_DIR, 'src/app/app.component.ts');

describe('v15 legacy components migration', () => {
  let tree: UnitTestTree;

  /** Writes an array of lines as a single file. */
  let writeLines: (path: string, lines: string[]) => void;

  /** Reads a file and split it into an array where each item is a new line. */
  let splitFile: (path: string) => string[];

  /** Runs the v15 migration on the test application. */
  let runMigration: () => Promise<{logOutput: string}>;

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v15', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    runMigration = testSetup.runFixers;
    splitFile = (path: string) => tree.readContent(path).split('\n');
    writeLines = (path: string, lines: string[]) => testSetup.writeFile(path, lines.join('\n'));
  });

  describe('typescript migrations', () => {
    it('should do nothing yet', async () => {
      writeLines(TS_FILE_PATH, [' ']);
      await runMigration();
      expect(splitFile(TS_FILE_PATH)).toEqual([' ']);
    });
  });

  describe('style migrations', () => {
    it('should do nothing yet', async () => {
      writeLines(THEME_FILE_PATH, [' ']);
      await runMigration();
      expect(splitFile(THEME_FILE_PATH)).toEqual([' ']);
    });
  });
});
