/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseTreeResult, Parser} from './parser';
import {getXmlTagDefinition} from './xml_tags';

export {ParseTreeResult, TreeError} from './parser';

export class XmlParser extends Parser {
  constructor() { super(getXmlTagDefinition); }

  parse(source: string, url: string, parseExpansionForms: boolean = false): ParseTreeResult {
    return super.parse(source, url, parseExpansionForms, null);
  }
}
