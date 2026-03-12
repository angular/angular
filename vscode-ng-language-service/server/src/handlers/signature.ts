/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import * as ts from 'typescript/lib/tsserverlibrary';

import {Session} from '../session';
import {lspPositionToTsPosition, tsDisplayPartsToText} from '../utils';

export function onSignatureHelp(
  session: Session,
  params: lsp.SignatureHelpParams,
): lsp.SignatureHelp | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }

  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);

  const help = languageService.getSignatureHelpItems(scriptInfo.fileName, offset, undefined);
  if (help === undefined) {
    return null;
  }

  return {
    activeParameter: help.argumentCount > 0 ? help.argumentIndex : undefined,
    activeSignature: help.selectedItemIndex,
    signatures: help.items.map((item: ts.SignatureHelpItem): lsp.SignatureInformation => {
      // For each signature, build up a 'label' which represents the full signature text, as well
      // as a parameter list where each parameter label is a span within the signature label.
      let label = tsDisplayPartsToText(item.prefixDisplayParts);
      const parameters: lsp.ParameterInformation[] = [];
      let first = true;
      for (const param of item.parameters) {
        if (!first) {
          label += tsDisplayPartsToText(item.separatorDisplayParts);
        }
        first = false;

        // Add the parameter to the label, keeping track of its start and end positions.
        const start = label.length;
        label += tsDisplayPartsToText(param.displayParts);
        const end = label.length;

        // The parameter itself uses a range within the signature label as its own label.
        parameters.push({
          label: [start, end],
          documentation: tsDisplayPartsToText(param.documentation),
        });
      }

      label += tsDisplayPartsToText(item.suffixDisplayParts);
      return {
        label,
        documentation: tsDisplayPartsToText(item.documentation),
        parameters,
      };
    }),
  };
}
