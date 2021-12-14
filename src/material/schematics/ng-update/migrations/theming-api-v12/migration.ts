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
  unprefixedRemovedVariables,
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
  variables?: Record<string, string>;
}

/** Possible pairs of comment characters in a Sass file. */
const commentPairs = new Map<string, string>([
  ['/*', '*/'],
  ['//', '\n'],
]);

/** Prefix for the placeholder that will be used to escape comments. */
const commentPlaceholderStart = '__<<ngThemingMigrationEscapedComment';

/** Suffix for the comment escape placeholder. */
const commentPlaceholderEnd = '>>__';

/**
 * Migrates the content of a file to the new theming API. Note that this migration is using plain
 * string manipulation, rather than the AST from PostCSS and the schematics string manipulation
 * APIs, because it allows us to run it inside g3 and to avoid introducing new dependencies.
 * @param fileContent Content of the file.
 * @param oldMaterialPrefix Prefix with which the old Material imports should start.
 *   Has to end with a slash. E.g. if `@import '@angular/material/theming'` should be
 *   matched, the prefix would be `@angular/material/`.
 * @param oldCdkPrefix Prefix with which the old CDK imports should start.
 *   Has to end with a slash. E.g. if `@import '@angular/cdk/overlay'` should be
 *   matched, the prefix would be `@angular/cdk/`.
 * @param newMaterialImportPath New import to the Material theming API (e.g. `@angular/material`).
 * @param newCdkImportPath New import to the CDK Sass APIs (e.g. `@angular/cdk`).
 * @param excludedImports Pattern that can be used to exclude imports from being processed.
 */
export function migrateFileContent(
  fileContent: string,
  oldMaterialPrefix: string,
  oldCdkPrefix: string,
  newMaterialImportPath: string,
  newCdkImportPath: string,
  extraMaterialSymbols: ExtraSymbols = {},
  excludedImports?: RegExp,
): string {
  let {content, placeholders} = escapeComments(fileContent);
  const materialResults = detectImports(content, oldMaterialPrefix, excludedImports);
  const cdkResults = detectImports(content, oldCdkPrefix, excludedImports);

  // Try to migrate the symbols even if there are no imports. This is used
  // to cover the case where the Components symbols were used transitively.
  content = migrateCdkSymbols(content, newCdkImportPath, placeholders, cdkResults);
  content = migrateMaterialSymbols(
    content,
    newMaterialImportPath,
    materialResults,
    placeholders,
    extraMaterialSymbols,
  );
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

  return restoreComments(content, placeholders);
}

/**
 * Counts the number of imports with a specific prefix and extracts their namespaces.
 * @param content File content in which to look for imports.
 * @param prefix Prefix that the imports should start with.
 * @param excludedImports Pattern that can be used to exclude imports from being processed.
 */
