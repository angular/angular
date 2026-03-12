import {performCompilation} from '@angular/compiler-cli';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import ts from 'typescript';
import {findAllEntryPointsAndExportedModules} from './find-all-modules.mjs';

async function main() {
  // Touch the TEST_SHARD_FILE to mark for bazel that sharding is supported.
  await fs.writeFile(process.env.TEST_SHARD_STATUS_FILE!, '', {encoding: 'utf-8'});

  const [configPath] = process.argv.slice(2);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ng-module-test-'));
  const config = JSON.parse(await fs.readFile(configPath, 'utf8')) as {
    packages: string[];
    skipEntryPoints: string[];
  };

  const packages = await Promise.all(
    config.packages.map((pkgPath) => findAllEntryPointsAndExportedModules(pkgPath)),
  );

  const allExports = packages
    .map((p) => p.moduleExports)
    .flat()
    .filter((e) => !config.skipEntryPoints.includes(e.importPath));

  // Distribute the exports based on the current test shard.
  // Controlled via Bazel's `shard_count` attribute. See:
  // https://bazel.build/reference/test-encyclopedia#initial-conditions.
  const testShardIndex =
    process.env['TEST_SHARD_INDEX'] !== undefined ? Number(process.env['TEST_SHARD_INDEX']) : 0;
  const testMaxShards =
    process.env['TEST_TOTAL_SHARDS'] !== undefined ? Number(process.env['TEST_TOTAL_SHARDS']) : 1;
  const testChunkSize = Math.ceil(allExports.length / testMaxShards);
  const testChunkStart = testChunkSize * testShardIndex;
  const shardExports = allExports.slice(testChunkStart, testChunkStart + testChunkSize);

  // Sub-test directory where the first-party linked node modules end up being available.
  const testDir = path.join(tmpDir, 'test');
  await fs.mkdir(testDir);
  await fs.mkdir(path.join(testDir, 'node_modules/@angular'), {recursive: true});

  const testFiles = shardExports.map((e) => ({
    content: `
      import {NgModule, Component} from '@angular/core';
      import {${e.symbolName}} from '${e.importPath}';

      @NgModule({
        exports: [${e.symbolName}]
      })
      export class TestModule {}

      @Component({imports: [TestModule], template: ''})
      export class TestComponent {}
  `,
    path: path.join(testDir, `${e.symbolName.toLowerCase()}.ts`),
  }));

  // Prepare node modules to resolve e.g. `@angular/core`
  await fs.symlink(path.resolve('./integration/node_modules'), path.join(tmpDir, 'node_modules'));

  // Prepare node modules to resolve e.g. `@angular/cdk`. This is possible
  // as we are inside the sandbox, inside our test runfiles directory.
  for (const {packagePath, name} of packages) {
    await fs.symlink(path.resolve(packagePath), path.join(testDir, 'node_modules', name));
  }

  const diagnostics: ts.Diagnostic[] = [];

  for (const testFile of testFiles) {
    await fs.writeFile(testFile.path, testFile.content);

    const result = performCompilation({
      options: {
        rootDir: tmpDir,
        skipLibCheck: true,
        noEmit: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strictTemplates: true,
        preserveSymlinks: true,
        strict: true,
        // Note: HMR is needed as it will disable the Angular compiler's tree-shaking of used
        // directives/components. This is critical for this test as it allows us to simply all
        // modules and automatically validate that all symbols are reachable/importable.
        _enableHmr: true,
      },
      rootNames: [testFile.path],
    });

    diagnostics.push(...result.diagnostics);
  }

  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => '/',
      getNewLine: () => '\n',
    }),
  );

  await fs.rm(tmpDir, {recursive: true, force: true, maxRetries: 2});

  if (diagnostics.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('Error', e);
  process.exitCode = 1;
});
