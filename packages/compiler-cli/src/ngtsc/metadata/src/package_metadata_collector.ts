import ts from 'typescript';
import {ModuleResolver, Reference} from '../../imports';
import {MetadataReader, MetaKind} from './api';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import path from 'path';

interface PackageJsonContent {
  types?: string;
  type?: string;
  imports?: object;
  exports?: object;
  main?: string;
  typings?: string;
  name?: string;
}

interface MetaInfoInSourceFile {
  directive: ClassDeclaration[];
}

const NODE_MODULES = 'node_modules';

/**
 * The module specifier of the source file. used to import the directive/pipe in the source file.
 */
const moduleNameForSourceFileMap = new WeakMap<ts.SourceFile, string | undefined>();
/**
 * The metadata collected from the source file.
 */
const metaInfoForSourceFileMap = new WeakMap<ts.SourceFile, MetaInfoInSourceFile>();

/**
 * This class collects the metadata from the package that is compatible with APF.
 * Note that the package must be used in the project; only then can the metadata
 * within the package be found.
 *
 * The metadata is saved in the source file. If the source file is changed, the compiler
 * will scan the AST to find the meta and check the meta's module specifier by reading
 * the `package.json` file.
 */
export class PackageMetadataCollector {
  private packageJsonCache: PackageJsonCache;
  private directiveClassDeclarations: ClassDeclaration[] = [];
  private referenceGraph: NodeReferenceGraph;
  private moduleNameForNode: WeakMap<ts.Node, string | undefined> = new WeakMap();

  constructor(
    private metaReader: MetadataReader,
    private reflector: ReflectionHost,
    moduleResolver: ModuleResolver,
    program: ts.Program,
    compilerHost: Pick<ts.CompilerHost, 'readFile' | 'fileExists'>,
  ) {
    this.packageJsonCache = new PackageJsonCache(compilerHost);
    this.referenceGraph = new NodeReferenceGraph(moduleResolver, reflector, program);
  }

  public analyze(sf: ts.SourceFile) {
    if (!sf.isDeclarationFile || !sf.fileName.includes(NODE_MODULES)) {
      return;
    }

    this.referenceGraph.updateReferenceGraph(sf);

    let metaInfo: MetaInfoInSourceFile | undefined = metaInfoForSourceFileMap.get(sf);

    if (metaInfo === undefined) {
      metaInfo = {directive: []};
      this.collectMeta(sf, metaInfo);
    }

    for (const directiveClassDeclaration of metaInfo.directive) {
      this.directiveClassDeclarations.push(directiveClassDeclaration);
    }

    metaInfoForSourceFileMap.set(sf, metaInfo);
  }

  private collectMeta(sf: ts.SourceFile, metaInfo: MetaInfoInSourceFile) {
    const visit = (node: ts.Node) => {
      this.record(node, metaInfo);

      node.forEachChild(visit);
    };
    sf.forEachChild(visit);
  }

  private getModuleNameOfNodeWithCache(node: ClassDeclaration): string | undefined {
    if (this.moduleNameForNode.has(node)) {
      return this.moduleNameForNode.get(node);
    }
    const moduleName = this.getModuleNameOfNode(node);
    this.moduleNameForNode.set(node, moduleName);
    return moduleName;
  }

  private getModuleNameOfNode(node: ClassDeclaration): string | undefined {
    let moduleName = this.getModuleNameOfSourceFile(node.getSourceFile());
    if (moduleName !== undefined) {
      return moduleName;
    }
    const sf = this.referenceGraph.findMatchedNodeReferenceFile(node, (sf) => {
      const currentModuleName = this.getModuleNameOfSourceFile(sf);
      return currentModuleName !== undefined;
    });
    if (sf !== undefined) {
      moduleName = this.getModuleNameOfSourceFile(sf);
    }
    return moduleName;
  }

  private record(node: ts.Node, directiveMetaNodes: MetaInfoInSourceFile) {
    if (!this.reflector.isClass(node) || !this.reflector.isStaticallyExported(node)) {
      return;
    }

