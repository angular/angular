/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer as MarkedRenderer, marked} from 'marked';
import {handleCode} from './tranformations/code.mjs';
import {handleEmoji} from './tranformations/emoji.mjs';
import {transformH1} from './tranformations/h1.mjs';
import {transformHeader} from './tranformations/header.mjs';
import {transformImage} from './tranformations/image.mjs';
import {transformLink} from './tranformations/link.mjs';
import {transformDocsList} from './tranformations/lists.mjs';
import {transformDocsTable} from './tranformations/table.mjs';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export const renderer: Partial<MarkedRenderer> = {
  // All headers have tabindex="-1"
  // so that we can focus relevant sections on
  // navigation for accessibility purposes.
  heading(label: string, level: number) {
    switch (level) {
      // Custom H1 header element with page breadcrumb and docs edit button link to GitHub
      case 1:
        return transformH1(label);
      // Custom headers include an anchor link and href
      default:
        return transformHeader(label, level);
    }
  },
  // Custom table styling
  table(header: string, body: string) {
    return transformDocsTable(header, body);
  },
  // Custom list styling
  list(body: string, ordered: boolean) {
    return transformDocsList(body, ordered);
  },
  // Custom list styling
  image(href: string | null, title: string | null, text: string) {
    return transformImage(href, title, text);
  },
  // Handles special behavior for external links
  link(href: string | null, title: string | null, text: string) {
    return transformLink(href, title, text);
  },
  // Custom code span styling
  codespan(this: marked.RendererThis, code: string): string {
    return handleCode(code);
  },
  // Custom text styling
  text(this: marked.RendererThis, code: string): string {
    return handleEmoji(code);
  },
};
