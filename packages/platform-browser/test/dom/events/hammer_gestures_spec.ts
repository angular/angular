/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {HammerGestureConfig, HammerGesturesPlugin} from '@angular/platform-browser/src/dom/events/hammer_gestures';

export function main() {
  describe('HammerGesturesPlugin', () => {

    it('should implement addGlobalEventListener', () => {
      const plugin = new HammerGesturesPlugin(document, new HammerGestureConfig());

      spyOn(plugin, 'addEventListener').and.callFake(() => {});

      expect(() => plugin.addGlobalEventListener('document', 'swipe', () => {})).not.toThrowError();
    });
  });
}
