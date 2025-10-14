/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {linter} from '@codemirror/lint';
import {filter, take} from 'rxjs';
// Factory method for diagnostics extension.
export const getDiagnosticsExtension = (
  eventManager,
  currentFile,
  sendRequestToTsVfs,
  diagnosticsState,
) => {
  return linter(
    async (view) => {
      sendRequestToTsVfs({
        action: 'diagnostics-request' /* TsVfsWorkerActions.DIAGNOSTICS_REQUEST */,
        data: {
          file: currentFile().filename,
        },
      });
      const diagnostics = await new Promise((resolve) => {
        eventManager
          .pipe(
            filter(
              (event) =>
                event.action ===
                'diagnostics-response' /* TsVfsWorkerActions.DIAGNOSTICS_RESPONSE */,
            ),
            take(1),
          )
          .subscribe((response) => {
            resolve(response.data);
          });
      });
      const result = !!diagnostics ? diagnostics : [];
      diagnosticsState.setDiagnostics(result);
      return result;
    },
    {
      delay: 400,
    },
  );
};
//# sourceMappingURL=diagnostics.js.map
