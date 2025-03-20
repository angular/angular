import {performCompilation} from '@angular/compiler-cli';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import ts from 'typescript';
import {findAllEntryPointsAndExportedModules} from './find-all-modules';

async function main() {
  const [configPath] = process.argv.slice(2);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ng-module-test-'));
  const config = JSON.parse(await fs.readFile(configPath, 'utf8')) as {
    packages: string[];
    skipEntryPoints: string[];
  };

  const packages = await Promise.all(
    config.packages.map((pkgPath) => findAllEntryPointsAndExportedModules(pkgPath)),
  );

  const exports = packages
    .map((p) => p.moduleExports)
    .flat()
    .filter((e) => !config.skipEntryPoints.includes(e.importPath));

  const testFile = `
    import {NgModule, Component} from '@angular/core';
    ${exports.map((e) => `import {${e.symbolName}} from '${e.importPath}';`).join('\n')}

    @NgModule({
      exports: [
        ${exports.map((e) => e.symbolName).join(', ')}
      ]
    })
    export class TestModule {}

    @Component({imports: [TestModule], template: ''})
    export class TestComponent {}
  `;

  await fs.writeFile(path.join(tmpDir, 'test.ts'), testFile);

  // Prepare node modules to resolve e.g. `@angular/core`
  await fs.symlink(path.resolve('./node_modules'), path.join(tmpDir, 'node_modules'));
  // Prepare node modules to resolve e.g. `@angular/cdk`. This is possible
  // as we are inside the sandbox, inside our test runfiles directory.
  for (const {packagePath, name} of packages) {
    await fs.symlink(path.resolve(packagePath), `./node_modules/${name}`);
  }

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
    rootNames: [path.join(tmpDir, 'test.ts')],
  });

  console.error(
    ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => '/',
      getNewLine: () => '\n',
    }),
  );

  await fs.rm(tmpDir, {recursive: true, force: true, maxRetries: 2});

  if (result.diagnostics.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('Error', e);
  process.exitCode = 1;
});