    const directiveMeta = this.metaReader.getDirectiveMetadata(new Reference(node));
    if (directiveMeta !== null) {
      directiveMetaNodes.directive.push(node);
      return;
    }
  }

  private getModuleNameOfSourceFile(sf: ts.SourceFile): string | undefined {
    if (moduleNameForSourceFileMap.has(sf)) {
      return moduleNameForSourceFileMap.get(sf);
    }

    const dirFileName = sf.fileName;
    const prefixFileName = getPrefixBeforeLastMatch(dirFileName, NODE_MODULES);
    if (prefixFileName === undefined) {
      return;
    }
    const moduleName = forEachAncestorDirectory(
      dirFileName,
      `${prefixFileName}/${NODE_MODULES}`,
      (dire) => {
        const packageJsonContent = this.packageJsonCache.getInDirectory(dire);
        if (packageJsonContent === undefined) {
          return;
        }

        const packageJsonPath = dire + '/package.json';
        const moduleName = tryGetModuleNameAsNodeModule(
          dirFileName,
          packageJsonPath,
          packageJsonContent,
        );

        return moduleName;
      },
    );

    moduleNameForSourceFileMap.set(sf, moduleName);
    return moduleName;
  }

  public getModuleSpecifier(dir: ClassDeclaration): string | undefined {
    return this.moduleNameForNode.get(dir);
  }

  public getKnown(kind: MetaKind): Array<ClassDeclaration> {
    switch (kind) {
      case MetaKind.Directive:
        return this.directiveClassDeclarations.filter(
          (classDec) => this.getModuleNameOfNodeWithCache(classDec) !== undefined,
        );
      default:
        return [];
    }
  }
}

/**
 * Find the last matched word in the string, and return the prefix string before the last matched word.
 */
function getPrefixBeforeLastMatch(input: string, word: string): string | undefined {
  const lastIndex = input.lastIndexOf(word);
  if (lastIndex === -1) {
    return undefined;
  }
  return input.substring(0, lastIndex);
}

function forEachAncestorDirectory<T>(
  fileName: string,
  root: string,
  cb: (parentDirectory: string) => T | undefined,
): T | undefined {
  let parentDirectory = path.dirname(fileName);

  while (parentDirectory !== root && parentDirectory !== '/') {
    const res = cb(parentDirectory);
    if (res !== undefined) {
      return res;
    }
    parentDirectory = path.dirname(parentDirectory);
  }

  return undefined;
}

function tryGetModuleNameAsNodeModule(
  dtsPath: string,
  packageJsonPath: string,
  packageJsonContent: PackageJsonContent,
): string | undefined {
  const packageName = packageJsonContent.name;
  if (packageName === undefined) {
    return;
  }

  const mainTypeFileRelative = packageJsonContent.typings || packageJsonContent.types;
  const packageExports = packageJsonContent.exports;
  if (packageExports !== undefined) {
    return getModuleNameFromExports(packageExports, packageName, packageJsonPath, dtsPath);
  }

  if (mainTypeFileRelative !== undefined) {
    return getModuleNameFromPackageTypes(
      dtsPath,
      mainTypeFileRelative,
      packageJsonPath,
      packageName,
    );
  }

  return undefined;
}

function getModuleNameFromPackageTypes(
  dtsPath: string,
  typePath: string,
  packageJsonPath: string,
  packageName: string,
): string | undefined {
  const packageJsonDirName = path.posix.dirname(packageJsonPath);
  const mainFileAbsolutePath = path.posix.join(packageJsonDirName, typePath);
  if (removeFileExt(dtsPath) === removeFileExt(mainFileAbsolutePath)) {
    return packageName;
  }
  return undefined;
}

/**
 *  ```json
 *  "exports": {
 *     "./button": {
 *       "types": "./button/index.d.ts"
 *     }
 *  }
 *  ```
 */
