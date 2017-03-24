/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateInfo} from './common';
import {locateSymbol} from './locate_symbol';
import {Hover, HoverTextSection, Symbol} from './types';

export function getHover(info: TemplateInfo): Hover|undefined {
  const result = locateSymbol(info);
  if (result) {
    return {text: hoverTextOf(result.symbol), span: result.span};
  }
}

function hoverTextOf(symbol: Symbol): HoverTextSection[] {
  const result: HoverTextSection[] =
      [{text: symbol.kind}, {text: ' '}, {text: symbol.name, language: symbol.language}];
  const container = symbol.container;
  if (container) {
    result.push({text: ' of '}, {text: container.name, language: container.language});
  }
  return result;
}