/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AbsoluteFsPath, PathManipulation} from '@angular/compiler-cli/private/localize';
import {MessageId, ɵParsedMessage} from '../../../index';

import {DiagnosticHandlingStrategy, Diagnostics} from '../diagnostics';
import {serializeLocationPosition} from '../source_file_utils';

/**
 * Check each of the given `messages` to find those that have the same id but different message
 * text. Add diagnostics messages for each of these duplicate messages to the given `diagnostics`
 * object (as necessary).
 */
export function checkDuplicateMessages(
  fs: PathManipulation,
  messages: ɵParsedMessage[],
  duplicateMessageHandling: DiagnosticHandlingStrategy,
  basePath: AbsoluteFsPath,
): Diagnostics {
  const diagnostics = new Diagnostics();
  if (duplicateMessageHandling === 'ignore') return diagnostics;

  const messageMap = new Map<MessageId, ɵParsedMessage[]>();
  for (const message of messages) {
    if (messageMap.has(message.id)) {
      messageMap.get(message.id)!.push(message);
    } else {
      messageMap.set(message.id, [message]);
    }
  }

  for (const duplicates of messageMap.values()) {
    if (duplicates.length <= 1) continue;
    if (duplicates.every((message) => message.text === duplicates[0].text)) continue;

    const diagnosticMessage =
      `Duplicate messages with id "${duplicates[0].id}":\n` +
      duplicates.map((message) => serializeMessage(fs, basePath, message)).join('\n');
    diagnostics.add(duplicateMessageHandling, diagnosticMessage);
  }

  return diagnostics;
}

/**
 * Serialize the given `message` object into a string.
 */
function serializeMessage(
  fs: PathManipulation,
  basePath: AbsoluteFsPath,
  message: ɵParsedMessage,
): string {
  if (message.location === undefined) {
    return `   - "${message.text}"`;
  } else {
    const locationFile = fs.relative(basePath, message.location.file);
    const locationPosition = serializeLocationPosition(message.location);
    return `   - "${message.text}" : ${locationFile}:${locationPosition}`;
  }
}
