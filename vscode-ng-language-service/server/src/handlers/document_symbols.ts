/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import * as ts from 'typescript/lib/tsserverlibrary';
import {isNgLanguageService, TemplateDocumentSymbol} from '@angular/language-service/api';

import {getWorkspaceConfiguration} from '../config';
import {Session} from '../session';
import {tsTextSpanToLspRange} from '../utils';

/**
 * Configuration for document symbols feature.
 * These settings control how document symbols are generated for Angular templates.
 */
interface DocumentSymbolsConfig {
  /**
   * Whether to enable document symbols for Angular templates.
   * When enabled (default), shows control flow blocks, elements, variables, etc.
   * When disabled, only TypeScript symbols are shown in the outline.
   */
  enabled: boolean;
  /**
   * Whether to show 'implicit' annotation for template variables
   * that are implicitly typed by Angular (e.g., `let item` in `@for`).
   */
  showImplicitForVariables: boolean;
}

/**
 * Handles textDocument/documentSymbol requests.
 *
 * Returns a hierarchical list of symbols in the document that appears in:
 * - The Outline view in VS Code
 * - The breadcrumbs navigation bar
 * - The "Go to Symbol" picker (Ctrl+Shift+O / Cmd+Shift+O)
 */
export async function onDocumentSymbol(
  session: Session,
  params: lsp.DocumentSymbolParams,
): Promise<lsp.DocumentSymbol[] | null> {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {scriptInfo, languageService} = lsInfo;
  const isHtmlFile = params.textDocument.uri.endsWith('.html');

  // Fetch document symbols configuration from the client using workspace/configuration.
  // This allows users to change settings without restarting the language server.
  const [config] = await getWorkspaceConfiguration<DocumentSymbolsConfig>(session.connection, [
    {scopeUri: params.textDocument.uri, section: 'angular.documentSymbols'},
  ]);

  // Check if document symbols are enabled (default: true)
  const isEnabled = config?.enabled !== false;

  // For HTML template files, we only need Angular template symbols (no TS symbols)
  if (isHtmlFile) {
    if (isEnabled && isNgLanguageService(languageService)) {
      const templateSymbols = languageService.getTemplateDocumentSymbols(scriptInfo.fileName, {
        showImplicitForVariables: config?.showImplicitForVariables ?? false,
      });
      if (templateSymbols.length > 0) {
        return convertTemplateSymbols(templateSymbols, scriptInfo);
      }
    }
    return null;
  }

  // Get template symbols for Angular files
  let templateSymbols: TemplateDocumentSymbol[] = [];
  if (isEnabled && isNgLanguageService(languageService)) {
    templateSymbols = languageService.getTemplateDocumentSymbols(scriptInfo.fileName, {
      showImplicitForVariables: config?.showImplicitForVariables ?? false,
    });
  }

  // For TypeScript files, get the navigation tree which includes
  // classes, functions, variables, imports, etc.
  const navigationTree = languageService.getNavigationTree(scriptInfo.fileName);
  if (!navigationTree) {
    return null;
  }

  // Get the set of class names that have templates
  const classNamesWithTemplates = new Set<string>();
  for (const symbol of templateSymbols) {
    if (symbol.className) {
      classNamesWithTemplates.add(symbol.className);
    }
  }

  // Filter TypeScript symbols to only show classes with templates (no methods/properties)
  // This implements the hybrid approach where component classes are shown as containers
  // with template symbols nested inside
  const tsSymbols = filterNavigationTreeToTemplateClasses(
    navigationTree,
    scriptInfo,
    classNamesWithTemplates,
  );

  // For Angular TypeScript files, merge template symbols into component classes
  if (templateSymbols.length > 0) {
    mergeTemplateSymbolsIntoClass(tsSymbols, templateSymbols, scriptInfo);
  }

  return tsSymbols;
}

/**
 * Merges Angular template symbols into the component class in the TypeScript symbol tree.
 * This places control flow blocks, elements, etc. under the component class they belong to.
 * Supports multiple components in the same file by matching on className.
 */
function mergeTemplateSymbolsIntoClass(
  tsSymbols: lsp.DocumentSymbol[],
  templateSymbols: TemplateDocumentSymbol[],
  scriptInfo: ts.server.ScriptInfo,
): void {
  if (templateSymbols.length === 0) {
    return;
  }

  // Group template symbols by their className
  const symbolsByClass = new Map<string, TemplateDocumentSymbol[]>();
  const symbolsWithoutClass: TemplateDocumentSymbol[] = [];

  for (const symbol of templateSymbols) {
    if (symbol.className) {
      const existing = symbolsByClass.get(symbol.className) ?? [];
      existing.push(symbol);
      symbolsByClass.set(symbol.className, existing);
    } else {
      symbolsWithoutClass.push(symbol);
    }
  }

  // For each class in the TypeScript symbols, try to find matching template symbols
  for (const tsSymbol of tsSymbols) {
    if (tsSymbol.kind === lsp.SymbolKind.Class) {
      const classTemplateSymbols = symbolsByClass.get(tsSymbol.name);
      if (classTemplateSymbols && classTemplateSymbols.length > 0) {
        const converted = convertTemplateSymbols(classTemplateSymbols, scriptInfo);
        addTemplateSymbolsToClass(tsSymbol, converted);
        symbolsByClass.delete(tsSymbol.name);
      }
    }
  }

  // Handle any remaining symbols without className (fallback for older API or edge cases)
  if (symbolsWithoutClass.length > 0) {
    const converted = convertTemplateSymbols(symbolsWithoutClass, scriptInfo);
    // Find first class to merge into
    for (const tsSymbol of tsSymbols) {
      if (tsSymbol.kind === lsp.SymbolKind.Class) {
        addTemplateSymbolsToClass(tsSymbol, converted);
        break;
      }
    }
  }
}

