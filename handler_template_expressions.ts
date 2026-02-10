/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  GetTemplateExpressionsForDebugParams,
  GetTemplateExpressionsForDebugResponse,
} from '../../../common/requests';
import {Session} from '../session';
import {filePathToUri, uriToFilePath} from '../utils';

export function onGetTemplateExpressionsForDebug(
  session: Session,
  params: GetTemplateExpressionsForDebugParams,
): GetTemplateExpressionsForDebugResponse | null {
  const filePath = uriToFilePath(params.textDocument.uri);
  if (!filePath) {
    return null;
  }
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService} = lsInfo;
  const response = languageService.getTemplateExpressionsForDebug(filePath);
  if (!response) {
    return null;
  }
  return {
    expressions: response.expressions,
    isInline: response.isInline,
    componentName: response.componentName,
    templateUri: filePathToUri(response.templateFilePath),
  };
}
