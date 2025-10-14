/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const TS = /\.tsx?$/i;
const D_TS = /\.d\.ts$/i;
import ts from 'typescript';
import {getFileSystem} from '../../file_system';
export function isSymbolWithValueDeclaration(symbol) {
  // If there is a value declaration set, then the `declarations` property is never undefined. We
  // still check for the property to exist as this matches with the type that `symbol` is narrowed
  // to.
  return (
    symbol != null && symbol.valueDeclaration !== undefined && symbol.declarations !== undefined
  );
}
export function isDtsPath(filePath) {
  return D_TS.test(filePath);
}
export function isNonDeclarationTsPath(filePath) {
  return TS.test(filePath) && !D_TS.test(filePath);
}
export function isFromDtsFile(node) {
  let sf = node.getSourceFile();
  if (sf === undefined) {
    sf = ts.getOriginalNode(node).getSourceFile();
  }
  return sf !== undefined && sf.isDeclarationFile;
}
export function nodeNameForError(node) {
  if (node.name !== undefined && ts.isIdentifier(node.name)) {
    return node.name.text;
  } else {
    const kind = ts.SyntaxKind[node.kind];
    const {line, character} = ts.getLineAndCharacterOfPosition(
      node.getSourceFile(),
      node.getStart(),
    );
    return `${kind}@${line}:${character}`;
  }
}
export function getSourceFile(node) {
  // In certain transformation contexts, `ts.Node.getSourceFile()` can actually return `undefined`,
  // despite the type signature not allowing it. In that event, get the `ts.SourceFile` via the
  // original node instead (which works).
  const directSf = node.getSourceFile();
  return directSf !== undefined ? directSf : ts.getOriginalNode(node).getSourceFile();
}
export function getSourceFileOrNull(program, fileName) {
  return program.getSourceFile(fileName) || null;
}
export function getTokenAtPosition(sf, pos) {
  // getTokenAtPosition is part of TypeScript's private API.
  return ts.getTokenAtPosition(sf, pos);
}
export function identifierOfNode(decl) {
  if (decl.name !== undefined && ts.isIdentifier(decl.name)) {
    return decl.name;
  } else {
    return null;
  }
}
export function isDeclaration(node) {
  return isValueDeclaration(node) || isTypeDeclaration(node);
}
export function isValueDeclaration(node) {
  return (
    ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)
  );
}
export function isTypeDeclaration(node) {
  return (
    ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)
  );
}
export function isNamedDeclaration(node) {
  const namedNode = node;
  return namedNode.name !== undefined && ts.isIdentifier(namedNode.name);
}
export function isExported(node) {
  let topLevel = node;
  if (ts.isVariableDeclaration(node) && ts.isVariableDeclarationList(node.parent)) {
    topLevel = node.parent.parent;
  }
  const modifiers = ts.canHaveModifiers(topLevel) ? ts.getModifiers(topLevel) : undefined;
  return (
    modifiers !== undefined &&
    modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
  );
}
export function getRootDirs(host, options) {
  const rootDirs = [];
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
  return rootDirs.map((rootDir) => fs.resolve(cwd, host.getCanonicalFileName(rootDir)));
}
export function nodeDebugInfo(node) {
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
  moduleName,
  containingFile,
  compilerOptions,
  compilerHost,
  moduleResolutionCache,
) {
  if (compilerHost.resolveModuleNames) {
    return compilerHost.resolveModuleNames(
      [moduleName],
      containingFile,
      undefined, // reusedNames
      undefined, // redirectedReference
      compilerOptions,
    )[0];
  } else {
    return ts.resolveModuleName(
      moduleName,
      containingFile,
      compilerOptions,
      compilerHost,
      moduleResolutionCache !== null ? moduleResolutionCache : undefined,
    ).resolvedModule;
  }
}
/** Returns true if the node is an assignment expression. */
export function isAssignment(node) {
  return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}
/**
 * Obtains the non-redirected source file for `sf`.
 */
export function toUnredirectedSourceFile(sf) {
  const redirectInfo = sf.redirectInfo;
  if (redirectInfo === undefined) {
    return sf;
  }
  return redirectInfo.unredirected;
}
//# sourceMappingURL=typescript.js.map
