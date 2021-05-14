/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  materialMixins,
  materialFunctions,
  materialVariables,
  cdkMixins,
  cdkVariables,
  removedMaterialVariables,
  unprefixedRemovedVariables
} from './config';

/** The result of a search for imports and namespaces in a file. */
interface DetectImportResult {
  imports: string[];
  namespaces: string[];
}

/** Addition mixin and function names that can be updated when invoking migration directly. */
interface ExtraSymbols {
  mixins?: Record<string, string>;
  functions?: Record<string, string>;
}

/**
 * Migrates the content of a file to the new theming API. Note that this migration is using plain
 * string manipulation, rather than the AST from PostCSS and the schematics string manipulation
 * APIs, because it allows us to run it inside g3 and to avoid introducing new dependencies.
 * @param content Content of the file.
 * @param oldMaterialPrefix Prefix with which the old Material imports should start.
 *   Has to end with a slash. E.g. if `@import '~@angular/material/theming'` should be
 *   matched, the prefix would be `~@angular/material/`.
 * @param oldCdkPrefix Prefix with which the old CDK imports should start.
 *   Has to end with a slash. E.g. if `@import '~@angular/cdk/overlay'` should be
 *   matched, the prefix would be `~@angular/cdk/`.
 * @param newMaterialImportPath New import to the Material theming API (e.g. `~@angular/material`).
 * @param newCdkImportPath New import to the CDK Sass APIs (e.g. `~@angular/cdk`).
 * @param excludedImports Pattern that can be used to exclude imports from being processed.
 */
export function migrateFileContent(content: string,
                                   oldMaterialPrefix: string,
                                   oldCdkPrefix: string,
                                   newMaterialImportPath: string,
                                   newCdkImportPath: string,
                                   extraMaterialSymbols: ExtraSymbols = {},
                                   excludedImports?: RegExp): string {
  const materialResults = detectImports(content, oldMaterialPrefix, excludedImports);
  const cdkResults = detectImports(content, oldCdkPrefix, excludedImports);

  // Try to migrate the symbols even if there are no imports. This is used
  // to cover the case where the Components symbols were used transitively.
  content = migrateMaterialSymbols(
      content, newMaterialImportPath, materialResults, extraMaterialSymbols);
  content = migrateCdkSymbols(content, newCdkImportPath, cdkResults);
  content = replaceRemovedVariables(content, removedMaterialVariables);

  // We can assume that the migration has taken care of any Components symbols that were
  // imported transitively so we can always drop the old imports. We also assume that imports
  // to the new entry points have been added already.
  if (materialResults.imports.length) {
    content = replaceRemovedVariables(content, unprefixedRemovedVariables);
    content = removeStrings(content, materialResults.imports);
  }

  if (cdkResults.imports.length) {
    content = removeStrings(content, cdkResults.imports);
  }

  return content;
}

/**
 * Counts the number of imports with a specific prefix and extracts their namespaces.
 * @param content File content in which to look for imports.
 * @param prefix Prefix that the imports should start with.
 * @param excludedImports Pattern that can be used to exclude imports from being processed.
 */
function detectImports(content: string, prefix: string,
                       excludedImports?: RegExp): DetectImportResult {
  if (prefix[prefix.length - 1] !== '/') {
    // Some of the logic further down makes assumptions about the import depth.
    throw Error(`Prefix "${prefix}" has to end in a slash.`);
  }

  // List of `@use` namespaces from which Angular CDK/Material APIs may be referenced.
  // Since we know that the library doesn't have any name collisions, we can treat all of these
  // namespaces as equivalent.
  const namespaces: string[] = [];
  const imports: string[] = [];
  const pattern = new RegExp(`@(import|use) +['"]${escapeRegExp(prefix)}.*['"].*;?\n`, 'g');
  let match: RegExpExecArray | null = null;

  while (match = pattern.exec(content)) {
    const [fullImport, type] = match;

    if (excludedImports?.test(fullImport)) {
      continue;
    }

    if (type === 'use') {
      const namespace = extractNamespaceFromUseStatement(fullImport);

      if (namespaces.indexOf(namespace) === -1) {
        namespaces.push(namespace);
      }
    }

    imports.push(fullImport);
  }

  return {imports, namespaces};
}

