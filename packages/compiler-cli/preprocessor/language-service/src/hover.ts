/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TemplateTypeChecker} from './type_checker.js';
import {getSetup} from './type_checker_setup.js';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {TsGoFacade, StructuralQuickInfo} from './facade.js';
import {SymbolKind} from './symbols.js';
import {getTargetAtPosition, SingleNodeTarget} from '@angular/language-service/private';
import {
  getQuickInfoForBuiltIn,
  isDollarAny,
  createDollarAnyQuickInfo,
  createNgTemplateQuickInfo,
} from './quick_info_built_ins.js';
import {getTextSpanOfNode, getDirectiveMatchesForAttribute} from './utils.js';
import {offsetToPosition} from '../../src/tcb_ls_util.js';
import {
  PropertyRead,
  TmplAstVariable,
  TmplAstReference,
  TmplAstTextAttribute,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockError,
  TmplAstForLoopBlockEmpty,
  TmplAstDeferredTrigger,
  TmplAstForLoopBlock,
  ParseSourceSpan,
  AST,
  TmplAstNode,
} from '@angular/compiler';

export async function getHover(
  filePath: string,
  offset: number,
  position: {line: number; character: number},
  fileContent: string,
  hybridCompiler: HybridCompiler,
  templateTypeChecker: TemplateTypeChecker,
  facade: TsGoFacade,
): Promise<{text: string; span?: {start: number; length: number}} | null> {
  const setup = getSetup(hybridCompiler, filePath, position);
  if (!setup) {
    return null;
  }
  const {tsFilePath, parsedTemplate, isHostBinding, hostElement} = setup;

  // 3. Get Target at position in template
  let target;
  if (isHostBinding && hostElement) {
    target = getTargetAtPosition([hostElement], offset);
  } else {
    target = getTargetAtPosition(parsedTemplate.nodes, offset);
  }

  if (!target) {
    return null;
  }

  const node = 'node' in target.context ? (target.context as SingleNodeTarget).node : null;
  const parent = target.parent;
  const textSpan = node ? getTextSpanOfNode(node) : undefined;

  if (node && isDollarAny(node)) {
    const quickInfo = createDollarAnyQuickInfo();
    return {
      text: quickInfo.text,
      span: textSpan,
    };
  }

  if (parent && isDollarAny(parent) && parent.receiver === node) {
    const quickInfo = createDollarAnyQuickInfo();
    return {
      text: quickInfo.text,
      span: textSpan,
    };
  }

  const builtinQuickInfo = createQuickInfoForBuiltIn(node, offset, fileContent);
  if (builtinQuickInfo) {
    return {
      text: builtinQuickInfo.text,
      span: textSpan,
    };
  }

  let templateName = '';

  if (node instanceof PropertyRead) {
    templateName = node.name;
  } else if (
    node instanceof TmplAstVariable ||
    node instanceof TmplAstReference ||
    node instanceof TmplAstTextAttribute ||
    node instanceof TmplAstBoundAttribute ||
    node instanceof TmplAstBoundEvent
  ) {
    templateName = node.name;
  }

  // 4. Get TCB using TemplateTypeChecker
  const tcbResult = templateTypeChecker.getTcb(filePath, position);

  if (!tcbResult) {
    return null;
  }

  let ngSymbol = templateTypeChecker.getSymbolOfNode(filePath, position);

  const tcbUri = tcbResult.filePath;
  const selection = tcbResult.selections[0];
  await facade.ensureDocument(tcbUri, tcbResult.code);

  let quickInfo: {text: string; span?: {start: number; length: number}} | null = null;

  if (ngSymbol) {
    const location = getSymbolLocation(ngSymbol, templateName, selection?.isDirective);
    if (location) {
      if ('text' in location) {
        quickInfo = location;
      } else {
        const pos = offsetToPosition(tcbResult.code, location.offset);
        let info = await facade.getQuickInfoAtPosition(tcbUri, pos);

        if (location.overrideKind === 'component' || location.overrideKind === 'directive') {
          const defs = await facade.getTypeDefinitionAtPosition(tcbUri, pos);
          if (defs && defs.length > 0) {
            const def = defs[0];
            const defInfo = await facade.getQuickInfoAtPosition(def.uri, def.range.start);
            if (defInfo) {
              info = defInfo;
            }
          }
        }

        if (info) {
          const cleanedText = cleanupTcbText(
            info.text,
            location.templateName,
            location.isDirective,
            location.overrideKind,
          );

          quickInfo = {...info, text: cleanedText};
        }
      }
    }
  }

  if (quickInfo) {
    const res = {
      text: quickInfo.text,
      span: textSpan,
    };
    return res;
  }

  return null;
}

