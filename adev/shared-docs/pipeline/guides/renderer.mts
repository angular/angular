/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Renderer as _Renderer} from 'marked';
import {linkRender} from './tranformations/link.mjs';
import {tableRender} from './tranformations/table.mjs';
import {listRender} from './tranformations/list.mjs';
import {imageRender} from './tranformations/image.mjs';
import {textRender} from './tranformations/text.mjs';
import {headingRender} from './tranformations/heading.mjs';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export class Renderer extends _Renderer {
  override link = linkRender;
  override table = tableRender;
  override list = listRender;
  override image = imageRender;
  override text = textRender;
  override heading = headingRender;
}