/**
 * Adds template symbols as children of a component class symbol.
 */
function addTemplateSymbolsToClass(
  classSymbol: lsp.DocumentSymbol,
  templateSymbols: lsp.DocumentSymbol[],
): void {
  if (!classSymbol.children) {
    classSymbol.children = [];
  }
  // Create a "(template)" container to group template symbols
  const templateContainer: lsp.DocumentSymbol = {
    name: '(template)',
    kind: lsp.SymbolKind.Namespace,
    range: templateSymbols[0].range,
    selectionRange: templateSymbols[0].selectionRange,
    children: templateSymbols,
  };
  classSymbol.children.push(templateContainer);
}

/**
 * Filters the TypeScript NavigationTree to only include classes that have Angular templates.
 * This implements the hybrid approach where:
 * - Classes with templates are shown (without their methods/properties)
 * - Classes without templates are filtered out
 * - Non-class symbols (functions, variables, etc.) are filtered out
 *
 * This provides a cleaner outline for Angular files, showing only the component
 * structure with template symbols nested inside.
 */
function filterNavigationTreeToTemplateClasses(
  tree: ts.NavigationTree,
  scriptInfo: ts.server.ScriptInfo,
  classNamesWithTemplates: Set<string>,
): lsp.DocumentSymbol[] {
  const result: lsp.DocumentSymbol[] = [];

  // If no classes have templates, return empty array
  // This means we show nothing for non-Angular files (TypeScript handles those)
  if (classNamesWithTemplates.size === 0) {
    return result;
  }

  // The root node is the file itself, process its children
  if (tree.kind === ts.ScriptElementKind.moduleElement && tree.childItems) {
    for (const child of tree.childItems) {
      const filtered = filterNavigationItem(child, scriptInfo, classNamesWithTemplates);
      if (filtered) {
        result.push(filtered);
      }
    }
  } else {
    // For non-module roots, filter the node itself
    const filtered = filterNavigationItem(tree, scriptInfo, classNamesWithTemplates);
    if (filtered) {
      result.push(filtered);
    }
  }

  return result;
}

/**
 * Filters a single NavigationTree item.
 * - If it's a class with a template, return the class node (without children - no methods/properties)
 * - If it's a container (module, namespace), recurse and keep if any children match
 * - Otherwise, return null (filter out)
 */
function filterNavigationItem(
  item: ts.NavigationTree,
  scriptInfo: ts.server.ScriptInfo,
  classNamesWithTemplates: Set<string>,
): lsp.DocumentSymbol | null {
  // Check if this is a class with a template
  if (
    (item.kind === ts.ScriptElementKind.classElement ||
      item.kind === ts.ScriptElementKind.localClassElement) &&
    item.text &&
    classNamesWithTemplates.has(item.text)
  ) {
    // Return the class node WITHOUT its children (methods, properties)
    // The template symbols will be added later by mergeTemplateSymbolsIntoClass
    const spans = item.spans;
    if (!spans || spans.length === 0) {
      return null;
    }

    const range = tsTextSpanToLspRange(scriptInfo, spans[0]);
    const selectionRange =
      item.nameSpan !== undefined ? tsTextSpanToLspRange(scriptInfo, item.nameSpan) : range;

    return {
      name: item.text,
      kind: lsp.SymbolKind.Class,
      range,
      selectionRange,
      // No children - template symbols will be added later
    };
  }

  // For container types (module, namespace), recurse into children
  // and keep the container if any children match
  if (
    item.kind === ts.ScriptElementKind.moduleElement ||
    item.kind === ts.ScriptElementKind.directory
  ) {
    if (item.childItems && item.childItems.length > 0) {
      const filteredChildren: lsp.DocumentSymbol[] = [];
      for (const child of item.childItems) {
        const filtered = filterNavigationItem(child, scriptInfo, classNamesWithTemplates);
        if (filtered) {
          filteredChildren.push(filtered);
        }
      }

      // If any children matched, return this container with filtered children
      if (filteredChildren.length > 0) {
        const spans = item.spans;
        if (!spans || spans.length === 0) {
          // If no span for container, just return children directly
          return null;
        }

        const range = tsTextSpanToLspRange(scriptInfo, spans[0]);
        const selectionRange =
          item.nameSpan !== undefined ? tsTextSpanToLspRange(scriptInfo, item.nameSpan) : range;

        return {
          name: item.text || '',
          kind: scriptElementKindToSymbolKind(item.kind),
          range,
          selectionRange,
          children: filteredChildren,
        };
      }
    }
  }

  // Filter out everything else (functions, variables, interfaces, etc.)
  return null;
}