function getSymbolLocation(
  symbol: any,
  templateName: string,
  isDirectiveFallback?: boolean,
):
  | {offset: number; templateName: string; isDirective: boolean; overrideKind?: string}
  | StructuralQuickInfo
  | null {
  const kind = symbol.kind;
  switch (kind) {
    case SymbolKind.Variable:
    case SymbolKind.LetDeclaration:
      return getSymbolLocationForVariable(symbol, templateName);
    case SymbolKind.Reference:
      return getSymbolLocationForReference(symbol, templateName);
    case SymbolKind.Input:
    case SymbolKind.Output:
      return getSymbolLocationForBinding(symbol, templateName, isDirectiveFallback);
    case SymbolKind.Directive:
    case SymbolKind.SelectorlessComponent:
    case SymbolKind.SelectorlessDirective:
      if (symbol.tcbLocation) {
        return {
          offset: symbol.tcbLocation.positionInFile,
          templateName,
          isDirective: true,
          overrideKind:
            symbol.isComponent || symbol.kind === SymbolKind.SelectorlessComponent
              ? 'component'
              : 'directive',
        };
      }
      return null;
    case SymbolKind.Expression:
      return {
        offset: symbol.tcbLocation.positionInFile,
        templateName,
        isDirective: false,
      };
    case SymbolKind.Template:
      const templateDirective = symbol.directives?.[0];
      if (templateDirective) {
        return {
          offset: templateDirective.tcbLocation.positionInFile,
          templateName,
          isDirective: true,
          overrideKind: 'directive',
        };
      }
      return createNgTemplateQuickInfo();
    case SymbolKind.Pipe:
      return {
        offset: symbol.tcbLocation.positionInFile,
        templateName,
        isDirective: false,
        overrideKind: 'pipe',
      };
    case SymbolKind.Element:
      const directive = symbol.directives?.[0];
      if (directive) {
        return {
          offset: directive.tcbLocation.positionInFile,
          templateName,
          isDirective: true,
          overrideKind: 'directive',
        };
      }
      return {
        offset: symbol.tcbLocation.positionInFile,
        templateName,
        isDirective: false,
        overrideKind: 'element',
      };
    case SymbolKind.DomBinding:
      if (!symbol.host || !symbol.host.directives) {
        return null;
      }
      const directives = getDirectiveMatchesForAttribute(
        templateName,
        symbol.host.templateNode,
        symbol.host.directives,
      );
      const dirSymbol = directives.size > 0 ? directives.values().next().value : null;
      if (!dirSymbol || !dirSymbol.tcbLocation) {
        return null;
      }
      return {
        offset: dirSymbol.tcbLocation.positionInFile,
        templateName,
        isDirective: true,
        overrideKind: 'directive',
      };
    default:
      const loc =
        symbol.tcbLocation ||
        symbol.localVarLocation ||
        symbol.targetLocation ||
        symbol.referenceVarLocation;
      if (!loc) {
        return null;
      }
      return {
        offset: loc.positionInFile,
        templateName,
        isDirective: isDirectiveFallback || false,
      };
  }
}

function getSymbolLocationForVariable(
  symbol: any,
  templateName: string,
): {offset: number; templateName: string; isDirective: boolean; overrideKind?: string} | null {
  const loc = symbol.localVarLocation;
  if (!loc) return null;
  return {
    offset: loc.positionInFile,
    templateName,
    isDirective: false,
    overrideKind: 'variable',
  };
}

function getSymbolLocationForReference(
  symbol: any,
  templateName: string,
): {offset: number; templateName: string; isDirective: boolean; overrideKind?: string} | null {
  const loc = symbol.referenceVarLocation || symbol.targetLocation;
  if (!loc) return null;
  return {
    offset: loc.positionInFile,
    templateName,
    isDirective: true,
    overrideKind: 'reference',
  };
}

function getSymbolLocationForBinding(
  symbol: any,
  templateName: string,
  isDirectiveFallback?: boolean,
): {offset: number; templateName: string; isDirective: boolean; overrideKind?: string} | null {
  if (!symbol.bindings || symbol.bindings.length === 0) return null;
  const binding = symbol.bindings[0];
  const loc = binding.tcbLocation || binding.target?.tcbLocation;
  if (!loc) return null;
  return {
    offset: loc.positionInFile,
    templateName,
    isDirective: isDirectiveFallback || !!binding.target,
    overrideKind:
      symbol.kind === SymbolKind.Input
        ? 'property'
        : symbol.kind === SymbolKind.Output
          ? 'event'
          : binding.target
            ? 'directive'
            : 'property',
  };
}

