/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WebContainer} from '@webcontainer/api';

function errorFilenameHandler() {
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
          '*',
        );
      }
      return new Response(null, {status: 200});
    }
    return originalFetch(input, init);
  };
}

export async function setupErrorFilenameHandler(webContainer: WebContainer): Promise<void> {
  await webContainer.setPreviewScript(`(${errorFilenameHandler.toString()})()`);
}
