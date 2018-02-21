/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {HammerGestureConfig, HammerGesturesPlugin} from '@angular/platform-browser/src/dom/events/hammer_gestures';

{
  describe('HammerGesturesPlugin', () => {
    let plugin: HammerGesturesPlugin;
    let mockConsole: any;
    if (isNode) return;

    beforeEach(() => {
      mockConsole = {warn: () => {}};
      plugin = new HammerGesturesPlugin(document, new HammerGestureConfig(), mockConsole);
    });

    it('should implement addGlobalEventListener', () => {
      spyOn(plugin, 'addEventListener').and.callFake(() => {});

      expect(() => plugin.addGlobalEventListener('document', 'swipe', () => {})).not.toThrowError();
    });

    it('shoud warn user and do nothing when Hammer.js not loaeded', () => {
      spyOn(mockConsole, 'warn');

      expect(plugin.supports('swipe')).toBe(false);
      expect(mockConsole.warn)
          .toHaveBeenCalledWith(`Hammer.js is not loaded, can not bind 'swipe' event.`);
    });
  });
}
