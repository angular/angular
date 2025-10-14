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
import {codeRender, codespanRender} from './transformations/code.mjs';
/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export class AdevDocsRenderer extends Renderer {
  context;
  constructor(context) {
    super();
    this.context = context;
  }
  defaultRenderer = new Renderer();
  link = linkRender;
  table = tableRender;
  list = listRender;
  image = imageRender;
  text = textRender;
  heading = headingRender;
  codespan = codespanRender;
  code = codeRender;
}
//# sourceMappingURL=renderer.mjs.map
