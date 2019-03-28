/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */



/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {BrowserViewportScroller, ViewportScroller} from '../src/viewport_scroller';

{
  describe('BrowserViewportScroller', () => {
    let scroller: ViewportScroller;
    let documentSpy: any;
    beforeEach(() => {
      documentSpy = jasmine.createSpyObj('document', ['querySelector']);
      scroller = new BrowserViewportScroller(documentSpy, {scrollTo: 1}, null !);
    });
    it('escapes invalid characters selectors', () => {
      const invalidSelectorChars = `"' :.[],=`;
      // Double escaped to make sure we match the actual value passed to `querySelector`
      const escapedInvalids = `\\"\\' \\:\\.\\[\\]\\,\\=`;
      scroller.scrollToAnchor(`specials=${invalidSelectorChars}`);
      expect(documentSpy.querySelector).toHaveBeenCalledWith(`#specials\\=${escapedInvalids}`);
      expect(documentSpy.querySelector)
          .toHaveBeenCalledWith(`[name='specials\\=${escapedInvalids}']`);
    });
  });
}