function cleanupTcbText(
  text: string,
  name: string,
  isDirective: boolean,
  overrideKind?: string,
): string {
  let doc = '';
  const codeBlockMatch = text.match(/^```[a-z]*\r?\n([\s\S]*?)\r?\n```([\s\S]*)$/);
  let code = text;
  const hasBackticks = text.startsWith('```');

  if (codeBlockMatch) {
    code = codeBlockMatch[1];
    doc = codeBlockMatch[2] ?? '';
  } else if (hasBackticks) {
    code = text.replace(/^```[a-z]*\s*/, '').replace(/\s*```$/, '');
  }

  code = code.replace(/\bi[0-9]+\./g, '');
  code = code.replace(/_t[0-9]+\./g, '');

  const internalVarMatch = code.match(/(?:var|let|const)\s+(_t[0-9]+)\s*:\s*([^\n]+)/);

  if (internalVarMatch) {
    const matchFull = internalVarMatch[0];
    const matchType = internalVarMatch[2];

    let searchName = name;
    const propMatch = name.match(/\.([a-zA-Z0-9_]+)/);
    if (propMatch) {
      searchName = propMatch[1];
    }

    if (
      isDirective &&
      overrideKind !== 'property' &&
      overrideKind !== 'event' &&
      matchType.toLowerCase().includes(searchName.toLowerCase())
    ) {
      code = code.replace(matchFull, `(directive) ${matchType}`);
    } else {
      const displayKind = overrideKind || (isDirective ? 'directive' : 'variable');
      const formattedName =
        displayKind === 'property'
          ? `${matchType}.${name}`
          : displayKind === 'event'
            ? `${matchType}.${name}: EventEmitter`
            : `${name}: ${matchType}`;
      code = code.replace(matchFull, `(${displayKind}) ${formattedName}`);
    }
  } else {
    code = code.replace(/_t[0-9]+/g, () => name);
  }

  if (code.startsWith('class ')) {
    const displayKind = overrideKind || (isDirective ? 'directive' : 'variable');
    if (displayKind === 'event') {
      code = `(${displayKind}) ${code.substring(6)}.${name}: EventEmitter`;
    } else {
      code = code.replace(/^class /, `(${displayKind}) `);
    }
  }

  if (hasBackticks) {
    return `\`\`\`tsx\n${code}\n\`\`\`${doc}`;
  }
  return `${code}${doc}`;
}

function isWithin(
  position: number,
  span: {start: {offset: number}; end: {offset: number}},
): boolean {
  return span.start.offset <= position && position < span.end.offset;
}

function createQuickInfoForBuiltIn(
  node: AST | TmplAstNode | null,
  offset: number,
  fileContent: string,
): StructuralQuickInfo | null {
  let partSpan: ParseSourceSpan | null = null;
  if (node instanceof TmplAstDeferredTrigger) {
    if (node.prefetchSpan !== null && isWithin(offset, node.prefetchSpan)) {
      partSpan = node.prefetchSpan;
    } else if (node.hydrateSpan && isWithin(offset, node.hydrateSpan)) {
      partSpan = node.hydrateSpan;
    } else if (node.whenOrOnSourceSpan !== null && isWithin(offset, node.whenOrOnSourceSpan)) {
      partSpan = node.whenOrOnSourceSpan;
    } else if (node.nameSpan !== null && isWithin(offset, node.nameSpan)) {
      partSpan = node.nameSpan;
    }
  } else if (
    node instanceof TmplAstDeferredBlock ||
    node instanceof TmplAstDeferredBlockError ||
    node instanceof TmplAstDeferredBlockLoading ||
    node instanceof TmplAstDeferredBlockPlaceholder ||
    (node instanceof TmplAstForLoopBlockEmpty && isWithin(offset, node.nameSpan))
  ) {
    partSpan = node.nameSpan;
  } else if (
    node instanceof TmplAstForLoopBlock &&
    node.trackKeywordSpan &&
    isWithin(offset, node.trackKeywordSpan)
  ) {
    partSpan = node.trackKeywordSpan;
  }

  if (partSpan === null) {
    return null;
  }

  const builtinName = fileContent.substring(partSpan.start.offset, partSpan.end.offset).trim();
  return getQuickInfoForBuiltIn(builtinName);
}
