import * as path from 'path';
import * as ts from 'typescript';

import {ModuleFilenameResolver} from './api';
import {CompilerOptions} from './api';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;
const NODE_MODULES = '/node_modules/';
const IS_GENERATED = /\.(ngfactory|ngstyle|ngsummary)$/;
const SHALLOW_IMPORT = /^((\w|-)+|(@(\w|-)+(\/(\w|-)+)+))$/;

export function createModuleFilenameResolver(
    tsHost: ts.ModuleResolutionHost, options: CompilerOptions): ModuleFilenameResolver {
  const host = createModuleFilenameResolverHost(tsHost);

  return options.rootDirs && options.rootDirs.length > 0 ?
      new MultipleRootDirModuleFilenameResolver(host, options) :
      new SingleRootDirModuleFilenameResolver(host, options);
}

class SingleRootDirModuleFilenameResolver implements ModuleFilenameResolver {
  private isGenDirChildOfRootDir: boolean;
  private basePath: string;
  private genDir: string;
  private moduleFileNames = new Map<string, string|null>();

  constructor(private host: ModuleFilenameResolutionHost, private options: CompilerOptions) {
    // normalize the path so that it never ends with '/'.
    this.basePath = path.normalize(path.join(options.basePath !, '.')).replace(/\\/g, '/');
    this.genDir = path.normalize(path.join(options.genDir !, '.')).replace(/\\/g, '/');

    const genPath: string = path.relative(this.basePath, this.genDir);
    this.isGenDirChildOfRootDir = genPath === '' || !genPath.startsWith('..');
  }

  moduleNameToFileName(m: string, containingFile: string): string|null {
    const key = m + ':' + (containingFile || '');
    let result: string|null = this.moduleFileNames.get(key) || null;
    if (!result) {
      if (!containingFile) {
        if (m.indexOf('.') === 0) {
          throw new Error('Resolution of relative paths requires a containing file.');
        }
        // Any containing file gives the same result for absolute imports
        containingFile = this.getNgCanonicalFileName(path.join(this.basePath, 'index.ts'));
      }
      m = m.replace(EXT, '');
      const resolved =
          ts.resolveModuleName(m, containingFile.replace(/\\/g, '/'), this.options, this.host)
              .resolvedModule;
      result = resolved ? this.getNgCanonicalFileName(resolved.resolvedFileName) : null;
      this.moduleFileNames.set(key, result);
    }
    return result;
  }

  /**
   * We want a moduleId that will appear in import statements in the generated code.
   * These need to be in a form that system.js can load, so absolute file paths don't work.
   *
   * The `containingFile` is always in the `genDir`, where as the `importedFile` can be in
   * `genDir`, `node_module` or `basePath`.  The `importedFile` is either a generated file or
   * existing file.
   *
   *               | genDir   | node_module |  rootDir
   * --------------+----------+-------------+----------
   * generated     | relative |   relative  |   n/a
   * existing file |   n/a    |   absolute  |  relative(*)
   *
   * NOTE: (*) the relative path is computed depending on `isGenDirChildOfRootDir`.
   */
  fileNameToModuleName(importedFile: string, containingFile: string): string {
    // If a file does not yet exist (because we compile it later), we still need to
    // assume it exists it so that the `resolve` method works!
    if (!this.host.fileExists(importedFile)) {
      this.host.assumeFileExists(importedFile);
    }

    containingFile = this.rewriteGenDirPath(containingFile);
    const containingDir = path.dirname(containingFile);
    // drop extension
    importedFile = importedFile.replace(EXT, '');

    const nodeModulesIndex = importedFile.indexOf(NODE_MODULES);
    const importModule = nodeModulesIndex === -1 ?
        null :
        importedFile.substring(nodeModulesIndex + NODE_MODULES.length);
    const isGeneratedFile = IS_GENERATED.test(importedFile);

    if (isGeneratedFile) {
      // rewrite to genDir path
      if (importModule) {
        // it is generated, therefore we do a relative path to the factory
        return this.dotRelative(containingDir, this.genDir + NODE_MODULES + importModule);
      } else {
        // assume that import is also in `genDir`
        importedFile = this.rewriteGenDirPath(importedFile);
        return this.dotRelative(containingDir, importedFile);
      }
    } else {
      // user code import
      if (importModule) {
        return importModule;
      } else {
        if (!this.isGenDirChildOfRootDir) {
          // assume that they are on top of each other.
          importedFile = importedFile.replace(this.basePath, this.genDir);
        }
        if (SHALLOW_IMPORT.test(importedFile)) {
          return importedFile;
        }
        return this.dotRelative(containingDir, importedFile);
      }
    }
  }

  // We use absolute paths on disk as canonical.
  getNgCanonicalFileName(fileName: string): string { return fileName; }

  assumeFileExists(fileName: string) { this.host.assumeFileExists(fileName); }

  private dotRelative(from: string, to: string): string {
    const rPath: string = path.relative(from, to).replace(/\\/g, '/');
    return rPath.startsWith('.') ? rPath : './' + rPath;
  }

  /**
   * Moves the path into `genDir` folder while preserving the `node_modules` directory.
   */
  private rewriteGenDirPath(filepath: string) {
    const nodeModulesIndex = filepath.indexOf(NODE_MODULES);
    if (nodeModulesIndex !== -1) {
      // If we are in node_module, transplant them into `genDir`.
      return path.join(this.genDir, filepath.substring(nodeModulesIndex));
    } else {
      // pretend that containing file is on top of the `genDir` to normalize the paths.
      // we apply the `genDir` => `rootDir` delta through `rootDirPrefix` later.
      return filepath.replace(this.basePath, this.genDir);
    }
  }
}

