/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file contains the public API of the `@angular/localize` entry-point

export {clearTranslations, loadTranslations} from './src/translate';
export {MessageId, TargetMessage} from './src/utils';

// Exports that are not part of the public API
export * from './private';