/** Migrates the Material symbols in a file. */
function migrateMaterialSymbols(content: string, importPath: string,
                                detectedImports: DetectImportResult,
                                extraMaterialSymbols: ExtraSymbols = {}): string {
  const initialContent = content;
  const namespace = 'mat';
  const mixinsToUpdate = {...materialMixins, ...extraMaterialSymbols.mixins};
  const functionsToUpdate = {...materialFunctions, ...extraMaterialSymbols.functions};

  // Migrate the mixins.
  content = renameSymbols(content, mixinsToUpdate, detectedImports.namespaces, mixinKeyFormatter,
    getMixinValueFormatter(namespace));

  // Migrate the functions.
  content = renameSymbols(content, functionsToUpdate, detectedImports.namespaces,
    functionKeyFormatter, getFunctionValueFormatter(namespace));

  // Migrate the variables.
  content = renameSymbols(content, materialVariables, detectedImports.namespaces,
    variableKeyFormatter, getVariableValueFormatter(namespace));

  if (content !== initialContent) {
    // Add an import to the new API only if any of the APIs were being used.
    content = insertUseStatement(content, importPath, detectedImports.imports, namespace);
  }

  return content;
}

/** Migrates the CDK symbols in a file. */
function migrateCdkSymbols(content: string, importPath: string,
                           detectedImports: DetectImportResult): string {
  const initialContent = content;
  const namespace = 'cdk';

  // Migrate the mixins.
  content = renameSymbols(content, cdkMixins, detectedImports.namespaces, mixinKeyFormatter,
    getMixinValueFormatter(namespace));

  // Migrate the variables.
  content = renameSymbols(content, cdkVariables, detectedImports.namespaces, variableKeyFormatter,
    getVariableValueFormatter(namespace));

  // Previously the CDK symbols were exposed through `material/theming`, but now we have a
  // dedicated entrypoint for the CDK. Only add an import for it if any of the symbols are used.
  if (content !== initialContent) {
    content = insertUseStatement(content, importPath, detectedImports.imports, namespace);
  }

  return content;
}

/**
 * Renames all Sass symbols in a file based on a pre-defined mapping.
 * @param content Content of a file to be migrated.
 * @param mapping Mapping between symbol names and their replacements.
 * @param namespaces Names to iterate over and pass to getKeyPattern.
 * @param getKeyPattern Function used to turn each of the keys into a regex.
 * @param formatValue Formats the value that will replace any matches of the pattern returned by
 *  `getKeyPattern`.
 */
function renameSymbols(content: string,
                       mapping: Record<string, string>,
                       namespaces: string[],
                       getKeyPattern: (namespace: string|null, key: string) => RegExp,
                       formatValue: (key: string) => string): string {
  // The null at the end is so that we make one last pass to cover non-namespaced symbols.
  [...namespaces.slice().sort(sortLengthDescending), null].forEach(namespace => {
    // Migrate the longest keys first so that our regex-based replacements don't accidentally
    // capture keys that contain other keys. E.g. `$mat-blue` is contained within `$mat-blue-grey`.
    Object.keys(mapping).sort(sortLengthDescending).forEach(key => {
      const pattern = getKeyPattern(namespace, key);

      // Sanity check since non-global regexes will only replace the first match.
      if (pattern.flags.indexOf('g') === -1) {
        throw Error('Replacement pattern must be global.');
      }

      content = content.replace(pattern, formatValue(mapping[key]));
    });
  });

  return content;
}

/** Inserts an `@use` statement in a string. */
function insertUseStatement(content: string, importPath: string, importsToIgnore: string[],
                            namespace: string): string {
  // We want to find the first import that isn't in the list of ignored imports or find nothing,
  // because the imports being replaced might be the only ones in the file and they can be further
  // down. An easy way to do this is to replace the imports with a random character and run
  // `indexOf` on the result. This isn't the most efficient way of doing it, but it's more compact
  // and it allows us to easily deal with things like comment nodes.
  const contentToSearch = importsToIgnore.reduce((accumulator, current) =>
    accumulator.replace(current, '◬'.repeat(current.length)), content);

  // Sass has a limitation that all `@use` declarations have to come before `@import` so we have
  // to find the first import and insert before it. Technically we can get away with always
  // inserting at 0, but the file may start with something like a license header.
  const newImportIndex = Math.max(0, contentToSearch.indexOf('@import '));

  return content.slice(0, newImportIndex) + `@use '${importPath}' as ${namespace};\n` +
         content.slice(newImportIndex);
}

