/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function stripUrlQueryParamsAndFragment(url: string) {
  const queryQuestionMarkIdx = url.indexOf('?');
  if (queryQuestionMarkIdx > -1) {
    url = url.substring(0, queryQuestionMarkIdx);
  }
  const fragmentHashIdx = url.indexOf('#');
  if (fragmentHashIdx > -1) {
    url = url.substring(0, fragmentHashIdx);
  }

  return url;
}

/** Returns the URI of the extension content script. */
export function getContentScriptUri() {
  const url = stripUrlQueryParamsAndFragment(window.location.href);
  return 'angular-devtools-content-script-' + url;
}

/** Returns the URI of the extension backend. */
export function getBackendUri() {
  const url = stripUrlQueryParamsAndFragment(window.location.href);
  return 'angular-devtools-backend-' + url;
}

/** Returns the URI of the Angular detection script. */
export function getDetectAngularScriptUri() {
  const url = stripUrlQueryParamsAndFragment(window.location.href);
  return 'angular-devtools-detect-angular-' + url;
}
