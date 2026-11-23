/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WebContainer} from '@webcontainer/api';

function errorFilenameHandler(parentOrigin: string) {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const url = input.toString();
    if (url.includes('__open-in-editor')) {
      const params = new URLSearchParams(url.split('?')[1]);
      const file = params.get('file');
      if (file) {
        const [filepath, line, column] = file.split(':');
        window.parent.postMessage(
          {
            type: 'openFileAtLocation',
            file: filepath,
            line: parseInt(line, 10),
            character: parseInt(column, 10),
          },
          // Only expose the message to the parent origin that embedded the
          // preview, instead of broadcasting it to any origin via `'*'`.
          parentOrigin,
        );
      }
      return new Response(null, {status: 200});
    }
    return originalFetch(input, init);
  };
}

export async function setupErrorFilenameHandler(webContainer: WebContainer): Promise<void> {
  // The handler below is serialized and executed inside the preview iframe,
  // so it cannot reference this scope. The parent origin is therefore
  // captured here, at setup time, and passed into the serialized handler.
  await webContainer.setPreviewScript(
    `(${errorFilenameHandler.toString()})(${JSON.stringify(window.location.origin)})`,
  );
}
