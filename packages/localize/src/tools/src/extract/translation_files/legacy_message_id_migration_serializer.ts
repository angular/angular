/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedMessage as ParsedMessage} from '@angular/localize';
import {TranslationSerializer} from './translation_serializer';


/** A translation serializer that generates the mapping file for the legacy message ID migration. */
export class LegacyMessageIdMigrationSerializer implements TranslationSerializer {
  /** Gets whether any of the passed-in messages need to be migrated. */
  hasMigratableIds(messages: ParsedMessage[]): boolean {
    return messages.some(shouldMigrate);
  }

  serialize(messages: ParsedMessage[]): string {
    const mapping = messages.reduce((output, message) => {
      if (shouldMigrate(message)) {
        for (const legacyId of message.legacyIds!) {
          output[legacyId] = message.id;
        }
      }
      return output;
    }, {} as Record<string, string>);

    return JSON.stringify(mapping, null, 2);
  }
}

/** Gets whether a particular message needs to be migrated. */
function shouldMigrate(message: ParsedMessage): boolean {
  return !message.customId && !!message.legacyIds && message.legacyIds.length > 0;
}