function getModuleNameFromExports(
  exports: unknown,
  packageName: string,
  packageJsonFile: string,
  dtsFile: string,
): string | undefined {
  if (
    typeof exports === 'object' &&
    exports !== null &&
    !Array.isArray(exports) &&
    allKeysStartWithDot(exports)
  ) {
    for (const key of Object.keys(exports)) {
      const packageNameWithKey = path.posix.join(packageName, key);
      const finalizePackageName = getModuleNameFromExportsSubPath(
        exports,
        key,
        packageNameWithKey,
        packageJsonFile,
        dtsFile,
      );
      if (finalizePackageName !== undefined) {
        return finalizePackageName;
      }
    }
  }
  return undefined;
}

/**
 *  ```json
 *  "exports": {
 *     "./button": {
 *       "types": "./button/index.d.ts"
 *     }
 *  }
 *  ```
 *
 *  @param subPath "./button"
 */
function getModuleNameFromExportsSubPath(
  exports: unknown,
  subPath: string,
  packageName: string,
  packageJsonFile: string,
  dtsFile: string,
): string | undefined {
  if (typeof exports !== 'object' || exports === null || Array.isArray(exports)) {
    return undefined;
  }

  const directoryExports = (exports as Record<string, {}>)[subPath];

  // https://github.com/microsoft/TypeScript/blob/21c1a61b49082915f93e3327dad0d73205cf4273/src/compiler/moduleSpecifiers.ts#L1131
  if (subPath.endsWith('/')) {
    return undefined;
  } else if (subPath.includes('*')) {
    return undefined;
  } else {
    return getModuleNameFromExportsExact(directoryExports, packageName, packageJsonFile, dtsFile);
  }
}

/**
 *  ```json
 *  {
 *     "./button": {
 *       "types": "./button/index.d.ts"
 *     }
 *  }
 *  ```
 *
 */
function getModuleNameFromExportsExact(
  directoryExports: unknown,
  packageName: string,
  packageJsonFile: string,
  dtsFile: string,
): string | undefined {
  /**
   * ```json
   * "exports": {
   *    ".": {
   *       "types": {
   *          "import": "./index.d.mts",
   *          "default": "./index.d.ts"
   *        }
   *     },
   *  },
   * ```
   *
   * the types may be an object.
   */
  const typesPath = (directoryExports as Record<'types', string | {} | undefined>)['types'];
  if (typeof typesPath !== 'string') {
    return undefined;
  }
  const typePathPattern = resolvePathFromPackageJson(packageJsonFile, typesPath);
  if (dtsFile === typePathPattern) {
    return packageName;
  }

  return undefined;
}

function allKeysStartWithDot(value: object) {
  return Object.keys(value).every((key) => key.startsWith('.'));
}

function removeFileExt(pathName: string) {
  const ext = path.posix.extname(pathName);
  if (ext.length > 0) {
    return pathName.slice(0, pathName.length - ext.length);
  }
  return pathName;
}

function resolvePathFromPackageJson(packageJsonFile: string, subPath: string) {
  return path.posix.resolve(path.dirname(packageJsonFile), subPath);
}

class PackageJsonCache {
  private packageJsonCache = new Map<string, PackageJsonContent>();
  private directoryHasPackageJsonCache = new Map<string, boolean>();

  constructor(private compilerHost: Pick<ts.CompilerHost, 'readFile' | 'fileExists'>) {}
  getInDirectory(directory: string): PackageJsonContent | undefined {
    if (this.packageJsonCache.has(directory)) {
      return this.packageJsonCache.get(directory)!;
    }
    if (!this.directoryHasPackageJson(directory)) {
      return undefined;
    }

    const packageJsonPath = directory + '/package.json';
    const packageJsonString = this.compilerHost.readFile(packageJsonPath);
    if (packageJsonString === undefined) {
      return undefined;
    }
    const packageJsonContent = JSON.parse(packageJsonString) as PackageJsonContent;
    this.packageJsonCache.set(directory, packageJsonContent);
    return packageJsonContent;
  }

