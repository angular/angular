/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens} from 'marked';
import {getApiLink} from '../utils.mjs';
import {Renderer} from '../renderer.mjs';

export function codespanRender(this: Renderer, token: Tokens.Codespan) {
  const apiLink = getApiLink(token.text);
  if (apiLink) {
    const htmlToken: Tokens.HTML = {
      type: 'html',
      raw: `<code>${token.text}</code>`,
      text: this.defaultRenderer.codespan(token),
      pre: false,
      block: false,
    };
    const linkToken: Tokens.Link = {
      type: 'link',
      raw: `[${token.text}](${apiLink})`,
      href: apiLink,
      text: '',
      tokens: [htmlToken],
    };
    return this.link(linkToken);
  }
  return this.defaultRenderer.codespan(token);
}
