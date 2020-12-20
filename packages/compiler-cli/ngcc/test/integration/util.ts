/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {MockFileSystemPosix} from '../../../src/ngtsc/file_system/testing';

import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

export type PackageSources = {
  [path: string]: string;
};

/**
 * Instead of writing packaged code by hand, and manually describing the layout of the package, this
 * function transpiles the TypeScript sources into a flat file structure using the ES5 format. In
 * this package layout, all compiled sources are at the root of the package, with `.d.ts` files next
 * to the `.js` files. Each `.js` also has a corresponding `.metadata.json` file alongside with it.
 *
 * All generated code is written into the `node_modules` in the top-level filesystem, ready for use
 * in testing ngcc.
 *
 * @param pkgName The name of the package to compile.
 * @param sources The TypeScript sources to compile.
 */
export function compileIntoFlatEs5Package(pkgName: string, sources: PackageSources): void {
  compileIntoFlatPackage(pkgName, sources, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.ESNext,
    formatProperty: 'esm5',
  });
}

/**
 * Instead of writing packaged code by hand, and manually describing the layout of the package,
 * this function transpiles the TypeScript sources into a flat file structure using the ES2015
 * format. In this package layout, all compiled sources are at the root of the package, with
 * `.d.ts` files next to the `.js` files. Each `.js` also has a corresponding `.metadata.json`
 * file alongside with it.
 *
 * All generated code is written into the `node_modules` in the top-level filesystem, ready for use
 * in testing ngcc.
 *
 * @param pkgName The name of the package to compile.
 * @param sources The TypeScript sources to compile.
 */
export function compileIntoFlatEs2015Package(pkgName: string, sources: PackageSources): void {
  compileIntoFlatPackage(pkgName, sources, {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.ESNext,
    formatProperty: 'esm2015',
  });
}

export interface FlatLayoutOptions {
  /**
   * The script target version to compile into.
   */
  target: ts.ScriptTarget;

  /**
   * The module kind to use in the compiled result.
   */
  module: ts.ModuleKind;

  /**
   * The name of the property in package.json that refers to the root source file.
   */
  formatProperty: string;
}

/**
 * Instead of writing packaged code by hand, and manually describing the layout of the package, this
 * function transpiles the TypeScript sources into a flat file structure using a single format. In
 * this package layout, all compiled sources are at the root of the package, with `.d.ts` files next
 * to the `.js` files. Each `.js` also has a corresponding `.metadata.json` file alongside with it.
 *
 * All generated code is written into the `node_modules` in the top-level filesystem, ready for use
 * in testing ngcc.
 *
 * @param pkgName The name of the package to compile.
 * @param sources The TypeScript sources to compile.
 * @param options Allows for configuration of how the sources are compiled.
 */
function compileIntoFlatPackage(
    pkgName: string, sources: PackageSources, options: FlatLayoutOptions): void {
  const fs = getFileSystem();
  const {rootNames, compileFs} = setupCompileFs(sources);

  const emit = (options: ts.CompilerOptions) => {
    const host = new MockCompilerHost(compileFs);
    const program = ts.createProgram({host, rootNames, options});
    program.emit();
  };

  emit({
    declaration: true,
    emitDecoratorMetadata: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: options.module,
    target: options.target,
    lib: [],
  });

  // Copy over the JS and .d.ts files, and add a .metadata.json for each .d.ts file.
  for (const file of rootNames) {
    const inFileBase = file.replace(/\.ts$/, '');

    const dtsContents = compileFs.readFile(compileFs.resolve(`/${inFileBase}.d.ts`));
    fs.writeFile(fs.resolve(`/node_modules/${pkgName}/${inFileBase}.d.ts`), dtsContents);

    const jsContents = compileFs.readFile(compileFs.resolve(`/${inFileBase}.js`));
    fs.writeFile(fs.resolve(`/node_modules/${pkgName}/${inFileBase}.js`), jsContents);
    fs.writeFile(fs.resolve(`/node_modules/${pkgName}/${inFileBase}.metadata.json`), '{}');
  }

  // Write the package.json
  const pkgJson: unknown = {
    name: pkgName,
    version: '0.0.1',
    [options.formatProperty]: './index.js',
    typings: './index.d.ts',
  };

  fs.writeFile(
      fs.resolve(`/node_modules/${pkgName}/package.json`), JSON.stringify(pkgJson, null, 2));
}

/**
 * Instead of writing packaged code by hand, and manually describing the layout of the package, this
 * function transpiles the TypeScript sources into a package layout that of Angular Package Format.
 * Both esm2015 and esm5 bundles are present in this layout. The .d.ts files reside in the /src
 * directory and a public .d.ts file is present in the root, re-exporting /src/index.ts.
 *
 * Flat modules (fesm2015 and fesm5) and UMD bundles are not generated like they ought to be in APF.
 *
 * All generated code is written into the `node_modules` in the top-level filesystem, ready for use
 * in testing ngcc.
 */
