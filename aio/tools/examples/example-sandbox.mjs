import jsonc from 'cjson';
import fs from 'fs-extra';
import {globbySync} from 'globby';
import path from 'node:path';
import os from 'node:os';

// Construct a sandbox environment for an example, linking in shared example node_modules
// and optionally linking in locally-built angular packages.
export async function constructExampleSandbox(examplePath, destPath, nodeModulesPath, localPackages) {
  // If the sandbox folder exists delete the contents but not the folder itself. If cd'ed
  // into the sandbox then bash will lose the reference and be stuck in a stray deleted folder,
  // creating a confusing experience. This is relevant for developer experience with ibazel.
  globbySync(`${destPath}/*`, {onlyFiles: false}).forEach(file => {
    fs.rmSync(file, {
      recursive: true,
      force: true
    });
  })
  fs.copySync(examplePath, destPath);

  // Remove write protection as the example was copied from bazel output tree
  chmodSyncRec(destPath);

  // Symlink shared example node_modules, substituting for locally built deps if requested
  await constructSymlinkedNodeModules(destPath, nodeModulesPath, localPackages);

  // Add preserveSymlinks fixups to various files --- needed when linkin in local deps
  ensurePreserveSymlinks(destPath);
}

async function constructSymlinkedNodeModules(examplePath, exampleDepsNodeModules, localPackages) {
  const linkedNodeModules = path.resolve(examplePath, 'node_modules');
  fs.ensureDirSync(linkedNodeModules);

  await Promise.all([
    linkExampleDeps(exampleDepsNodeModules, linkedNodeModules, localPackages),
    linkLocalDeps(exampleDepsNodeModules, linkedNodeModules, localPackages)
  ]);

  fs.copySync(path.join(exampleDepsNodeModules, '.bin'), path.join(linkedNodeModules, '.bin'));
  pointBinSymlinksToLocalPackages(linkedNodeModules, exampleDepsNodeModules, localPackages);
}

function linkExampleDeps(exampleDepsNodeModules, linkedNodeModules, localPackages) {
  const exampleDepsPackages = getPackageNamesFromNodeModules(exampleDepsNodeModules);

  return Promise.all(exampleDepsPackages
    .filter(pkgName => !(pkgName in localPackages))
    .map(pkgName => fs.ensureSymlink(
      path.join(exampleDepsNodeModules, pkgName),
      path.join(linkedNodeModules, pkgName), 'dir'))
  );
}

function getPackageNamesFromNodeModules(nodeModulesPath) {
  return globbySync([
    '@*/*',
    '!@*$', // Exclude a namespace folder itself
    '(?!@)*',
    '!.bin',
    '!.yarn-integrity',
    '!_*'
  ], {
    cwd: nodeModulesPath,
    onlyDirectories: true,
    dot: true
  });
}

