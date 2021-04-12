/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Mapping of Material mixins that should be renamed. */
const materialMixins: Record<string, string> = {
  'mat-core': 'core',
  'mat-core-color': 'core-color',
  'mat-core-theme': 'core-theme',
  'angular-material-theme': 'all-component-themes',
  'angular-material-typography': 'all-component-typographies',
  'angular-material-color': 'all-component-colors',
  'mat-base-typography': 'typography-hierarchy',
  'mat-typography-level-to-styles': 'typography-level',
  'mat-elevation': 'elevation',
  'mat-overridable-elevation': 'overridable-elevation',
  'mat-ripple': 'ripple',
  'mat-ripple-color': 'ripple-color',
  'mat-ripple-theme': 'ripple-theme',
  'mat-strong-focus-indicators': 'strong-focus-indicators',
  'mat-strong-focus-indicators-color': 'strong-focus-indicators-color',
  'mat-strong-focus-indicators-theme': 'strong-focus-indicators-theme',
  'mat-font-shorthand': 'font-shorthand',
  // The expansion panel is a special case, because the package is called `expansion`, but the
  // mixins were prefixed with `expansion-panel`. This was corrected by the Sass module migration.
  'mat-expansion-panel-theme': 'expansion-theme',
  'mat-expansion-panel-color': 'expansion-color',
  'mat-expansion-panel-typography': 'expansion-typography',
};

// The component themes all follow the same pattern so we can spare ourselves some typing.
[
  'option', 'optgroup', 'pseudo-checkbox', 'autocomplete', 'badge', 'bottom-sheet', 'button',
  'button-toggle', 'card', 'checkbox', 'chips', 'divider', 'table', 'datepicker', 'dialog',
  'grid-list', 'icon', 'input', 'list', 'menu', 'paginator', 'progress-bar', 'progress-spinner',
  'radio', 'select', 'sidenav', 'slide-toggle', 'slider', 'stepper', 'sort', 'tabs', 'toolbar',
  'tooltip', 'snack-bar', 'form-field', 'tree'
].forEach(name => {
  materialMixins[`mat-${name}-theme`] = `${name}-theme`;
  materialMixins[`mat-${name}-color`] = `${name}-color`;
  materialMixins[`mat-${name}-typography`] = `${name}-typography`;
});

/** Mapping of Material functions that should be renamed. */
const materialFunctions: Record<string, string> = {
  'mat-color': 'get-color-from-palette',
  'mat-contrast': 'get-contrast-color-from-palette',
  'mat-palette': 'define-palette',
  'mat-dark-theme': 'define-dark-theme',
  'mat-light-theme': 'define-light-theme',
  'mat-typography-level': 'define-typography-level',
  'mat-typography-config': 'define-typography-config',
  'mat-font-size': 'font-size',
  'mat-line-height': 'line-height',
  'mat-font-weight': 'font-weight',
  'mat-letter-spacing': 'letter-spacing',
  'mat-font-family': 'font-family',
};

/** Mapping of Material variables that should be renamed. */
const materialVariables: Record<string, string> = {
  'mat-light-theme-background': 'light-theme-background-palette',
  'mat-dark-theme-background': 'dark-theme-background-palette',
  'mat-light-theme-foreground': 'light-theme-foreground-palette',
  'mat-dark-theme-foreground': 'dark-theme-foreground-palette',
};

// The palettes all follow the same pattern.
[
  'red', 'pink', 'indigo', 'purple', 'deep-purple', 'blue', 'light-blue', 'cyan', 'teal', 'green',
  'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'gray',
  'blue-grey', 'blue-gray'
].forEach(name => materialVariables[`mat-${name}`] = `${name}-palette`);

/** Mapping of CDK variables that should be renamed. */
const cdkVariables: Record<string, string> = {
  'cdk-z-index-overlay-container': 'overlay-container-z-index',
  'cdk-z-index-overlay': 'overlay-z-index',
  'cdk-z-index-overlay-backdrop': 'overlay-backdrop-z-index',
  'cdk-overlay-dark-backdrop-background': 'overlay-backdrop-color',
};

/** Mapping of CDK mixins that should be renamed. */
const cdkMixins: Record<string, string> = {
  'cdk-overlay': 'overlay',
  'cdk-a11y': 'a11y-visually-hidden',
  'cdk-high-contrast': 'high-contrast',
  'cdk-text-field-autofill-color': 'text-field-autofill-color',
  // This one was split up into two mixins which is trickier to
  // migrate so for now we forward to the deprecated variant.
  'cdk-text-field': 'text-field',
};

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
 */
