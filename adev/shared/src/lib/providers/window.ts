/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

// Providing window using injection token could increase testability and portability (i.e SSR don't have a real browser environment).
export const WINDOW = new InjectionToken<Window>('WINDOW');

// The project uses prerendering, to resolve issue: 'window is not defined', we should get window from DOCUMENT.
// As it is recommended here: https://github.com/angular/universal/blob/main/docs/gotchas.md#strategy-1-injection
export function windowProvider(document: Document) {
  return document.defaultView;
}
