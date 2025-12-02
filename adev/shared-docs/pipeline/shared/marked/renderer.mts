/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer} from 'marked';
import {linkRender} from './transformations/link.mjs';
import {tableRender} from './transformations/table.mjs';
import {listRender} from './transformations/list.mjs';
import {imageRender} from './transformations/image.mjs';
import {textRender} from './transformations/text.mjs';
import {headingRender} from './transformations/heading.mjs';
import {codespanRender} from './transformations/code.mjs';
import {HighlighterGeneric} from 'shiki';

export interface RendererContext {
  markdownFilePath?: string;
  apiEntries?: Record<string, {moduleName: string; aliases?: string[]}>;
  highlighter: HighlighterGeneric<any, any>;
  headerIds: Map<string, number>;
}

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export class AdevDocsRenderer extends Renderer {
  public context: RendererContext;
  constructor(context: Partial<RendererContext>) {
    super();
    if (context.highlighter === undefined) {
      throw Error(
        'An instance of HighlighterGeneric must be provided to the AdevDocsRenderer at construction',
      );
    }
    context.headerIds = context.headerIds || new Map<string, number>();
    this.context = context as RendererContext;
  }

  defaultRenderer = new Renderer();

  override link = linkRender;
  override table = tableRender;
  override list = listRender;
  override image = imageRender;
  override text = textRender;
  override heading = headingRender;
  override codespan = codespanRender;

  getHeaderId(heading: string) {
    const numberOfHeaderOccurrencesInTheDocument = this.context.headerIds.get(heading) ?? 0;
    this.context.headerIds.set(heading, numberOfHeaderOccurrencesInTheDocument + 1);

    // extract the extended markdown heading id
    // ex:  ## MyHeading {# myId}
    const match = heading.match(/{#([\w-]+)}/);

    let extractedId: string;
    if (match) {
      extractedId = match[1];
    } else {
      extractedId = heading
        .toLowerCase()
        .replace(/<code>(.*?)<\/code>/g, '$1') // remove <code>
        .replace(/<strong>(.*?)<\/strong>/g, '$1') // remove <strong>
        .replace(/<em>(.*?)<\/em>/g, '$1') // remove <em>
        .replace(/\s|\//g, '-') // remove spaces and slashes
        .replace(/gt;|lt;/g, '') // remove escaped < and >
        .replace(/&#\d+;/g, '') // remove HTML entities
        .replace(/[^\p{L}\d\-]/gu, ''); // only keep letters, digits & dashes
    }

    const headerId = numberOfHeaderOccurrencesInTheDocument
      ? `${extractedId}-${numberOfHeaderOccurrencesInTheDocument}`
      : extractedId;

    return headerId;
  }
}
