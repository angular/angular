/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodePath, PluginObj} from '@babel/core';
import {TaggedTemplateExpression} from '@babel/types';

import {ParsedMessage, isGlobal, isNamedIdentifier, parseMessage, unwrapMessagePartsFromTemplateLiteral} from '../../utils';

export function makeEs2015ExtractPlugin(
    messages: ParsedMessage[], localizeName = '$localize'): PluginObj {
  return {
    visitor: {
      TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
        const tag = path.get('tag');
        if (isNamedIdentifier(tag, localizeName) && isGlobal(tag)) {
          const messageParts = unwrapMessagePartsFromTemplateLiteral(path.node.quasi.quasis);
          const message = parseMessage(messageParts, path.node.quasi.expressions);
          messages.push(message);
        }
      }
    }
  };
}
