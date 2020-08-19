/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedMessage, ɵparseMessage} from '@angular/localize';
import {NodePath, PluginObj} from '@babel/core';
import {TaggedTemplateExpression} from '@babel/types';

import {getLocation, isGlobalIdentifier, isNamedIdentifier, unwrapMessagePartsFromTemplateLiteral} from '../../source_file_utils';

export function makeEs2015ExtractPlugin(
    messages: ɵParsedMessage[], localizeName = '$localize'): PluginObj {
  return {
    visitor: {
      TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
        const tag = path.get('tag');
        if (isNamedIdentifier(tag, localizeName) && isGlobalIdentifier(tag)) {
          const [messageParts, messagePartLocations] =
              unwrapMessagePartsFromTemplateLiteral(path.get('quasi').get('quasis'));
          const expressions = path.node.quasi.expressions;
          const expressionLocations = path.get('quasi').get('expressions').map(e => getLocation(e));
          const location = getLocation(path.get('quasi'));
          const message = ɵparseMessage(
              messageParts, expressions, location, messagePartLocations, expressionLocations);
          messages.push(message);
        }
      }
    }
  };
}
