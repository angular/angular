import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {Schema} from '../schema';
import {runfiles} from '@bazel/runfiles';

describe('theming styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  beforeEach(async () => {
    runner = new SchematicTestRunner(
      '@angular/material',
      runfiles.resolveWorkspaceRelative('src/material/schematics/collection.json'),
    );
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  async function migrate(options: Schema): Promise<UnitTestTree> {
    return await runner.runSchematicAsync('mdcMigration', options, cliAppTree).toPromise();
  }

  it('should work', async () => {
    cliAppTree.create(
      '/projects/material/src/theme.scss',
      `
        @use '@angular/material' as mat;

        $my-theme: ();
        @include mat.all-component-themes($my-theme);
    `,
    );

    const result = await migrate({
      tsconfig: '/projects/material/tsconfig.app.json',
      components: ['all'],
    });

    expect(result.readContent('/projects/material/src/theme.scss')).toContain('$some-var:');
  });
});
