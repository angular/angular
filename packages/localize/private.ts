/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This file exports all the `utils` as private exports so that other parts of `@angular/localize`
// can make use of them.
export {$localize as ɵ$localize, _global as ɵ_global, LocalizeFn as ɵLocalizeFn, TranslateFn as ɵTranslateFn} from './src/localize';
export {computeMsgId as ɵcomputeMsgId, findEndOfBlock as ɵfindEndOfBlock, isMissingTranslationError as ɵisMissingTranslationError, makeParsedTranslation as ɵmakeParsedTranslation, makeTemplateObject as ɵmakeTemplateObject, MissingTranslationError as ɵMissingTranslationError, ParsedMessage as ɵParsedMessage, ParsedTranslation as ɵParsedTranslation, ParsedTranslations as ɵParsedTranslations, parseMessage as ɵparseMessage, parseMetadata as ɵparseMetadata, parseTranslation as ɵparseTranslation, SourceLocation as ɵSourceLocation, SourceMessage as ɵSourceMessage, splitBlock as ɵsplitBlock, translate as ɵtranslate} from './src/utils';
