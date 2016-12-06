/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerInjectable} from '../injectable';

import {getHtmlTagDefinition} from './html_tags';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './interpolation_config';
import {ParseTreeResult, Parser} from './parser';

export {ParseTreeResult, TreeError} from './parser';

@CompilerInjectable()
export class HtmlParser extends Parser {
  constructor() { super(getHtmlTagDefinition); }

  parse(
      source: string, url: string, parseExpansionForms: boolean = false,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG): ParseTreeResult {
    return super.parse(source, url, parseExpansionForms, interpolationConfig);
  }
}