export function compileIntoApf(
    pkgName: string, sources: PackageSources, extraCompilerOptions: ts.CompilerOptions = {}): void {
  const fs = getFileSystem();
  const {rootNames, compileFs} = setupCompileFs(sources);

  const emit = (options: ts.CompilerOptions) => {
    const host = new MockCompilerHost(compileFs);
    const program =
        ts.createProgram({host, rootNames, options: {...extraCompilerOptions, ...options}});
    program.emit();
  };

  // Compile esm2015 into /esm2015
  compileFs.ensureDir(compileFs.resolve('esm2015'));
  emit({
    declaration: true,
    emitDecoratorMetadata: true,
    outDir: './esm2015',
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2015,
    lib: [],
  });

  fs.ensureDir(fs.resolve(`/node_modules/${pkgName}/src`));
  fs.ensureDir(fs.resolve(`/node_modules/${pkgName}/esm2015/src`));
  for (const file of rootNames) {
    const inFileBase = file.replace(/\.ts$/, '');

    // Copy declaration file into /src tree
    const dtsContents = compileFs.readFile(compileFs.resolve(`/esm2015/${inFileBase}.d.ts`));
    fs.writeFile(fs.resolve(`/node_modules/${pkgName}/src/${inFileBase}.d.ts`), dtsContents);

    // Copy compiled source file into /esm2015/src tree
    const jsContents = compileFs.readFile(compileFs.resolve(`/esm2015/${inFileBase}.js`));
    fs.writeFile(fs.resolve(`/node_modules/${pkgName}/esm2015/src/${inFileBase}.js`), jsContents);
  }
  fs.writeFile(
      fs.resolve(`/node_modules/${pkgName}/esm2015/index.js`), `export * from './src/index';`);

  // Compile esm5 into /esm5
  compileFs.ensureDir(compileFs.resolve('esm5'));
  emit({
    declaration: false,
    emitDecoratorMetadata: true,
    outDir: './esm5',
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES5,
    lib: [],
  });

  fs.ensureDir(fs.resolve(`/node_modules/${pkgName}/esm5/src`));
  for (const file of rootNames) {
    const inFileBase = file.replace(/\.ts$/, '');

    // Copy compiled source file into esm5/src tree
    const jsContents = compileFs.readFile(compileFs.resolve(`/esm5/${inFileBase}.js`));
    fs.writeFile(fs.resolve(`/node_modules/${pkgName}/esm5/src/${inFileBase}.js`), jsContents);
  }
  fs.writeFile(
      fs.resolve(`/node_modules/${pkgName}/esm5/index.js`), `export * from './src/index';`);

  // Write a main declaration and metadata file to the root
  fs.writeFile(fs.resolve(`/node_modules/${pkgName}/index.d.ts`), `export * from './src/index';`);
  fs.writeFile(fs.resolve(`/node_modules/${pkgName}/index.metadata.json`), '{}');

  // Write the package.json
  const pkgJson: unknown = {
    name: pkgName,
    version: '0.0.1',
    esm5: './esm5/index.js',
    esm2015: './esm2015/index.js',
    module: './esm2015/index.js',
    typings: './index.d.ts',
  };

  fs.writeFile(
      fs.resolve(`/node_modules/${pkgName}/package.json`), JSON.stringify(pkgJson, null, 2));
}

const stdFiles = loadStandardTestFiles({fakeCore: false});

/**
 * Prepares a mock filesystem that contains all provided source files, which can be used to emit
 * compiled code into.
 */
function setupCompileFs(sources: PackageSources): {rootNames: string[], compileFs: FileSystem} {
  const compileFs = new MockFileSystemPosix(true);
  compileFs.init(stdFiles);

  const rootNames = Object.keys(sources);

  for (const fileName of rootNames) {
    compileFs.writeFile(compileFs.resolve(fileName), sources[fileName]);
  }

  return {rootNames, compileFs};
}

/**
 * A simple `ts.CompilerHost` that uses a `FileSystem` instead of the real FS.
 *
 * TODO(alxhub): convert this into a first class `FileSystemCompilerHost` and use it as the base for
 * the entire compiler.
 */
class MockCompilerHost implements ts.CompilerHost {
  constructor(private fs: FileSystem) {}
  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    return ts.createSourceFile(
        fileName, this.fs.readFile(this.fs.resolve(fileName)), languageVersion, true,
        ts.ScriptKind.TS);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return ts.getDefaultLibFileName(options);
  }

  writeFile(fileName: string, data: string): void {
    this.fs.writeFile(this.fs.resolve(fileName), data);
  }

  getCurrentDirectory(): string {
    return this.fs.pwd();
  }
  getCanonicalFileName(fileName: string): string {
    return fileName;
  }
  useCaseSensitiveFileNames(): boolean {
    return true;
  }
  getNewLine(): string {
    return '\n';
  }
  fileExists(fileName: string): boolean {
    return this.fs.exists(this.fs.resolve(fileName));
  }
  readFile(fileName: string): string|undefined {
    const abs = this.fs.resolve(fileName);
    return this.fs.exists(abs) ? this.fs.readFile(abs) : undefined;
  }
}
