/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Title} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

export function main() {
  describe('title service', () => {
    var initialTitle = getDOM().getTitle();
    var titleService = new Title();

    afterEach(() => { getDOM().setTitle(initialTitle); });

    it('should allow reading initial title',
       () => { expect(titleService.getTitle()).toEqual(initialTitle); });

    it('should set a title on the injected document', () => {
      titleService.setTitle('test title');
      expect(getDOM().getTitle()).toEqual('test title');
      expect(titleService.getTitle()).toEqual('test title');
    });

    it('should reset title to empty string if title not provided', () => {
      titleService.setTitle(null);
      expect(getDOM().getTitle()).toEqual('');
    });

  });
}
