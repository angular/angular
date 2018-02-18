/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {CompositionEventsPlugin} from '@angular/platform-browser/src/dom/events/composition_events';
import {EventManager} from '@angular/platform-browser/src/dom/events/event_manager';

{
  describe('CompositionEventsPlugin', () => {
    if (isNode) return;
    let plugin: CompositionEventsPlugin;
    let manager: EventManager;

    beforeEach(() => {
      plugin = new CompositionEventsPlugin(document);
      manager = { addEventListener: () => {}, addGlobalEventListener: () => {} } as any;
      plugin.manager = manager;
    });

    it('should only process composition events', () => {
      expect(plugin.supports('click')).toBe(false);
      expect(plugin.supports('click,keydown')).toBe(true);
    });

    it('should dispatch element event listener', () => {
      let unlistenCount = 0;
      spyOn(manager, 'addEventListener').and.returnValue(() => unlistenCount++);
      const element = document.createElement('div');
      const handler = () => {};

      const disposer = plugin.addEventListener(element, 'click,keydown', handler);
      expect(manager.addEventListener).toHaveBeenCalledWith(element, 'click', handler);
      expect(manager.addEventListener).toHaveBeenCalledWith(element, 'keydown', handler);

      disposer();
      expect(unlistenCount).toBe(2);
    });

    it('should dispatch global event listener', () => {
      let unlistenCount = 0;
      spyOn(manager, 'addGlobalEventListener').and.returnValue(() => unlistenCount++);
      const handler = () => {};

      const disposer = plugin.addGlobalEventListener('window', 'scroll,resize', handler);
      expect(manager.addGlobalEventListener).toHaveBeenCalledWith('window', 'scroll', handler);
      expect(manager.addGlobalEventListener).toHaveBeenCalledWith('window', 'resize', handler);

      disposer();
      expect(unlistenCount).toBe(2);
    });
  });
}
