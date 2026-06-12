/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * This content script runs at `document_start` in the MAIN world (Chrome MV3)
 * so it executes in the page's JavaScript context **before** any page scripts,
 * including Angular.
 *
 * It sets a global flag that `@angular/core`'s profiler checks when deciding
 * whether to emit `angular-devtools://` deep link URLs in `console.timeStamp`
 * calls. The flag is only set when the Angular DevTools extension is installed,
 * ensuring that custom-scheme links never appear in performance traces on
 * browsers where they wouldn't be handled.
 */
(window as any).__NG_DEVTOOLS_CONNECTED__ = true;
