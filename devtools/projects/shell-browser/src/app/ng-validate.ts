/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

if (document.contentType === 'text/html') {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('app/detect_angular_for_extension_icon_bundle.js');
  document.documentElement.appendChild(script);
  document.documentElement.removeChild(script);
}
