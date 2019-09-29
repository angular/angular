/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParsedMessage} from '../../utils';
import {TranslationSerializer} from './translation_serializer';

interface SimpleJsonTranslationFile {
  locale: string;
  translations: Record<string, string>;
}

export class JsonTranslationSerializer implements TranslationSerializer {
  renderFile(messages: ParsedMessage[]): string {
    let fileObj: SimpleJsonTranslationFile = {locale: 'en', translations: {}};
    messages.forEach(
        message => { fileObj.translations[message.messageId] = message.messageString; });
    return JSON.stringify(fileObj, null, 2);
  }
}
