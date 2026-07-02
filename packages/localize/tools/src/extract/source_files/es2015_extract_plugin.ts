/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PathManipulation} from '@angular/compiler-cli/private/localize';
import {ɵParsedMessage, ɵparseMessage} from '../../../../index';
import {NodePath, PluginObj, types as t} from '@babel/core';

import {
  getLocation,
  isGlobalIdentifier,
  isNamedIdentifier,
  unwrapExpressionsFromTemplateLiteral,
  unwrapMessagePartsFromTemplateLiteral,
} from '../../source_file_utils';

export function makeEs2015ExtractPlugin(
  fs: PathManipulation,
  messages: ɵParsedMessage[],
  localizeName = '$localize',
): PluginObj {
  return {
    visitor: {
      TaggedTemplateExpression(path: NodePath<t.TaggedTemplateExpression>) {
        const tag = path.get('tag');
        if (isNamedIdentifier(tag, localizeName) && isGlobalIdentifier(tag)) {
          const quasiPath = path.get('quasi');
          const [messageParts, messagePartLocations] = unwrapMessagePartsFromTemplateLiteral(
            quasiPath.get('quasis'),
            fs,
          );
          const [expressions, expressionLocations] = unwrapExpressionsFromTemplateLiteral(
            quasiPath,
            fs,
          );
          const location = getLocation(fs, quasiPath);
          const message = ɵparseMessage(
            messageParts,
            expressions,
            location,
            messagePartLocations,
            expressionLocations,
          );
          messages.push(message);
        }
      },
    },
  };
}
