/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TokenizeOptions} from './lexer.js';
import {Parser, ParseTreeResult} from './parser.js';
import {getXmlTagDefinition} from './xml_tags.js';

export class XmlParser extends Parser {
  constructor() {
    super(getXmlTagDefinition);
  }

  override parse(source: string, url: string, options?: TokenizeOptions): ParseTreeResult {
    return super.parse(source, url, options);
  }
}
