/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TokenizeOptions} from './lexer';
import {Parser, ParseTreeResult} from './parser';
import {getXmlTagDefinition} from './xml_tags';

export class XmlParser extends Parser {
  constructor() {
    super(getXmlTagDefinition);
  }

  override parse(source: string, url: string, options: TokenizeOptions = {}): ParseTreeResult {
    // Blocks and let declarations aren't supported in an XML context.
    return super.parse(source, url, {
      ...options,
      tokenizeBlocks: false,
      tokenizeLet: false,
      selectorlessEnabled: false,
    });
  }
}