/** Formats a migration key as a Sass mixin invocation. */
function mixinKeyFormatter(namespace: string|null, name: string): RegExp {
  // Note that adding a `(` at the end of the pattern would be more accurate, but mixin
  // invocations don't necessarily have to include the parentheses. We could add `[(;]`,
  // but then we won't know which character to include in the replacement string.
  return new RegExp(`@include +${escapeRegExp((namespace ? namespace + '.' : '') + name)}`, 'g');
}

/** Returns a function that can be used to format a Sass mixin replacement. */
function getMixinValueFormatter(namespace: string): (name: string) => string {
  // Note that adding a `(` at the end of the pattern would be more accurate,
  // but mixin invocations don't necessarily have to include the parentheses.
  return name => `@include ${namespace}.${name}`;
}

/** Formats a migration key as a Sass function invocation. */
function functionKeyFormatter(namespace: string|null, name: string): RegExp {
  return new RegExp(escapeRegExp(`${namespace ? namespace + '.' : ''}${name}(`), 'g');
}

/** Returns a function that can be used to format a Sass function replacement. */
function getFunctionValueFormatter(namespace: string): (name: string) => string {
  return name => `${namespace}.${name}(`;
}

/** Formats a migration key as a Sass variable. */
function variableKeyFormatter(namespace: string|null, name: string): RegExp {
  return new RegExp(escapeRegExp(`${namespace ? namespace + '.' : ''}$${name}`), 'g');
}

/** Returns a function that can be used to format a Sass variable replacement. */
function getVariableValueFormatter(namespace: string): (name: string) => string {
  return name => `${namespace}.$${name}`;
}

/** Escapes special regex characters in a string. */
function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

/** Used with `Array.prototype.sort` to order strings in descending length. */
function sortLengthDescending(a: string, b: string) {
  return b.length - a.length;
}

/** Removes all strings from another string. */
function removeStrings(content: string, toRemove: string[]): string {
  return toRemove
    .reduce((accumulator, current) => accumulator.replace(current, ''), content)
    .replace(/^\s+/, '');
}

/** Parses out the namespace from a Sass `@use` statement. */
function extractNamespaceFromUseStatement(fullImport: string): string {
  const closeQuoteIndex = Math.max(fullImport.lastIndexOf(`"`), fullImport.lastIndexOf(`'`));

  if (closeQuoteIndex > -1) {
    const asExpression = 'as ';
    const asIndex = fullImport.indexOf(asExpression, closeQuoteIndex);

    // If we found an ` as ` expression, we consider the rest of the text as the namespace.
    if (asIndex > -1) {
      return fullImport.slice(asIndex + asExpression.length).split(';')[0].trim();
    }

    // Otherwise the namespace is the name of the file that is being imported.
    const lastSlashIndex = fullImport.lastIndexOf('/', closeQuoteIndex);

    if (lastSlashIndex > -1) {
      const fileName = fullImport.slice(lastSlashIndex + 1, closeQuoteIndex)
        // Sass allows for leading underscores to be omitted and it technically supports .scss.
        .replace(/^_|(\.import)?\.scss$|\.import$/g, '');

      // Sass ignores `/index` and infers the namespace as the next segment in the path.
      if (fileName === 'index') {
        const nextSlashIndex = fullImport.lastIndexOf('/', lastSlashIndex - 1);

        if (nextSlashIndex > -1) {
          return fullImport.slice(nextSlashIndex + 1, lastSlashIndex);
        }
      } else {
        return fileName;
      }
    }
  }

  throw Error(`Could not extract namespace from import "${fullImport}".`);
}

/**
 * Replaces variables that have been removed with their values.
 * @param content Content of the file to be migrated.
 * @param variables Mapping between variable names and their values.
 */
function replaceRemovedVariables(content: string, variables: Record<string, string>): string {
  Object.keys(variables).sort(sortLengthDescending).forEach(variableName => {
    // Note that the pattern uses a negative lookahead to exclude
    // variable assignments, because they can't be migrated.
    const regex = new RegExp(`\\$${escapeRegExp(variableName)}(?!\\s+:|:)`, 'g');
    content = content.replace(regex, variables[variableName]);
  });

  return content;
}
