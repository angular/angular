/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Parser} from './parser';
import {getXmlTagDefinition} from './xml_tags';
export class XmlParser extends Parser {
  constructor() {
    super(getXmlTagDefinition);
  }
  parse(source, url, options = {}) {
    // Blocks and let declarations aren't supported in an XML context.
    return super.parse(source, url, {
      ...options,
      tokenizeBlocks: false,
      tokenizeLet: false,
      selectorlessEnabled: false,
    });
  }
}
//# sourceMappingURL=xml_parser.js.map
