/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererApi} from 'marked';
import emojiRegex from 'emoji-regex';

/** Regex to find unicode emojis. */
const UNICODE_EMOJI_REGEX = /&#x[\dA-Fa-f]+;/g;

/** Regex to find emojis. */
const regex = emojiRegex();

export const textRender: RendererApi['text'] = (text) => {
  return regex.test(text) || UNICODE_EMOJI_REGEX.test(text)
    ? `<span class="docs-emoji">${text}</span>`
    : text;
};
