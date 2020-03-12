const {relative, sep, join} = require('path');
const {readdirSync, readFileSync, existsSync} = require('fs');
const {set, ln, rm, mkdir} = require('shelljs');
const {fork} = require('child_process');
const runfiles = require(process.env.BAZEL_NODE_RUNFILES_HELPER);

// Exit if any command fails.
set('-e');

// List of NPM packages that have been built for the current test target.
const npmPackages = getNpmPackagesFromRunfiles();
// Path to the node modules of the workspace.
const nodeModulesDir = runfiles.resolve('npm/node_modules');
// Path to the generated file that imports all entry-points.
const testFilePath = require.resolve('./import-all-entry-points.ts');

/**
 * Runs the TypeScript compatibility test with the specified tsc binary. The
 * compatibility test, links the built release packages into `node_modules` and
 * compiles a test file using the specified tsc binary which imports all entry-points.
 */
exports.runTypeScriptCompatibilityTest = async (tscBinPath) => {
  return new Promise((resolve, reject) => {
    const angularDir = join(nodeModulesDir, '@angular/');

    // Create the `node_modules/@angular` directory in case it's not present.
    mkdir('-p', angularDir);

    // Symlink npm packages into `node_modules/` so that the project can
    // be compiled without path mappings (simulating a real project).
    for (const {name, pkgPath} of npmPackages) {
      console.info(`Linking "@angular/${name}" into node modules..`);
      ln('-s', pkgPath, join(angularDir, name));
    }

    const tscArgs = [
      '--strict',
      '--lib', 'es2015,dom',
      // Ensures that `node_modules` can be resolved. By default, in sandbox environments the
      // node modules cannot be resolved because they are wrapped in the `npm/node_modules` folder
      '--baseUrl', nodeModulesDir,
      testFilePath
    ];
    // Run `tsc` to compile the project. The stdout/stderr output is inherited, so that
    // warnings and errors are printed to the console.
    const tscProcess = fork(tscBinPath, tscArgs, {stdio: 'inherit'});

    tscProcess.on('exit', (exitCode) => {
      // Remove symlinks to keep a clean repository state.
      for (const {name} of npmPackages) {
        console.info(`Removing link for "@angular/${name}"..`);
        rm(join(angularDir, name));
      }
      exitCode === 0 ? resolve() : reject();
    });
  });
};

/**
 * Gets all built Angular NPM package artifacts by querying the Bazel runfiles.
 * In case there is a runfiles manifest (e.g. on Windows), the packages are resolved
 * through the manifest because the runfiles are not symlinked and cannot be searched
 * within the real filesystem. TODO: Remove if Bazel on Windows uses runfile symlinking.
 */
function getNpmPackagesFromRunfiles() {
  // Path to the Bazel runfiles manifest if present. This file is present if runfiles are
  // not symlinked into the runfiles directory.
  const runfilesManifestPath = process.env.RUNFILES_MANIFEST_FILE;
  const workspacePath = 'angular_material/src';
  if (!runfilesManifestPath) {
    const packageRunfilesDir = join(process.env.RUNFILES, workspacePath);
    return readdirSync(packageRunfilesDir)
      .map(name => ({name, pkgPath: join(packageRunfilesDir, name, 'npm_package/')}))
      .filter(({pkgPath}) => existsSync(pkgPath));
  }
  const workspaceManifestPathRegex = new RegExp(`^${workspacePath}/[\\w-]+/npm_package$`);
  return readFileSync(runfilesManifestPath, 'utf8')
    .split('\n')
    .map(mapping => mapping.split(' '))
    .filter(([runfilePath]) => runfilePath.match(workspaceManifestPathRegex))
    .map(([runfilePath, realPath]) => ({
      name: relative(workspacePath, runfilePath).split(sep)[0],
      pkgPath: realPath,
    }));
}
