/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {MessageId} from '../../utils/messages';
import {ParsedTranslation} from '../../utils/translations';

/**
 * An object that holds translations that have been loaded
 * from a translation file.
 */
export interface TranslationBundle {
  locale: string;
  translations: Record<MessageId, ParsedTranslation>;
}
