/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Call, SafeCall} from '@angular/compiler';
import {getTargetAtPosition, TargetNodeKind} from '@angular/language-service/private';
import {
  SignatureHelp,
  SignatureHelpContext,
  SignatureInformation,
  MarkupContent,
} from 'vscode-languageserver';
import ts from 'typescript';

import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {TemplateTypeChecker} from './type_checker.js';
import {TsGoFacade} from './facade.js';
import {getSetup} from './type_checker_setup.js';
import {SymbolKind} from './symbols.js';
import {getTcbPath, offsetToPosition} from '../../src/tcb_ls_util.js';
import {findTightestNode} from './references_and_rename_utils.js';

/**
 * Queries the TypeScript Language Service (via TsGoFacade) to get signature help for a template position.
 */
export async function getSignatureHelp(
  filePath: string,
  offset: number,
  position: {line: number; character: number},
  _fileContent: string,
  hybridCompiler: HybridCompiler,
  templateTypeChecker: TemplateTypeChecker,
  facade: TsGoFacade,
  context?: SignatureHelpContext,
): Promise<SignatureHelp | null> {
  const setup = getSetup(hybridCompiler, filePath, position);
  if (!setup) {
    return null;
  }

  const {tsFilePath, meta, parsedTemplate, tcbSf, tcbCode, isHostBinding, hostElement} = setup;

  const target =
    isHostBinding && hostElement
      ? getTargetAtPosition([hostElement], offset)
      : getTargetAtPosition(parsedTemplate.nodes, offset);

  if (!target) {
    return null;
  }

  if (
    target.context.kind !== TargetNodeKind.RawExpression &&
    target.context.kind !== TargetNodeKind.CallExpressionInArgContext
  ) {
    // Signature completions are only available in expressions.
    return null;
  }

  const symbol = templateTypeChecker.getSymbolForNode(
    target.context.node,
    tsFilePath,
    meta.classKey,
    tcbSf,
  );
  if (symbol === null || symbol.kind !== SymbolKind.Expression || !symbol.tcbLocation) {
    return null;
  }

  let shimPosition: number;
  switch (target.context.kind) {
    case TargetNodeKind.RawExpression: {
      shimPosition = symbol.tcbLocation.positionInFile;

      let callExpr: Call | SafeCall | null = null;
      const parents = target.context.parents;
      for (let i = parents.length - 1; i >= 0; i--) {
        const parent = parents[i];
        if (parent instanceof Call || parent instanceof SafeCall) {
          callExpr = parent;
          break;
        }
      }

      if (callExpr === null) {
        return null;
      }
      break;
    }
    case TargetNodeKind.CallExpressionInArgContext: {
      let shimNode: ts.Node | null =
        findTightestNode(tcbSf, symbol.tcbLocation.positionInFile) ?? null;

      while (shimNode !== null) {
        if (ts.isCallExpression(shimNode)) {
          break;
        }
        shimNode = shimNode.parent ?? null;
      }

      if (shimNode === null || !ts.isCallExpression(shimNode)) {
        return null;
      }

      shimPosition = shimNode.arguments.pos;
      break;
    }
  }

  const tcbPath = getTcbPath(tsFilePath);
  await facade.ensureDocument(tcbPath, tcbCode);

  const tcbPos = offsetToPosition(tcbCode, shimPosition);
  const res = await facade.getSignatureHelpAtPosition(tcbPath, tcbPos, context);
  if (!res || !res.signatures || res.signatures.length === 0) {
    return null;
  }

  return cleanupSignatureHelp(res);
}

function cleanTcbText(text: string): string {
  let cleaned = text;
  // Remove TCB import prefixes like i0., i1., etc.
  cleaned = cleaned.replace(/\bi[0-9]+\./g, '');
  // Remove TCB temporary variable prefixes like _t1., _t2., etc.
  cleaned = cleaned.replace(/\b_t[0-9]+\./g, '');
  // Replace standalone _t1, _t2 if any
  cleaned = cleaned.replace(/\b_t[0-9]+\b/g, '');
  return cleaned;
}

function cleanDoc(doc?: string | MarkupContent): string | MarkupContent | undefined {
  if (!doc) return doc;
  if (typeof doc === 'string') {
    return cleanTcbText(doc);
  }
  return {
    ...doc,
    value: cleanTcbText(doc.value),
  };
}

function cleanupSignatureHelp(help: SignatureHelp): SignatureHelp {
  const signatures = help.signatures.map((sig) => {
    const oldLabel = sig.label;
    const newLabel = cleanTcbText(oldLabel);

    let parameters = sig.parameters;
    if (sig.parameters) {
      let searchIndex = 0;
      parameters = sig.parameters.map((param) => {
        let label: string | [number, number];
        if (typeof param.label === 'string') {
          label = cleanTcbText(param.label);
        } else if (Array.isArray(param.label)) {
          const paramText = oldLabel.substring(param.label[0], param.label[1]);
          const cleanedParamText = cleanTcbText(paramText);
          const newStart = newLabel.indexOf(cleanedParamText, searchIndex);
          if (newStart !== -1) {
            label = [newStart, newStart + cleanedParamText.length];
            searchIndex = newStart + cleanedParamText.length;
          } else {
            label = cleanedParamText;
          }
        } else {
          label = param.label;
        }

        return {
          ...param,
          label,
          documentation: cleanDoc(param.documentation),
        };
      });
    }

    return {
      ...sig,
      label: newLabel,
      documentation: cleanDoc(sig.documentation),
      parameters,
    };
  });

  const activeSignature = help.activeSignature ?? 0;
  const sig = signatures[activeSignature];
  const activeParameter = help.activeParameter ?? sig?.activeParameter;

  return {
    ...help,
    signatures,
    activeSignature,
    activeParameter,
  };
}
