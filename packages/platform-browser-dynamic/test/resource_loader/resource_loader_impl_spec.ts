/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isBrowser} from '@angular/private/testing';
import {ResourceLoaderImpl} from '../../src/resource_loader/resource_loader_impl';

if (isBrowser) {
  describe('ResourceLoaderImpl', () => {
    let resourceLoader: ResourceLoaderImpl;

    const url200 = '/base/angular/packages/platform-browser/test/browser/static_assets/200.html';
    const url404 = '/bad/path/404.html';

    beforeEach(() => {
      resourceLoader = new ResourceLoaderImpl();
    });

    it('should resolve the Promise with the file content on success', (done) => {
      resourceLoader.get(url200).then((text) => {
        expect(text.trim()).toEqual('<p>hey</p>');
        done();
      });
    }, 10000);

    it('should reject the Promise on failure', (done) => {
      resourceLoader.get(url404).catch((e) => {
        expect(e).toEqual(`Failed to load ${url404}`);
        done();
        return null;
      });
    }, 10000);
  });
}
