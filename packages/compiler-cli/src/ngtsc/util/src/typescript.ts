/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const TS = /\.tsx?$/i;
const D_TS = /\.d\.ts$/i;

import * as ts from 'typescript';
import {AbsoluteFsPath, getFileSystem} from '../../file_system';
import {DeclarationNode} from '../../reflection';

/**
 * Type describing a symbol that is guaranteed to have a value declaration.
 */
export type SymbolWithValueDeclaration = ts.Symbol&{
  valueDeclaration: ts.Declaration;
  declarations: ts.Declaration[];
};

export function isSymbolWithValueDeclaration(symbol: ts.Symbol|null|
                                             undefined): symbol is SymbolWithValueDeclaration {
  // If there is a value declaration set, then the `declarations` property is never undefined. We
  // still check for the property to exist as this matches with the type that `symbol` is narrowed
  // to.
  return symbol != null && symbol.valueDeclaration !== undefined &&
      symbol.declarations !== undefined;
}

export function isDtsPath(filePath: string): boolean {
  return D_TS.test(filePath);
}

export function isNonDeclarationTsPath(filePath: string): boolean {
  return TS.test(filePath) && !D_TS.test(filePath);
}

export function isFromDtsFile(node: ts.Node): boolean {
  let sf: ts.SourceFile|undefined = node.getSourceFile();
  if (sf === undefined) {
    sf = ts.getOriginalNode(node).getSourceFile();
  }
  return sf !== undefined && sf.isDeclarationFile;
}

export function nodeNameForError(node: ts.Node&{name?: ts.Node}): string {
  if (node.name !== undefined && ts.isIdentifier(node.name)) {
    return node.name.text;
  } else {
    const kind = ts.SyntaxKind[node.kind];
    const {line, character} =
        ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    return `${kind}@${line}:${character}`;
  }
}

export function getSourceFile(node: ts.Node): ts.SourceFile {
  // In certain transformation contexts, `ts.Node.getSourceFile()` can actually return `undefined`,
  // despite the type signature not allowing it. In that event, get the `ts.SourceFile` via the
  // original node instead (which works).
  const directSf = node.getSourceFile() as ts.SourceFile | undefined;
  return directSf !== undefined ? directSf : ts.getOriginalNode(node).getSourceFile();
}

export function getSourceFileOrNull(program: ts.Program, fileName: AbsoluteFsPath): ts.SourceFile|
    null {
  return program.getSourceFile(fileName) || null;
}


export function getTokenAtPosition(sf: ts.SourceFile, pos: number): ts.Node {
  // getTokenAtPosition is part of TypeScript's private API.
  return (ts as any).getTokenAtPosition(sf, pos);
}

export function identifierOfNode(decl: ts.Node&{name?: ts.Node}): ts.Identifier|null {
  if (decl.name !== undefined && ts.isIdentifier(decl.name)) {
    return decl.name;
  } else {
    return null;
  }
}

export function isDeclaration(node: ts.Node): node is ts.Declaration {
  return isValueDeclaration(node) || isTypeDeclaration(node);
}

export function isValueDeclaration(node: ts.Node): node is ts.ClassDeclaration|
    ts.FunctionDeclaration|ts.VariableDeclaration {
  return ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) ||
      ts.isVariableDeclaration(node);
}

export function isTypeDeclaration(node: ts.Node): node is ts.EnumDeclaration|
    ts.TypeAliasDeclaration|ts.InterfaceDeclaration {
  return ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node);
}

export function isNamedDeclaration(node: ts.Node): node is ts.Declaration&{name: ts.Identifier} {
  const namedNode = node as {name?: ts.Identifier};
  return namedNode.name !== undefined && ts.isIdentifier(namedNode.name);
}

export function isExported(node: DeclarationNode): boolean {
  let topLevel: ts.Node = node;
  if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList(node.parent)) {
    topLevel = node.parent.parent;
  }
  return topLevel.modifiers !== undefined &&
      topLevel.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

export function getRootDirs(
    host: Pick<ts.CompilerHost, 'getCurrentDirectory'|'getCanonicalFileName'>,
    options: ts.CompilerOptions): AbsoluteFsPath[] {
  const rootDirs: string[] = [];
  const cwd = host.getCurrentDirectory();
  const fs = getFileSystem();
  if (options.rootDirs !== undefined) {
    rootDirs.push(...options.rootDirs);
  } else if (options.rootDir !== undefined) {
    rootDirs.push(options.rootDir);
  } else {
    rootDirs.push(cwd);
  }

  // In Windows the above might not always return posix separated paths
  // See:
  // https://github.com/Microsoft/TypeScript/blob/3f7357d37f66c842d70d835bc925ec2a873ecfec/src/compiler/sys.ts#L650
  // Also compiler options might be set via an API which doesn't normalize paths
  return rootDirs.map(rootDir => fs.resolve(cwd, host.getCanonicalFileName(rootDir)));
}

export function nodeDebugInfo(node: ts.Node): string {
  const sf = getSourceFile(node);
  const {line, character} = ts.getLineAndCharacterOfPosition(sf, node.pos);
  return `[${sf.fileName}: ${ts.SyntaxKind[node.kind]} @ ${line}:${character}]`;
}

/**
 * Resolve the specified `moduleName` using the given `compilerOptions` and `compilerHost`.
 *
 * This helper will attempt to use the `CompilerHost.resolveModuleNames()` method if available.
 * Otherwise it will fallback on the `ts.ResolveModuleName()` function.
 */
export function resolveModuleName(
    moduleName: string, containingFile: string, compilerOptions: ts.CompilerOptions,
    compilerHost: ts.ModuleResolutionHost&Pick<ts.CompilerHost, 'resolveModuleNames'>,
    moduleResolutionCache: ts.ModuleResolutionCache|null): ts.ResolvedModule|undefined {
  if (compilerHost.resolveModuleNames) {
    return compilerHost.resolveModuleNames(
        [moduleName], containingFile,
        undefined,  // reusedNames
        undefined,  // redirectedReference
        compilerOptions)[0];
  } else {
    return ts
        .resolveModuleName(
            moduleName, containingFile, compilerOptions, compilerHost,
            moduleResolutionCache !== null ? moduleResolutionCache : undefined)
        .resolvedModule;
  }
}

/** Returns true if the node is an assignment expression. */
export function isAssignment(node: ts.Node): node is ts.BinaryExpression {
  return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}

/**
 * Asserts that the keys `K` form a subset of the keys of `T`.
 */
export type SubsetOfKeys<T, K extends keyof T> = K;

/**
 * Represents the type `T`, with a transformation applied that turns all methods (even optional
 * ones) into required fields (which may be `undefined`, if the method was optional).
 */
export type RequiredDelegations<T> = {
  [M in keyof Required<T>]: T[M];
};

/**
 * Source files may become redirects to other source files when their package name and version are
 * identical. TypeScript creates a proxy source file for such source files which has an internal
 * `redirectInfo` property that refers to the original source file.
 */
interface RedirectedSourceFile extends ts.SourceFile {
  redirectInfo?: {unredirected: ts.SourceFile;};
}

/**
 * Obtains the non-redirected source file for `sf`.
 */
export function toUnredirectedSourceFile(sf: ts.SourceFile): ts.SourceFile {
  const redirectInfo = (sf as RedirectedSourceFile).redirectInfo;
  if (redirectInfo === undefined) {
    return sf;
  }
  return redirectInfo.unredirected;
}