/**
 * Maps TypeScript's ScriptElementKind to LSP SymbolKind.
 */
function scriptElementKindToSymbolKind(kind: ts.ScriptElementKind): lsp.SymbolKind {
  switch (kind) {
    case ts.ScriptElementKind.moduleElement:
      return lsp.SymbolKind.Module;
    case ts.ScriptElementKind.classElement:
      return lsp.SymbolKind.Class;
    case ts.ScriptElementKind.localClassElement:
      return lsp.SymbolKind.Class;
    case ts.ScriptElementKind.interfaceElement:
      return lsp.SymbolKind.Interface;
    case ts.ScriptElementKind.typeElement:
      return lsp.SymbolKind.TypeParameter;
    case ts.ScriptElementKind.enumElement:
      return lsp.SymbolKind.Enum;
    case ts.ScriptElementKind.enumMemberElement:
      return lsp.SymbolKind.EnumMember;
    case ts.ScriptElementKind.variableElement:
      return lsp.SymbolKind.Variable;
    case ts.ScriptElementKind.localVariableElement:
      return lsp.SymbolKind.Variable;
    case ts.ScriptElementKind.functionElement:
      return lsp.SymbolKind.Function;
    case ts.ScriptElementKind.localFunctionElement:
      return lsp.SymbolKind.Function;
    case ts.ScriptElementKind.memberFunctionElement:
      return lsp.SymbolKind.Method;
    case ts.ScriptElementKind.memberGetAccessorElement:
      return lsp.SymbolKind.Property;
    case ts.ScriptElementKind.memberSetAccessorElement:
      return lsp.SymbolKind.Property;
    case ts.ScriptElementKind.memberVariableElement:
      return lsp.SymbolKind.Field;
    case ts.ScriptElementKind.constructorImplementationElement:
      return lsp.SymbolKind.Constructor;
    case ts.ScriptElementKind.callSignatureElement:
      return lsp.SymbolKind.Function;
    case ts.ScriptElementKind.indexSignatureElement:
      return lsp.SymbolKind.Key;
    case ts.ScriptElementKind.constructSignatureElement:
      return lsp.SymbolKind.Constructor;
    case ts.ScriptElementKind.parameterElement:
      return lsp.SymbolKind.Variable;
    case ts.ScriptElementKind.typeParameterElement:
      return lsp.SymbolKind.TypeParameter;
    case ts.ScriptElementKind.constElement:
      return lsp.SymbolKind.Constant;
    case ts.ScriptElementKind.letElement:
      return lsp.SymbolKind.Variable;
    case ts.ScriptElementKind.alias:
      return lsp.SymbolKind.Variable;
    default:
      return lsp.SymbolKind.Variable;
  }
}

/**
 * Converts Angular template symbols to LSP DocumentSymbol[].
 */
function convertTemplateSymbols(
  symbols: TemplateDocumentSymbol[],
  scriptInfo: ts.server.ScriptInfo,
): lsp.DocumentSymbol[] {
  const result: lsp.DocumentSymbol[] = [];

  for (const symbol of symbols) {
    const converted = convertTemplateSymbol(symbol, scriptInfo);
    if (converted) {
      result.push(converted);
    }
  }

  return result;
}

/**
 * Converts a single Angular template symbol to an LSP DocumentSymbol.
 */
function convertTemplateSymbol(
  symbol: TemplateDocumentSymbol,
  scriptInfo: ts.server.ScriptInfo,
): lsp.DocumentSymbol | null {
  if (!symbol.spans || symbol.spans.length === 0) {
    return null;
  }

  const range = tsTextSpanToLspRange(scriptInfo, symbol.spans[0]);
  const selectionRange = symbol.nameSpan
    ? tsTextSpanToLspRange(scriptInfo, symbol.nameSpan)
    : range;

  const children: lsp.DocumentSymbol[] = [];
  if (symbol.childItems) {
    for (const child of symbol.childItems) {
      const childSymbol = convertTemplateSymbol(child, scriptInfo);
      if (childSymbol) {
        children.push(childSymbol);
      }
    }
  }

  // Use lspKind if available, otherwise fall back to ScriptElementKind mapping
  const kind =
    symbol.lspKind !== undefined
      ? (symbol.lspKind as lsp.SymbolKind)
      : scriptElementKindToSymbolKind(symbol.kind);

  return {
    name: symbol.text,
    kind,
    range,
    selectionRange,
    children: children.length > 0 ? children : undefined,
  };
}