  private directoryHasPackageJson(directory: string): boolean {
    if (this.directoryHasPackageJsonCache.has(directory)) {
      return this.directoryHasPackageJsonCache.get(directory)!;
    }
    const packageJsonPath = directory + '/package.json';
    const hasPackageJson = this.compilerHost.fileExists(packageJsonPath);
    this.directoryHasPackageJsonCache.set(directory, hasPackageJson);
    return hasPackageJson;
  }
}

/**
 * Cache the file imported by the `SourceFile`.
 */
const importedFileNameOfSourceFile = new WeakMap<ts.SourceFile, string[]>();
/**
 * Used to track the file that may export a specific node.
 *
 * For example, if the `NgForOf` is exported in the `public-api.d.ts` file and
 * `public-api.d.ts` is exported by `index.d.ts`. This can used to find the
 * `index.d.ts` file that exported the `NgForOf`.
 */
class NodeReferenceGraph {
  private referenceGraph = new Map<string, string[]>();

  constructor(
    private moduleResolver: ModuleResolver,
    private reflector: ReflectionHost,
    private program: ts.Program,
  ) {}

  updateReferenceGraph(sourceFile: ts.SourceFile) {
    let fileNames: string[] | undefined = importedFileNameOfSourceFile.get(sourceFile);
    if (fileNames === undefined) {
      fileNames = this.getImportedFiles(sourceFile);
    }
    importedFileNameOfSourceFile.set(sourceFile, fileNames);

    for (const fileName of fileNames) {
      let targetDep = this.referenceGraph.get(fileName);
      if (targetDep === undefined) {
        targetDep = [];
      }
      targetDep.push(sourceFile.fileName);
      this.referenceGraph.set(fileName, targetDep);
    }
  }

  private getImportedFiles(sourceFile: ts.SourceFile) {
    const fileNames: string[] = [];
    sourceFile.forEachChild((node) => {
      if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
        return;
      }
      const moduleSpecifier = node.moduleSpecifier;
      if (moduleSpecifier === undefined) {
        return;
      }
      if (!ts.isStringLiteral(moduleSpecifier)) {
        return;
      }
      const importPath = moduleSpecifier.text;
      const resolvedModule = this.moduleResolver.resolveModule(importPath, sourceFile.fileName);
      if (resolvedModule === null) {
        return;
      }

      fileNames.push(resolvedModule.fileName);
    });
    return fileNames;
  }

  /**
   * Find an matched file that exports the node.
   *
   * For example, an npm package exports the `index.d.ts` file, but the Angular component
   * is located in the `public-api.d.ts` file. This method can be used to find the
   * `index.d.ts` file.
   */
  findMatchedNodeReferenceFile(
    node: ts.Node,
    checkFile: (fileName: ts.SourceFile) => boolean,
  ): ts.SourceFile | undefined {
    const sourceFile = node.getSourceFile();
    const source = sourceFile.fileName;
    let queue = this.referenceGraph.get(source);
    if (queue === undefined) {
      return;
    }

    const seenFiles = new Set<string>();

    while (queue.length > 0) {
      const currentFileName = queue.shift()!;
      if (seenFiles.has(currentFileName)) {
        continue;
      }
      seenFiles.add(currentFileName);
      const sf = this.program.getSourceFile(currentFileName);
      if (sf === undefined) {
        continue;
      }
      const exportMap = this.reflector.getExportsOfModule(sf);
      let className = '';
      if (ts.isClassDeclaration(node)) {
        className = node.name?.getText() || '';
      }
      if (exportMap?.get(className)?.node !== node) {
        continue;
      }
      if (checkFile(sf)) {
        return sf;
      }
      const newDepFromCurrentFile = this.referenceGraph.get(currentFileName);
      queue = queue.concat(newDepFromCurrentFile || []);
    }
    return;
  }
}