function detectImports(
  content: string,
  prefix: string,
  excludedImports?: RegExp,
): DetectImportResult {
  if (prefix[prefix.length - 1] !== '/') {
    // Some of the logic further down makes assumptions about the import depth.
    throw Error(`Prefix "${prefix}" has to end in a slash.`);
  }

  // List of `@use` namespaces from which Angular CDK/Material APIs may be referenced.
  // Since we know that the library doesn't have any name collisions, we can treat all of these
  // namespaces as equivalent.
  const namespaces: string[] = [];
  const imports: string[] = [];
  const pattern = new RegExp(`@(import|use) +['"]~?${escapeRegExp(prefix)}.*['"].*;?\n`, 'g');
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(content))) {
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
function migrateMaterialSymbols(
  content: string,
  importPath: string,
  detectedImports: DetectImportResult,
  commentPlaceholders: Record<string, string>,
  extraMaterialSymbols: ExtraSymbols = {},
): string {
  const initialContent = content;
  const namespace = 'mat';

  // Migrate the mixins.
  const mixinsToUpdate = {...materialMixins, ...extraMaterialSymbols.mixins};
  content = renameSymbols(
    content,
    mixinsToUpdate,
    detectedImports.namespaces,
    mixinKeyFormatter,
    getMixinValueFormatter(namespace),
  );

  // Migrate the functions.
  const functionsToUpdate = {...materialFunctions, ...extraMaterialSymbols.functions};
  content = renameSymbols(
    content,
    functionsToUpdate,
    detectedImports.namespaces,
    functionKeyFormatter,
    getFunctionValueFormatter(namespace),
  );

  // Migrate the variables.
  const variablesToUpdate = {...materialVariables, ...extraMaterialSymbols.variables};
  content = renameSymbols(
    content,
    variablesToUpdate,
    detectedImports.namespaces,
    variableKeyFormatter,
    getVariableValueFormatter(namespace),
  );

  if (content !== initialContent) {
    // Add an import to the new API only if any of the APIs were being used.
    content = insertUseStatement(content, importPath, namespace, commentPlaceholders);
  }

  return content;
}

/** Migrates the CDK symbols in a file. */
function migrateCdkSymbols(
  content: string,
  importPath: string,
  commentPlaceholders: Record<string, string>,
  detectedImports: DetectImportResult,
): string {
  const initialContent = content;
  const namespace = 'cdk';

  // Migrate the mixins.
  content = renameSymbols(
    content,
    cdkMixins,
    detectedImports.namespaces,
    mixinKeyFormatter,
    getMixinValueFormatter(namespace),
  );

  // Migrate the variables.
  content = renameSymbols(
    content,
    cdkVariables,
    detectedImports.namespaces,
    variableKeyFormatter,
    getVariableValueFormatter(namespace),
  );

  // Previously the CDK symbols were exposed through `material/theming`, but now we have a
  // dedicated entrypoint for the CDK. Only add an import for it if any of the symbols are used.
  if (content !== initialContent) {
    content = insertUseStatement(content, importPath, namespace, commentPlaceholders);
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
function renameSymbols(
  content: string,
  mapping: Record<string, string>,
  namespaces: string[],
  getKeyPattern: (namespace: string | null, key: string) => RegExp,
  formatValue: (key: string) => string,
): string {
  // The null at the end is so that we make one last pass to cover non-namespaced symbols.
  [...namespaces.slice(), null].forEach(namespace => {
    Object.keys(mapping).forEach(key => {
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
function insertUseStatement(
  content: string,
  importPath: string,
  namespace: string,
  commentPlaceholders: Record<string, string>,
): string {
  // If the content already has the `@use` import, we don't need to add anything.
  if (new RegExp(`@use +['"]${importPath}['"]`, 'g').test(content)) {
    return content;
  }

  // Sass will throw an error if an `@use` statement comes after another statement. The safest way
  // to ensure that we conform to that requirement is by always inserting our imports at the top
  // of the file. Detecting where the user's content starts is tricky, because there are many
  // different kinds of syntax we'd have to account for. One approach is to find the first `@import`
  // and insert before it, but the problem is that Sass allows `@import` to be placed anywhere.
  let newImportIndex = 0;

  // One special case is if the file starts with a license header which we want to preserve on top.
  if (content.trim().startsWith(commentPlaceholderStart)) {
    const commentStartIndex = content.indexOf(commentPlaceholderStart);
    newImportIndex =
      content.indexOf(commentPlaceholderEnd, commentStartIndex + 1) + commentPlaceholderEnd.length;
    // If the leading comment doesn't end with a newline,
    // we need to insert the import at the next line.
    if (!commentPlaceholders[content.slice(commentStartIndex, newImportIndex)].endsWith('\n')) {
      newImportIndex = Math.max(newImportIndex, content.indexOf('\n', newImportIndex) + 1);
    }
  }

  return (
    content.slice(0, newImportIndex) +
    `@use '${importPath}' as ${namespace};\n` +
    content.slice(newImportIndex)
  );
}

/** Formats a migration key as a Sass mixin invocation. */
function mixinKeyFormatter(namespace: string | null, name: string): RegExp {
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
function functionKeyFormatter(namespace: string | null, name: string): RegExp {
  const functionName = escapeRegExp(`${namespace ? namespace + '.' : ''}${name}(`);
  return new RegExp(`(?<![-_a-zA-Z0-9])${functionName}`, 'g');
}

/** Returns a function that can be used to format a Sass function replacement. */
function getFunctionValueFormatter(namespace: string): (name: string) => string {
  return name => `${namespace}.${name}(`;
}

/** Formats a migration key as a Sass variable. */
function variableKeyFormatter(namespace: string | null, name: string): RegExp {
  const variableName = escapeRegExp(`${namespace ? namespace + '.' : ''}$${name}`);
  return new RegExp(`${variableName}(?![-_a-zA-Z0-9])`, 'g');
}

/** Returns a function that can be used to format a Sass variable replacement. */
function getVariableValueFormatter(namespace: string): (name: string) => string {
  return name => `${namespace}.$${name}`;
}

/** Escapes special regex characters in a string. */
function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
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
      return fullImport
        .slice(asIndex + asExpression.length)
        .split(';')[0]
        .trim();
    }

    // Otherwise the namespace is the name of the file that is being imported.
    const lastSlashIndex = fullImport.lastIndexOf('/', closeQuoteIndex);

    if (lastSlashIndex > -1) {
      const fileName = fullImport
        .slice(lastSlashIndex + 1, closeQuoteIndex)
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
  Object.keys(variables).forEach(variableName => {
    // Note that the pattern uses a negative lookahead to exclude
    // variable assignments, because they can't be migrated.
    const regex = new RegExp(`\\$${escapeRegExp(variableName)}(?!\\s+:|[-_a-zA-Z0-9:])`, 'g');
    content = content.replace(regex, variables[variableName]);
  });

  return content;
}

/**
 * Replaces all of the comments in a Sass file with placeholders and
 * returns the list of placeholders so they can be restored later.
 */
function escapeComments(content: string): {content: string; placeholders: Record<string, string>} {
  const placeholders: Record<string, string> = {};
  let commentCounter = 0;
  let [openIndex, closeIndex] = findComment(content);

  while (openIndex > -1 && closeIndex > -1) {
    const placeholder = commentPlaceholderStart + commentCounter++ + commentPlaceholderEnd;
    placeholders[placeholder] = content.slice(openIndex, closeIndex);
    content = content.slice(0, openIndex) + placeholder + content.slice(closeIndex);
    [openIndex, closeIndex] = findComment(content);
  }

  return {content, placeholders};
}

/** Finds the start and end index of a comment in a file. */
function findComment(content: string): [openIndex: number, closeIndex: number] {
  // Add an extra new line at the end so that we can correctly capture single-line comments
  // at the end of the file. It doesn't really matter that the end index will be out of bounds,
  // because `String.prototype.slice` will clamp it to the string length.
  content += '\n';

  for (const [open, close] of commentPairs.entries()) {
    const openIndex = content.indexOf(open);

    if (openIndex > -1) {
      const closeIndex = content.indexOf(close, openIndex + 1);
      return closeIndex > -1 ? [openIndex, closeIndex + close.length] : [-1, -1];
    }
  }

  return [-1, -1];
}

/** Restores the comments that have been escaped by `escapeComments`. */
function restoreComments(content: string, placeholders: Record<string, string>): string {
  Object.keys(placeholders).forEach(key => (content = content.replace(key, placeholders[key])));
  return content;
}
