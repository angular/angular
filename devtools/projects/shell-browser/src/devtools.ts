/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>
const theme = chrome.devtools.panels.themeName;
chrome.devtools.panels.create(
  'Angular',
  // Firefox specifically displays the icon in the tab.
  // the bw icon wasn't visible in dark mode
  theme === 'dark' ? 'assets/icon16.png' : 'assets/icon-bw16.png',
  'index.html',
);
