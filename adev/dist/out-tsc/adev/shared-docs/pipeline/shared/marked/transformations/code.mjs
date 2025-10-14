/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getSymbolUrl} from '../../linking.mjs';
import {codeToHtml} from '../../shiki.mjs';
export function codespanRender(token) {
  const apiLink = getSymbolUrl(token.text, this.context.apiEntries ?? {});
  if (apiLink) {
    const htmlToken = {
      type: 'html',
      raw: `<code>${token.text}</code>`,
      text: this.defaultRenderer.codespan(token),
      pre: false,
      block: false,
    };
    const linkToken = {
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
export function codeRender({text, lang}) {
  const highlightResult = codeToHtml(this.context.highlighter, text, lang)
    // remove spaces/line-breaks between elements to not mess-up `pre` style
    .replace(/>\s+</g, '><');
  return `
      <div class="docs-code" role="group">
        ${highlightResult}
      </div>
    `;
}
//# sourceMappingURL=code.mjs.map
