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
import {AbsoluteFsPath, absoluteFrom} from '../../file_system';

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

export function isExported(node: ts.Declaration): boolean {
  let topLevel: ts.Node = node;
  if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList(node.parent)) {
    topLevel = node.parent.parent;
  }
  return topLevel.modifiers !== undefined &&
      topLevel.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

export function getRootDirs(host: ts.CompilerHost, options: ts.CompilerOptions): AbsoluteFsPath[] {
  const rootDirs: string[] = [];
  if (options.rootDirs !== undefined) {
    rootDirs.push(...options.rootDirs);
  } else if (options.rootDir !== undefined) {
    rootDirs.push(options.rootDir);
  } else {
    rootDirs.push(host.getCurrentDirectory());
  }

  // In Windows the above might not always return posix separated paths
  // See:
  // https://github.com/Microsoft/TypeScript/blob/3f7357d37f66c842d70d835bc925ec2a873ecfec/src/compiler/sys.ts#L650
  // Also compiler options might be set via an API which doesn't normalize paths
  return rootDirs.map(rootDir => absoluteFrom(host.getCanonicalFileName(rootDir)));
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

/**
 * Asserts that the keys `K` form a subset of the keys of `T`.
 */
export type SubsetOfKeys<T, K extends keyof T> = K;

/**
 * Extract the `ts.TypeNode` array of types from a `ts.TupleTypeNode`.
 *
 * This is a slightly specialized operation currently due to incompatibilities between TypeScript
 * 4.0 and prior versions.
 *
 * TODO(alan-agius4): remove `def.elementTypes` and casts when TS 3.9 support is dropped and G3 is
 * using TS 4.0.
 */
export function getTupleTypeNodeElements(node: ts.TupleTypeNode): ts.NodeArray<ts.TypeNode> {
  const nodeAny = node as any;
  if (nodeAny.elements !== undefined) {
    // TypeScript 4.0 uses `node.elements` for tuple elements.
    return nodeAny.elements;
  } else {
    // TypeScript < 4.0 used `node.elementTypes` instead.
    const elementTypes: ts.NodeArray<ts.TypeNode>|undefined = nodeAny.elementTypes;
    if (!Array.isArray(elementTypes)) {
      throw new Error(`AssertionError: Expected ts.TupleTypeNode to have an array of elementTypes`);
    }

    return elementTypes;
  }
}

/**
 * Create a `ts.TypeNode` for a `null` literal.
 *
 * This is a slightly specialized operation currently due to incompatibilities between TypeScript
 * 4.0 and prior versions. Because g3 builds against TS 3.9 still, care must be taken to not make
 * use of any TS 4.0 APIs just yet. Therefore, both cases here utilize casts to `any` to ensure they
 * will both be accepted by either compiler.
 *
 * TODO(alan-agius4): remove once TS 3.9 support is no longer needed.
 */
export function createNullTypeNode(): ts.TypeNode {
  if (!ts.versionMajorMinor.startsWith('3.')) {
    // TypeScript 4.0+ uses `ts.createLiteralTypeNode(ts.createNull())` for `null` type literals.
    return ts.createLiteralTypeNode(ts.createNull() as any);
  } else {
    // TypeScript < 4.0 uses `ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)` instead.
    return ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword as any);
  }
}

/**
 * Check if a `ts.TypeNode` is a literal `null` type.
 *
 * See `createNullTypeNode` for information on why this is a specialized operation.
 *
 * TODO(alan-agius4): remove once TS 3.9 support is no longer needed.
 */
export function isLiteralNullTypeNode(node: ts.TypeNode): boolean {
  return node.kind === ts.SyntaxKind.NullKeyword ||
      (ts.isLiteralTypeNode(node) && node.literal.kind === ts.SyntaxKind.NullKeyword);
}

/**
 * Mutate the `pos` and `end` of a `ts.NodeArray`.
 *
 * This operation is not strictly legal per the type declaration of `ts.NodeArray`, but is supported
 * for single nodes via `ts.setSourceMapRange`. Likely this is just an omission from the TS API.
 */
export function setNodeArraySourceMapRange(
    array: ts.NodeArray<ts.Node>, pos: number, end: number): void {
  (array.pos as number) = pos;
  (array.end as number) = end;
}
