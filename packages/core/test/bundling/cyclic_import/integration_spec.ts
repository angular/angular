/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '@angular/compiler';

import {withBody} from '@angular/private/testing';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

describe('treeshaking with uglify', () => {
  let content: string;
  const contentPath = path.resolve('packages/core/test/bundling/cyclic_import/bundles/main.js');
  const bundleUrl = url.pathToFileURL(contentPath).toString();

  beforeAll(() => {
    content = fs.readFileSync(contentPath, {encoding: 'utf-8'});
  });

  describe('functional test in domino', () => {
    it(
      'should render hello world when not minified',
      withBody('<trigger></trigger>', async () => {
        await import(bundleUrl);
        await (window as any).appReady;
        expect(document.body.textContent).toEqual('dep');
      }),
    );
  });
});
