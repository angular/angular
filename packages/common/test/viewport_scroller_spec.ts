/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */



/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
    let windowSpy: any;

    beforeEach(() => {
      windowSpy = jasmine.createSpyObj('window', ['history']);
      windowSpy.scrollTo = 1;
      windowSpy.history.scrollRestoration = 'auto';

      documentSpy = jasmine.createSpyObj('document', ['querySelector']);
      scroller = new BrowserViewportScroller(documentSpy, windowSpy, null!);
    });

    it('should not crash when scrollRestoration is not writable', () => {
      Object.defineProperty(windowSpy.history, 'scrollRestoration', {
        value: 'auto',
        configurable: true,
      });
      expect(() => scroller.setHistoryScrollRestoration('manual')).not.toThrow();
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
