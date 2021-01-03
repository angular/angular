/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵMessageId, ɵParsedMessage, ɵSourceLocation} from '@angular/localize';

/**
 * Consolidate an array of messages into a map from message id to an array of messages with that id.
 *
 * @param messages the messages to consolidate.
 * @param getMessageId a function that will compute the message id of a message.
 */
export function consolidateMessages(
    messages: ɵParsedMessage[],
    getMessageId: (message: ɵParsedMessage) => string): Map<ɵMessageId, ɵParsedMessage[]> {
  const consolidateMessages = new Map<ɵMessageId, ɵParsedMessage[]>();
  for (const message of messages) {
    const id = getMessageId(message);
    if (!consolidateMessages.has(id)) {
      consolidateMessages.set(id, [message]);
    } else {
      consolidateMessages.get(id)!.push(message);
    }
  }
  return consolidateMessages;
}

/**
 * Does the given message have a location property?
 */
export function hasLocation(message: ɵParsedMessage): message is ɵParsedMessage&
    {location: ɵSourceLocation} {
  return message.location !== undefined;
}
