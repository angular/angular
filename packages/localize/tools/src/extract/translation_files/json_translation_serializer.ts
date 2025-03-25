/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MessageId, ɵParsedMessage, ɵSourceMessage} from '../../../../index';

import {TranslationSerializer} from './translation_serializer';
import {consolidateMessages} from './utils';

interface SimpleJsonTranslationFile {
  locale: string;
  translations: Record<MessageId, ɵSourceMessage>;
}

/**
 * This is a semi-public bespoke serialization format that is used for testing and sometimes as a
 * format for storing translations that will be inlined at runtime.
 *
 * @see SimpleJsonTranslationParser
 */
export class SimpleJsonTranslationSerializer implements TranslationSerializer {
  constructor(private sourceLocale: string) {}
  serialize(messages: ɵParsedMessage[]): string {
    const fileObj: SimpleJsonTranslationFile = {locale: this.sourceLocale, translations: {}};
    for (const [message] of consolidateMessages(messages, (message) => message.id)) {
      fileObj.translations[message.id] = message.text;
    }
    return JSON.stringify(fileObj, null, 2);
  }
}
