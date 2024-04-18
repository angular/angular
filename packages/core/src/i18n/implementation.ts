/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export let useIntlImpelmentation = false;

export const usePluralIntlImplementation = () => {
  useIntlImpelmentation = true;
};

export const usePluralLegacyImplementation = () => {
  useIntlImpelmentation = false;
};
