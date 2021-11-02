/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵMessageId, ɵParsedMessage, ɵSourceLocation} from '@angular/localize';

/**
 * Consolidate messages into groups that have the same id.
 *
 * Messages with the same id are grouped together so that we can quickly deduplicate messages when
 * rendering into translation files.
 *
 * To ensure that messages are rendered in a deterministic order:
 *  - the messages within a group are sorted by location (file path, then start position)
 *  - the groups are sorted by the location of the first message in the group
 *
 * @param messages the messages to consolidate.
 * @param getMessageId a function that will compute the message id of a message.
 * @returns an array of message groups, where each group is an array of messages that have the same
 *     id.
 */
export function consolidateMessages(
    messages: ɵParsedMessage[],
    getMessageId: (message: ɵParsedMessage) => string): ɵParsedMessage[][] {
  const messageGroups = new Map<ɵMessageId, ɵParsedMessage[]>();
  for (const message of messages) {
    const id = getMessageId(message);
    if (!messageGroups.has(id)) {
      messageGroups.set(id, [message]);
    } else {
      messageGroups.get(id)!.push(message);
    }
  }

  // Here we sort the messages within a group into location order.
  // Note that `Array.sort()` will mutate the array in-place.
  for (const messages of messageGroups.values()) {
    messages.sort(compareLocations);
  }
  // Now we sort the groups by location of the first message in the group.
  return Array.from(messageGroups.values()).sort((a1, a2) => compareLocations(a1[0], a2[0]));
}

/**
 * Does the given message have a location property?
 */
export function hasLocation(message: ɵParsedMessage): message is ɵParsedMessage&
    {location: ɵSourceLocation} {
  return message.location !== undefined;
}

export function compareLocations(
    {location: location1}: ɵParsedMessage, {location: location2}: ɵParsedMessage): number {
  if (location1 === location2) {
    return 0;
  }
  if (location1 === undefined) {
    return -1;
  }
  if (location2 === undefined) {
    return 1;
  }
  if (location1.file !== location2.file) {
    return location1.file < location2.file ? -1 : 1;
  }
  if (location1.start.line !== location2.start.line) {
    return location1.start.line < location2.start.line ? -1 : 1;
  }
  if (location1.start.column !== location2.start.column) {
    return location1.start.column < location2.start.column ? -1 : 1;
  }
  return 0;
}
