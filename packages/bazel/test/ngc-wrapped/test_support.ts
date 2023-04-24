/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runOneBuild} from '@angular/bazel';
import {runfiles} from '@bazel/runfiles';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

import {createTsConfig} from './tsconfig_template';

export interface TestSupport {
  basePath: string;
  runfilesPath: string;
  angularCorePath: string;
  typesRoots: string;
  writeConfig({
    srcTargetPath,
    depPaths,
    pathMapping,
  }: {
    srcTargetPath: string,
    depPaths?: string[],
    pathMapping?: Array<{moduleName: string; path: string;}>,
  }): {compilerOptions: ts.CompilerOptions};
  read(fileName: string): string;
  write(fileName: string, content: string): void;
  writeFiles(...mockDirs: {[fileName: string]: string}[]): void;
  shouldExist(fileName: string): void;
  shouldNotExist(fileName: string): void;
  runOneBuild(): Promise<boolean>;
}

export function setup({
  bazelBin = 'bazel-bin',
  tsconfig = 'tsconfig.json',
}: {
  bazelBin?: string,
  tsconfig?: string,
} = {}): TestSupport {
  const runfilesPath = process.env['TEST_SRCDIR'];

  const basePath = makeTempDir(runfilesPath);

  console.error(basePath);

  const bazelBinPath = path.resolve(basePath, bazelBin);
  fs.mkdirSync(bazelBinPath);

  const angularCorePath = runfiles.resolve('angular/packages/core');
  const tsConfigJsonPath = path.resolve(basePath, tsconfig);

  const emptyTsConfig = ts.readConfigFile(
      runfiles.resolve('angular/packages/bazel/test/ngc-wrapped/empty/empty_tsconfig.json'), read);
  const typesRoots = (emptyTsConfig as any).config.compilerOptions.typeRoots[0];

  return {
    basePath,
    runfilesPath,
    angularCorePath,
    typesRoots,
    write,
    read,
    writeFiles,
    writeConfig,
    shouldExist,
    shouldNotExist,
    runOneBuild: runOneBuildImpl,
  };

  // -----------------
  // helpers

  function mkdirp(dirname: string) {
    const parent = path.dirname(dirname);
    if (!fs.existsSync(parent)) {
      mkdirp(parent);
    }
    fs.mkdirSync(dirname);
  }

  function write(fileName: string, content: string) {
    const dir = path.dirname(fileName);
    if (dir != '.') {
      const newDir = path.resolve(basePath, dir);
      if (!fs.existsSync(newDir)) mkdirp(newDir);
    }
    fs.writeFileSync(path.resolve(basePath, fileName), content, {encoding: 'utf-8'});
  }

  function read(fileName: string) {
    return fs.readFileSync(path.resolve(basePath, fileName), {encoding: 'utf-8'});
  }

  function writeFiles(...mockDirs: {[fileName: string]: string}[]) {
    mockDirs.forEach((dir) => {
      Object.keys(dir).forEach((fileName) => {
        write(fileName, dir[fileName]);
      });
    });
  }

  function writeConfig({
    srcTargetPath,
    depPaths = [],
    pathMapping = [],
  }: {
    srcTargetPath: string,
    depPaths?: string[],
    pathMapping?: Array<{moduleName: string; path: string;}>,
  }) {
    srcTargetPath = path.resolve(basePath, srcTargetPath);
    const compilationTargetSrc = listFilesRecursive(srcTargetPath);
    const target = '//' + path.relative(basePath, srcTargetPath);
    const files = [...compilationTargetSrc];

    depPaths = depPaths.concat([angularCorePath]);
    pathMapping = pathMapping.concat([
      {moduleName: '@angular/core', path: angularCorePath},
      {moduleName: 'angular/packages/core', path: angularCorePath}
    ]);

    for (const depPath of depPaths) {
      files.push(...listFilesRecursive(depPath).filter(f => f.endsWith('.d.ts')));
    }

    const pathMappingObj = {};
    for (const mapping of pathMapping) {
      pathMappingObj[mapping.moduleName] = [mapping.path];
      pathMappingObj[path.posix.join(mapping.moduleName, '*')] =
          [path.posix.join(mapping.path, '*')];
    }

    const emptyTsConfig = ts.readConfigFile(
        runfiles.resolve('angular/packages/bazel/test/ngc-wrapped/empty/empty_tsconfig.json'),
        read);

    const tsconfig = createTsConfig({
      defaultTsConfig: emptyTsConfig.config,
      rootDir: basePath,
      target: target,
      outDir: bazelBinPath,
      compilationTargetSrc,
      files: files,
      pathMapping: pathMappingObj,
    });
    write(path.resolve(basePath, tsConfigJsonPath), JSON.stringify(tsconfig, null, 2));
    return tsconfig;
  }

  function shouldExist(fileName: string) {
    if (!fs.existsSync(path.resolve(basePath, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (basePath: ${basePath})`);
    }
  }

  function shouldNotExist(fileName: string) {
    if (fs.existsSync(path.resolve(basePath, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (basePath: ${basePath})`);
    }
  }

  async function runOneBuildImpl(): Promise<boolean> {
    return runOneBuild(['@' + tsConfigJsonPath]);
  }
}

function makeTempDir(baseDir: string): string {
  const id = (Math.random() * 1000000).toFixed(0);
  const dir = path.join(baseDir, `tmp.${id}`);
  fs.mkdirSync(dir);
  return dir;
}

export function listFilesRecursive(dir: string, fileList: string[] = []) {
  fs.readdirSync(dir).forEach(file => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      listFilesRecursive(path.join(dir, file), fileList);
    } else {
      fileList.push(path.join(dir, file));
    }
  });
  return fileList;
}
