/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types='node'/>

import {spawn} from 'child_process';
import {copyFileSync, existsSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync} from 'fs';
import {platform} from 'os';
import {dirname, join, normalize} from 'path';

export type Executable = 'bazel'|'ibazel';
export type Command = 'build'|'test'|'run'|'coverage'|'query';

/**
 * Spawn the Bazel process. Trap SINGINT to make sure Bazel process is killed.
 */
export function runBazel(
    projectDir: string, binary: string, command: Command, workspaceTarget: string,
    flags: string[]) {
  projectDir = normalize(projectDir);
  binary = normalize(binary);
  return new Promise((resolve, reject) => {
    const buildProcess = spawn(binary, [command, workspaceTarget, ...flags], {
      cwd: projectDir,
      stdio: 'inherit',
    });

    process.on('SIGINT', (signal) => {
      if (!buildProcess.killed) {
        buildProcess.kill();
        reject(new Error(`Bazel process received ${signal}.`));
      }
    });

    buildProcess.once('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${binary} failed with code ${code}.`));
      }
    });
  });
}

/**
 * Resolves the path to `@bazel/bazel` or `@bazel/ibazel`.
 */
export function checkInstallation(name: Executable, projectDir: string): string {
  projectDir = normalize(projectDir);
  const packageName = `@bazel/${name}`;
  try {
    const bazelPath = require.resolve(packageName, {
      paths: [projectDir],
    });
    return require(bazelPath).getNativeBinary();
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
          `Could not run ${name}. Please make sure that the ` +
          `"${name}" command is installed by running ` +
          `"npm install ${packageName}" or "yarn install ${packageName}".`);
    }
    throw error;
  }
}

/**
 * Returns the absolute path to the template directory in `@angular/bazel`.
 */
export function getTemplateDir(root: string): string {
  root = normalize(root);
  const packageJson = require.resolve('@angular/bazel/package.json', {
    paths: [root],
  });
  const packageDir = dirname(packageJson);
  const templateDir = join(packageDir, 'src', 'builders', 'files');
  if (!statSync(templateDir).isDirectory()) {
    throw new Error('Could not find Bazel template directory in "@angular/bazel".');
  }
  return templateDir;
}

/**
 * Recursively list the specified 'dir' using depth-first approach. Paths
 * returned are relative to 'dir'.
 */
function listR(dir: string): string[] {
  function list(dir: string, root: string, results: string[]) {
    const paths = readdirSync(dir);
    for (const path of paths) {
      const absPath = join(dir, path);
      const relPath = join(root, path);
      if (statSync(absPath).isFile()) {
        results.push(relPath);
      } else {
        list(absPath, relPath, results);
      }
    }
    return results;
  }

  return list(dir, '', []);
}

/**
 * Return the name of the lock file that is present in the specified 'root'
 * directory. If none exists, default to creating an empty yarn.lock file.
 */
function getOrCreateLockFile(root: string): 'yarn.lock'|'package-lock.json' {
  const yarnLock = join(root, 'yarn.lock');
  if (existsSync(yarnLock)) {
    return 'yarn.lock';
  }
  const npmLock = join(root, 'package-lock.json');
  if (existsSync(npmLock)) {
    return 'package-lock.json';
  }
  // Prefer yarn if no lock file exists
  writeFileSync(yarnLock, '');
  return 'yarn.lock';
}

// Replace yarn_install rule with npm_install and copy from 'source' to 'dest'.
function replaceYarnWithNpm(source: string, dest: string) {
  const srcContent = readFileSync(source, 'utf-8');
  const destContent = srcContent.replace(/yarn_install/g, 'npm_install')
                          .replace('yarn_lock', 'package_lock_json')
                          .replace('yarn.lock', 'package-lock.json');
  writeFileSync(dest, destContent);
}

/**
 * Disable sandbox on Mac OS by setting spawn_strategy in .bazelrc.
 * For a hello world (ng new) application, removing the sandbox improves build
 * time by almost 40%.
 * ng build with sandbox: 22.0 seconds
 * ng build without sandbox: 13.3 seconds
 */
function disableSandbox(source: string, dest: string) {
  const srcContent = readFileSync(source, 'utf-8');
  const destContent = `${srcContent}
# Disable sandbox on Mac OS for performance reason.
build --spawn_strategy=local
run --spawn_strategy=local
test --spawn_strategy=local
`;
  writeFileSync(dest, destContent);
}

/**
 * Copy Bazel files (WORKSPACE, BUILD.bazel, etc) from the template directory to
 * the project `root` directory, and return the absolute paths of the files
 * copied, so that they can be deleted later.
 * Existing files in `root` will not be replaced.
 */
export function copyBazelFiles(root: string, templateDir: string) {
  root = normalize(root);
  templateDir = normalize(templateDir);
  const bazelFiles: string[] = [];
  const templates = listR(templateDir);
  const useYarn = getOrCreateLockFile(root) === 'yarn.lock';

  for (const template of templates) {
    const name = template.replace('__dot__', '.').replace('.template', '');
    const source = join(templateDir, template);
    const dest = join(root, name);
    try {
      if (!existsSync(dest)) {
        if (!useYarn && name === 'WORKSPACE') {
          replaceYarnWithNpm(source, dest);
        } else if (platform() === 'darwin' && name === '.bazelrc') {
          disableSandbox(source, dest);
        } else {
          copyFileSync(source, dest);
        }
        bazelFiles.push(dest);
      }
    } catch {
    }
  }

  return bazelFiles;
}

/**
 * Delete the specified 'files'. This function never throws.
 */
export function deleteBazelFiles(files: string[]) {
  for (const file of files) {
    try {
      unlinkSync(file);
    } catch {
    }
  }
}
