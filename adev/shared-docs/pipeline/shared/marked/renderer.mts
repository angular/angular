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
  markdownFilePath: string;
  apiEntries: Record<string, string>;
  highlighter: HighlighterGeneric<any, any>;
}

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export class AdevDocsRenderer extends Renderer {
  constructor(public context: RendererContext) {
    super();
  }

  defaultRenderer = new Renderer();

  override link = linkRender;
  override table = tableRender;
  override list = listRender;
  override image = imageRender;
  override text = textRender;
  override heading = headingRender;
  override codespan = codespanRender;
}
