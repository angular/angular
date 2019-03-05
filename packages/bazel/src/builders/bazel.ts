/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types='node'/>

import {Path, basename, dirname, getSystemPath, join} from '@angular-devkit/core';
import {resolve} from '@angular-devkit/core/node';
import {Host} from '@angular-devkit/core/src/virtual-fs/host';
import {spawn} from 'child_process';

export type Executable = 'bazel' | 'ibazel';
export type Command = 'build' | 'test' | 'run' | 'coverage' | 'query';

/**
 * Spawn the Bazel process. Trap SINGINT to make sure Bazel process is killed.
 */
export function runBazel(
    projectDir: Path, binary: Path, command: Command, workspaceTarget: string, flags: string[]) {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn(getSystemPath(binary), [command, workspaceTarget, ...flags], {
      cwd: getSystemPath(projectDir),
      stdio: 'inherit',
      shell: false,
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
        reject(new Error(`${basename(binary)} failed with code ${code}.`));
      }
    });
  });
}

/**
 * Resolves the path to `@bazel/bazel` or `@bazel/ibazel`.
 */
export function checkInstallation(name: Executable, projectDir: Path): string {
  const packageName = `@bazel/${name}`;
  try {
    return resolve(packageName, {
      basedir: projectDir,
    });
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
export async function getTemplateDir(host: Host, root: Path): Promise<Path> {
  const packageJson = resolve('@angular/bazel', {
    basedir: root,
    resolvePackageJson: true,
  });
  const packageDir = dirname(packageJson as Path);
  const templateDir = join(packageDir, 'src', 'builders', 'files');
  if (!await host.isDirectory(templateDir).toPromise()) {
    throw new Error('Could not find Bazel template directory in "@angular/bazel".');
  }
  return templateDir;
}

/**
 * Recursively list the specified 'dir' using depth-first approach. Paths
 * returned are relative to 'dir'.
 */
function listR(host: Host, dir: Path): Promise<Path[]> {
  async function list(dir: Path, root: Path, results: Path[]) {
    const paths = await host.list(dir).toPromise();
    for (const path of paths) {
      const absPath = join(dir, path);
      const relPath = join(root, path);
      if (await host.isFile(absPath).toPromise()) {
        results.push(relPath);
      } else {
        await list(absPath, relPath, results);
      }
    }
    return results;
  }

  return list(dir, '' as Path, []);
}

/**
 * Copy the file from 'source' to 'dest'.
 */
async function copyFile(host: Host, source: Path, dest: Path) {
  const buffer = await host.read(source).toPromise();
  await host.write(dest, buffer).toPromise();
}

/**
 * Copy Bazel files (WORKSPACE, BUILD.bazel, etc) from the template directory to
 * the project `root` directory, and return the absolute paths of the files
 * copied, so that they can be deleted later.
 * Existing files in `root` will not be replaced.
 */
export async function copyBazelFiles(host: Host, root: Path, templateDir: Path) {
  const bazelFiles: Path[] = [];
  const templates = await listR(host, templateDir);

  await Promise.all(templates.map(async(template) => {
    const name = template.replace('__dot__', '.').replace('.template', '');
    const source = join(templateDir, template);
    const dest = join(root, name);
    try {
      const exists = await host.exists(dest).toPromise();
      if (!exists) {
        await copyFile(host, source, dest);
        bazelFiles.push(dest);
      }
    } catch {
    }
  }));

  return bazelFiles;
}

/**
 * Delete the specified 'files' and return a promise that always resolves.
 */
export function deleteBazelFiles(host: Host, files: Path[]) {
  return Promise.all(files.map(async(file) => {
    try {
      await host.delete(file).toPromise();
    } catch {
    }
  }));
}
