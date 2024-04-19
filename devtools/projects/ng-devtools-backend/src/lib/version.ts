/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const versionElement = document.querySelector('[ng-version]');
const versionRe = /(\d+\.\d+\.\d+(-(next|rc)\.\d+)?)/;

const defaultVersion = '0.0.0';
let version = defaultVersion;
if (versionElement) {
  version = versionElement.getAttribute('ng-version') ?? defaultVersion;
  version = (version.match(versionRe) ?? [''])[0] ?? defaultVersion;
}

export const VERSION = version;