/**
 * This version of the AotCompilerHost expects that the program will be compiled
 * and executed with a "path mapped" directory structure, where generated files
 * are in a parallel tree with the sources, and imported using a `./` relative
 * import. This requires using TS `rootDirs` option and also teaching the module
 * loader what to do.
 */
class MultipleRootDirModuleFilenameResolver implements ModuleFilenameResolver {
  private basePath: string;

  constructor(private host: ModuleFilenameResolutionHost, private options: CompilerOptions) {
    // normalize the path so that it never ends with '/'.
    this.basePath = path.normalize(path.join(options.basePath !, '.')).replace(/\\/g, '/');
  }

  getNgCanonicalFileName(fileName: string): string {
    if (!fileName) return fileName;
    // NB: the rootDirs should have been sorted longest-first
    for (const dir of this.options.rootDirs || []) {
      if (fileName.indexOf(dir) === 0) {
        fileName = fileName.substring(dir.length);
      }
    }
    return fileName;
  }

  assumeFileExists(fileName: string) { this.host.assumeFileExists(fileName); }

  moduleNameToFileName(m: string, containingFile: string): string|null {
    if (!containingFile) {
      if (m.indexOf('.') === 0) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      // Any containing file gives the same result for absolute imports
      containingFile = this.getNgCanonicalFileName(path.join(this.basePath, 'index.ts'));
    }
    for (const root of this.options.rootDirs || ['']) {
      const rootedContainingFile = path.join(root, containingFile);
      const resolved =
          ts.resolveModuleName(m, rootedContainingFile, this.options, this.host).resolvedModule;
      if (resolved) {
        if (this.options.traceResolution) {
          console.error('resolve', m, containingFile, '=>', resolved.resolvedFileName);
        }
        return this.getNgCanonicalFileName(resolved.resolvedFileName);
      }
    }
    return null;
  }

  /**
   * We want a moduleId that will appear in import statements in the generated code.
   * These need to be in a form that system.js can load, so absolute file paths don't work.
   * Relativize the paths by checking candidate prefixes of the absolute path, to see if
   * they are resolvable by the moduleResolution strategy from the CompilerHost.
   */
  fileNameToModuleName(importedFile: string, containingFile: string): string {
    if (this.options.traceResolution) {
      console.error(
          'getImportPath from containingFile', containingFile, 'to importedFile', importedFile);
    }

    // If a file does not yet exist (because we compile it later), we still need to
    // assume it exists so that the `resolve` method works!
    if (!this.host.fileExists(importedFile)) {
      if (this.options.rootDirs && this.options.rootDirs.length > 0) {
        this.host.assumeFileExists(path.join(this.options.rootDirs[0], importedFile));
      } else {
        this.host.assumeFileExists(importedFile);
      }
    }

    const resolvable = (candidate: string) => {
      const resolved = this.moduleNameToFileName(candidate, importedFile);
      return resolved && resolved.replace(EXT, '') === importedFile.replace(EXT, '');
    };

    const importModuleName = importedFile.replace(EXT, '');
    const parts = importModuleName.split(path.sep).filter(p => !!p);
    let foundRelativeImport: string|undefined;

    for (let index = parts.length - 1; index >= 0; index--) {
      let candidate = parts.slice(index, parts.length).join(path.sep);
      if (resolvable(candidate)) {
        return candidate;
      }
      candidate = '.' + path.sep + candidate;
      if (resolvable(candidate)) {
        foundRelativeImport = candidate;
      }
    }

    if (foundRelativeImport) return foundRelativeImport;

    // Try a relative import
    const candidate = path.relative(path.dirname(containingFile), importModuleName);
    if (resolvable(candidate)) {
      return candidate;
    }

    throw new Error(
        `Unable to find any resolvable import for ${importedFile} relative to ${containingFile}`);
  }
}

interface ModuleFilenameResolutionHost extends ts.ModuleResolutionHost {
  assumeFileExists(fileName: string): void;
}

function createModuleFilenameResolverHost(host: ts.ModuleResolutionHost):
    ModuleFilenameResolutionHost {
  const assumedExists = new Set<string>();
  const resolveModuleNameHost = Object.create(host);
  // When calling ts.resolveModuleName, additional allow checks for .d.ts files to be done based on
  // checks for .ngsummary.json files, so that our codegen depends on fewer inputs and requires
  // to be called less often.
  // This is needed as we use ts.resolveModuleName in reflector_host and it should be able to
  // resolve summary file names.
  resolveModuleNameHost.fileExists = (fileName: string): boolean => {
    if (assumedExists.has(fileName)) {
      return true;
    }

    if (host.fileExists(fileName)) {
      return true;
    }

    if (DTS.test(fileName)) {
      const base = fileName.substring(0, fileName.length - 5);
      return host.fileExists(base + '.ngsummary.json');
    }

    return false;
  };

  resolveModuleNameHost.assumeFileExists = (fileName: string) => assumedExists.add(fileName);
  // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
  // https://github.com/Microsoft/TypeScript/issues/9552
  resolveModuleNameHost.realpath = (fileName: string) => fileName;

  return resolveModuleNameHost;
}