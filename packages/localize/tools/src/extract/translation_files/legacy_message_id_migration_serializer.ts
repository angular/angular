/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedMessage as ParsedMessage} from '@angular/localize';
import {Diagnostics} from '../../diagnostics';
import {TranslationSerializer} from './translation_serializer';


/**
 * A translation serializer that generates the mapping file for the legacy message ID migration.
 * The file is used by the `localize-migrate` script to migrate existing translation files from
 * the legacy message IDs to the canonical ones.
 */
export class LegacyMessageIdMigrationSerializer implements TranslationSerializer {
  constructor(private _diagnostics: Diagnostics) {}

  serialize(messages: ParsedMessage[]): string {
    let hasMessages = false;
    const mapping = messages.reduce((output, message) => {
      if (shouldMigrate(message)) {
        for (const legacyId of message.legacyIds!) {
          if (output.hasOwnProperty(legacyId)) {
            this._diagnostics.warn(`Detected duplicate legacy ID ${legacyId}.`);
          }

          output[legacyId] = message.id;
          hasMessages = true;
        }
      }
      return output;
    }, {} as Record<string, string>);

    if (!hasMessages) {
      this._diagnostics.warn(
          'Could not find any legacy message IDs in source files while generating ' +
          'the legacy message migration file.');
    }

    return JSON.stringify(mapping, null, 2);
  }
}

/** Returns true if a message needs to be migrated. */
function shouldMigrate(message: ParsedMessage): boolean {
  return !message.customId && !!message.legacyIds && message.legacyIds.length > 0;
}
