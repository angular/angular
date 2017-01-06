/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * JS version of browser APIs. This library can only run in the browser.
 */
const win = typeof window !== 'undefined' && window || <any>{};

export {win as window};
export const document = win.document;
export const location = win.location;
export const gc = win['gc'] ? () => win['gc']() : (): any => null;
export const performance = win['performance'] ? win['performance'] : null;
export const Event = win['Event'];
export const MouseEvent = win['MouseEvent'];
export const KeyboardEvent = win['KeyboardEvent'];
export const EventTarget = win['EventTarget'];
export const History = win['History'];
export const Location = win['Location'];
export const EventListener = win['EventListener'];
