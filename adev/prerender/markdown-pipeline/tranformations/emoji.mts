/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import emojiRegex from 'emoji-regex';

const UNICODE_EMOJI_REGEX = /&#x[\dA-Fa-f]+;/g;

const regex = emojiRegex();

export function handleEmoji(text: string): string {
  return text.match(regex) || text.match(UNICODE_EMOJI_REGEX)
    ? `<span class="docs-emoji">${text}</span>`
    : text;
}
