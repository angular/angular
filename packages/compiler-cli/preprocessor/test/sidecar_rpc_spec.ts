/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SidecarAnalyzer} from '../src/analyzer_sidecar.js';
import {resolveSidecarBinary} from './utils.js';

describe('SidecarAnalyzer RPC', () => {
  it('round-trips file requests and responses through the Rust sidecar', async () => {
    const tsconfigPath = '/project/tsconfig.json';
    const filePath = '/project/app.ts';
    const content = 'export class AppComponent {}';
    const analyzer = new SidecarAnalyzer(resolveSidecarBinary());

    try {
      await analyzer.initialize(tsconfigPath, false, {
        [tsconfigPath]: JSON.stringify({files: ['app.ts']}),
        [filePath]: content,
      });

      expect(await analyzer.getFileContent(filePath)).toBe(content);

      const updatedContent = 'export class UpdatedComponent {}';
      const invalidatedFiles = await analyzer.updateFileContent([{filePath, content: updatedContent}]);

      expect(invalidatedFiles).toContain(filePath);
      expect(await analyzer.getFileContent(filePath)).toBe(updatedContent);
    } finally {
      analyzer.close();
      await analyzer.wait();
    }
  });
});