export function migrateFileContent(content: string,
                                   oldMaterialPrefix: string,
                                   oldCdkPrefix: string,
                                   newMaterialImportPath: string,
                                   newCdkImportPath: string): string {
  const materialResults = detectImports(content, oldMaterialPrefix);
  const cdkResults = detectImports(content, oldCdkPrefix);

  // If there are no imports, we don't need to go further.
  if (materialResults.imports.length > 0 || cdkResults.imports.length > 0) {
    const initialContent = content;
    content = migrateMaterialSymbols(content, newMaterialImportPath, materialResults.namespaces);
    content = migrateCdkSymbols(content, newCdkImportPath, cdkResults.namespaces);

    // Only drop the imports if any of the symbols were used within the file.
    if (content !== initialContent) {
      content = removeStrings(content, materialResults.imports);
      content = removeStrings(content, cdkResults.imports);
      content = content.replace(/^\s+/, '');
    }
  }

  return content;
}

/**
 * Counts the number of imports with a specific prefix and extracts their namespaces.
 * @param content File content in which to look for imports.
 * @param prefix Prefix that the imports should start with.
 */
function detectImports(content: string, prefix: string): {imports: string[], namespaces: string[]} {
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

/** Migrates the Material symbls in a file. */
function migrateMaterialSymbols(content: string, importPath: string, namespaces: string[]): string {
  const initialContent = content;
  const namespace = 'mat';

  // Migrate the mixins.
  content = renameSymbols(content, materialMixins, namespaces, mixinKeyFormatter,
    getMixinValueFormatter(namespace));

  // Migrate the functions.
  content = renameSymbols(content, materialFunctions, namespaces, functionKeyFormatter,
    getFunctionValueFormatter(namespace));

  // Migrate the variables.
  content = renameSymbols(content, materialVariables, namespaces, variableKeyFormatter,
    getVariableValueFormatter(namespace));

  if (content !== initialContent) {
    // Add an import to the new API only if any of the APIs were being used.
    content = insertUseStatement(content, importPath, namespace);
  }

  return content;
}

/** Migrates the CDK symbols in a file. */
function migrateCdkSymbols(content: string, importPath: string, namespaces: string[]): string {
  const initialContent = content;
  const namespace = 'cdk';

  // Migrate the mixins.
  content = renameSymbols(content, cdkMixins, namespaces, mixinKeyFormatter,
    getMixinValueFormatter(namespace));

  // Migrate the variables.
  content = renameSymbols(content, cdkVariables, namespaces, variableKeyFormatter,
    getVariableValueFormatter(namespace));

  // Previously the CDK symbols were exposed through `material/theming`, but now we have a
  // dedicated entrypoint for the CDK. Only add an import for it if any of the symbols are used.
  if (content !== initialContent) {
    content = insertUseStatement(content, importPath, namespace);
  }

  return content;
}

/**
 * Renames all Sass symbols in a file based on a pre-defined mapping.
 * @param content Content of a file to be migrated.
 * @param mapping Mapping between symbol names and their replacements.
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
function insertUseStatement(content: string, importPath: string, namespace: string): string {
  // Sass has a limitation that all `@use` declarations have to come before `@import` so we have
  // to find the first import and insert before it. Technically we can get away with always
  // inserting at 0, but the file may start with something like a license header.
  const newImportIndex = Math.max(0, content.indexOf('@import '));
  return content.slice(0, newImportIndex) + `@use '${importPath}' as ${namespace};\n` +
         content.slice(newImportIndex);
}

/** Formats a migration key as a Sass mixin invocation. */
function mixinKeyFormatter(namespace: string|null, name: string): RegExp {
  // Note that adding a `(` at the end of the pattern would be more accurate, but mixin
  // invocations don't necessarily have to include the parantheses. We could add `[(;]`,
  // but then we won't know which character to include in the replacement string.
  return new RegExp(`@include +${escapeRegExp((namespace ? namespace + '.' : '') + name)}`, 'g');
}

/** Returns a function that can be used to format a Sass mixin replacement. */
function getMixinValueFormatter(namespace: string): (name: string) => string {
  // Note that adding a `(` at the end of the pattern would be more accurate,
  // but mixin invocations don't necessarily have to include the parantheses.
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
  return toRemove.reduce((accumulator, current) => accumulator.replace(current, ''), content);
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
