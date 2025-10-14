/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getHtmlTagDefinition} from './html_tags';
import {Parser} from './parser';
export class HtmlParser extends Parser {
  constructor() {
    super(getHtmlTagDefinition);
  }
  parse(source, url, options) {
    return super.parse(source, url, options);
  }
}
//# sourceMappingURL=html_parser.js.map