async function linkLocalDeps(exampleDepsNodeModules, linkedNodeModules, localPackages) {
  const hasNpmDepForPkg = await Promise.all(Object.keys(localPackages)
    .map(pkgName => fs.pathExists(path.join(exampleDepsNodeModules, pkgName))));

  return Promise.all(Object.keys(localPackages).filter((pkgName, i) => hasNpmDepForPkg[i])
    .map(pkgName => {
      const pkgJsonPath = path.join(localPackages[pkgName], 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const linkedPkgPath = path.join(linkedNodeModules, pkgName);

      // If a local package has bin entries and an example invokes one, then entrypoint
      // resolution escapes out of the sandboxed folder into the package folder in the output
      // tree and the bin cannot resolve its deps. To prevent this, copy the full local package
      // into node_modules as a way of linking it. Currently, only the `upgrade-phonecat-hybrid-2`
      // which calls `ngc` seems to need this.
      if (pkgJson.bin) {
        fs.copySync(localPackages[pkgName], linkedPkgPath);
        return;
      }

      // Standard case: just symlink the local package.
      fs.ensureSymlinkSync(localPackages[pkgName], linkedPkgPath, 'dir')
    }));
}

// The .bin folder is copied over from the original yarn_install repository, so the
// bin symlinks point there. When we link local packages in place of their npm equivalent,
// we need to alter those symlinks to point into the local package.
function pointBinSymlinksToLocalPackages(linkedNodeModules, exampleDepsNodeModules, localPackages) {
  if (os.platform() === 'win32') {
    // Bins on Windows are not symlinks; they are scripts that will invoke the bin
    // relative to their location. The relative path will already point to the symlinked
    // local package, so no further action is required.
    return;
  }
  const allNodeModuleBins = globbySync(['**'], {
    cwd: path.join(linkedNodeModules, '.bin'),
    onlyFiles: true
  });
  allNodeModuleBins.forEach(bin => {
    const symlinkTarget = fs.readlinkSync(path.join(linkedNodeModules, '.bin', bin));
    for (const pkgName of Object.keys(localPackages)) {
      const binMightBeInLocalPackage = symlinkTarget.includes(path.join(exampleDepsNodeModules, pkgName) + path
      .sep);
      if (binMightBeInLocalPackage) {
        const pathToBinWithinPackage = symlinkTarget.substring(symlinkTarget.indexOf(pkgName) +
          pkgName.length + path.sep.length);
        const binExistsInLocalPackage = fs.existsSync(path.join(linkedNodeModules, pkgName,
        pathToBinWithinPackage));
        if (binExistsInLocalPackage) {
          // Replace the copied bin symlink with one that points to the symlinked local package.
          fs.rmSync(path.join(linkedNodeModules, '.bin', bin));
          fs.ensureSymlinkSync(path.join(
              '..',
              pkgName,
              pathToBinWithinPackage),
            path.join(linkedNodeModules, '.bin', bin)
          );
        }
        break;
      }
    }
  });
}

/**
 * When local packages are symlinked in, node will by default resolve local packages to
 * their output location in the `bazel-bin`. This will then cause transitive dependencies
 * to be incorrectly resolved from `bazel-bin`, instead of from within the example sandbox.
 *
 * Setting `preserveSymlinks` in relevant files fixes this. Note that we are intending to
 * preserve symlinks in general (regardless of local packages being used), because it
 * allows us to safely enable `NODE_PRESERVE_SYMLINKS=1` when executing commands inside. 
 */
function ensurePreserveSymlinks(appDir) {
  // Set preserveSymlinks in angular.json
  const angularJsonPath = path.join(appDir, 'angular.json');
  if (fs.existsSync(angularJsonPath)) {
    const angularJson = jsonc.load(angularJsonPath, {encoding: 'utf-8'});
    angularJson.projects['angular.io-example'].architect.build.options.preserveSymlinks = true;
    angularJson.projects['angular.io-example'].architect.test.options.preserveSymlinks = true;
    fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, undefined, 2));
  }

  // Set preserveSymlinks in any tsconfig.json files
  const tsConfigPaths = globbySync([path.join(appDir, 'tsconfig*.json')]);
  for (const tsConfigPath of tsConfigPaths) {
    const tsConfig = jsonc.load(tsConfigPath, {encoding: 'utf-8'});
    const isRootConfig = !tsConfig.extends;
    if (isRootConfig) {
      tsConfig.compilerOptions.preserveSymlinks = true;
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, undefined, 2));
    }
  }

  // Call rollup with --preserveSymlinks
  const packageJsonPath = path.join(appDir, 'package.json');
  const packageJson = jsonc.load(packageJsonPath, {encoding: 'utf-8'});
  if ('rollup' in packageJson.dependencies || 'rollup' in packageJson.devDependencies) {
    packageJson.scripts.rollup = 'rollup --preserveSymlinks';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, 2));
  }
}

function chmodSyncRec(dest) {
  // Glob patterns always use unix-style paths
  const allFilesPattern = path.join(dest, '**').replace(/\\/g, '/');

  globbySync(allFilesPattern, {
    dot: true,
    onlyFiles: false
  }).forEach(file => fs.chmodSync(file, '755'));
  fs.chmodSync(dest, '755');
}