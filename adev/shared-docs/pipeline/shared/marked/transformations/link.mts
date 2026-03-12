/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens} from 'marked';
import {anchorTarget} from '../helpers.mjs';
import {AdevDocsRenderer} from '../renderer.mjs';

export function linkRender(this: AdevDocsRenderer, {href, title, tokens}: Tokens.Link) {
  // We have render-time check that we don't create absolute links (which are rendered as external links)
  // in our guides
  if (
    (href.startsWith('https://angular.dev/') || href.startsWith('http://angular.dev/')) &&
    this.isGuideFile()
  ) {
    Error.stackTraceLimit = Infinity;
    throw new Error(
      `Absolute links to angular.dev are not allowed: "${href}". Please use relative links instead.` +
        `\n ----------------------------- \n ${(this as any).__raw}`,
    );
  }

  if (!this.isKnownRoute(href)) {
    throw new Error(
      `Link target "${href}" in ${this.context.markdownFilePath} does not exist in the defined guide routes.`,
    );
  }

  if (this.context.disableAutoLinking) {
    return this.parser.parseInline(tokens);
  }

  const titleAttribute = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttribute}${anchorTarget(href)}>${this.parser.parseInline(tokens)}</a>`;
}
