/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

/**
 * Custom URL scheme used for deep linking from the Chrome Performance panel
 * to a specific component in Angular DevTools. Must match the scheme used
 * in `packages/core/src/render3/debug/chrome_dev_tools_performance.ts`.
 */
const DEEP_LINK_SCHEME = 'angular-devtools';

const theme = chrome.devtools.panels.themeName;
chrome.devtools.panels.create(
  'Angular',
  // Firefox specifically displays the icon in the tab.
  // the bw icon wasn't visible in dark mode
  theme === 'dark' ? 'assets/icon16.png' : 'assets/icon-bw16.png',
  'index.html',
  (panel) => {
    // Keep a reference to the panel's window so we can post messages
    // even if the panel is already visible (onShown won't re-fire).
    let currentPanelWindow: Window | null = null;
    panel.onShown.addListener((panelWindow: Window) => {
      currentPanelWindow = panelWindow;
    });
    panel.onHidden.addListener(() => {
      currentPanelWindow = null;
    });

    // Register a handler for deep links from the Chrome Performance panel.
    // When the user clicks on an Angular performance entry (e.g. a component lifecycle hook),
    // Chrome calls this handler with the deep link URL, activating the Angular DevTools panel
    // and navigating to the relevant component.
    //
    // The optional `urlScheme` second parameter on `setOpenResourceHandler` is a Chrome 140+
    // extension that registers this handler exclusively for URLs with the given scheme.
    // It is not yet reflected in the official chrome.devtools.panels in @types/chrome
    // see: https://issues.chromium.org/issues/427430112
    //
    // NOTE: This feature requires the following Chrome flag to be enabled:
    //   chrome://flags/#enable-devtools-deep-link-via-extensibility-api
    type OpenResourceHandler = (
      callback: (resource: {url: string}) => void,
      urlScheme?: string,
    ) => void;

    const setHandler = chrome.devtools.panels.setOpenResourceHandler as OpenResourceHandler;

    setHandler((resource: {url: string}) => {
      // Extract the instance ID from "angular-devtools://component/{instanceId}".
      const match = resource.url.match(/^angular-devtools:\/\/component\/(\d+)$/);
      if (!match) return;

      const instanceId = parseInt(match[1], 10);

      panel.show();

      // Post immediately if the panel is already visible; otherwise wait for onShown.
      if (currentPanelWindow) {
        currentPanelWindow.postMessage({type: 'angular-devtools-deep-link', instanceId}, '*');
      } else {
        const onShown = (panelWindow: Window) => {
          panel.onShown.removeListener(onShown);

          panelWindow.postMessage(
            {
              type: 'angular-devtools-deep-link',
              instanceId,
            },
            '*',
          );
        };

        panel.onShown.addListener(onShown);
      }
    }, DEEP_LINK_SCHEME);
  },
);
