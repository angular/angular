/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signalGraphTool} from './signal_graph';
import {DevtoolsToolDiscoveryEvent} from './tool_definitions';

/**
 * Registers Angular AI tools with Chrome DevTools.
 *
 * This function listens for the `devtoolstooldiscovery` event and responds with
 * the available Angular-specific tools.
 *
 * @returns A callback function to unregister the tools.
 */
export function registerAiTools(): () => void {
  // No-op in non-browser environments.
  // Need to explicitly check for `addEventListener` as some hydration tests define `window = globalThis;`.
  if (typeof window === 'undefined' || !window.addEventListener) return () => {};

  function listener(inputEvent: Event): void {
    const event = inputEvent as DevtoolsToolDiscoveryEvent;
    event.respondWith({
      name: 'Angular',
      tools: [signalGraphTool],
    });
  }

  window.addEventListener('devtoolstooldiscovery', listener);
  return () => {
    window.removeEventListener('devtoolstooldiscovery', listener);
  };
}
