/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signalGraphTool} from '../../../src/debug/ai/signal_graph';
import {registerAiTools} from '../../../src/debug/ai';
import {DevtoolsToolDiscoveryEvent} from '../../../src/debug/ai/tool_definitions';

describe('registration', () => {
  describe('registerAiTools', () => {
    it('should register the tools', () => {
      const unregister = registerAiTools();
      try {
        // Verify Angular responds to the event.
        const event = new CustomEvent('devtoolstooldiscovery') as DevtoolsToolDiscoveryEvent;
        event.respondWith = jasmine.createSpy('respondWith');
        window.dispatchEvent(event);
        expect(event.respondWith).toHaveBeenCalledOnceWith({
          name: 'Angular',

          // Just check one tool.
          tools: jasmine.arrayContaining([signalGraphTool]),
        });
      } finally {
        unregister();
      }

      // After unregistering, Angular should not react to the event.
      const event = new CustomEvent('devtoolstooldiscovery') as DevtoolsToolDiscoveryEvent;
      event.respondWith = jasmine.createSpy('respondWith');
      window.dispatchEvent(event);
      expect(event.respondWith).not.toHaveBeenCalled();
    });
  });
});
