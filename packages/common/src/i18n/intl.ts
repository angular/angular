/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Not using a InjectionToken as inject()/@Inject() will break code that create the pipes manually
 * (tests)
 */
let _useIntl = false;

// export const USE_INTL = new InjectionToken<boolean>(
//   typeof ngDevMode === 'undefined' || ngDevMode ? 'USE_INTL' : '',
//   {factory: () => false},
// );

// export function provideIntl() {
//   return [{provide: USE_INTL, useValue: true}];
// }

export function setUseIntl(use: boolean) {
  _useIntl = use;
}

export function useIntl() {
  return _useIntl;
}
