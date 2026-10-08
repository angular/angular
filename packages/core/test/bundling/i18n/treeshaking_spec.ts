/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/compiler';

import * as fs from 'fs';
import * as path from 'path';

describe('i18n production bundle', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(path.resolve('./bundles/main.js'), {encoding: 'utf-8'});
  });

  it('should retain the i18n insertion path', () => {
    expect(content).toContain('setTNodeInsertBeforeIndex');
  });

  it('should not retain the development-only insertion assertion', () => {
    expect(content).not.toContain('Expecting array here');
  });
});
