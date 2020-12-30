/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PathManipulation} from '@angular/compiler-cli/src/ngtsc/file_system';
import {ɵParsedMessage, ɵparseMessage} from '@angular/localize';
import {NodePath, PluginObj} from '@babel/core';
import {TaggedTemplateExpression} from '@babel/types';

import {getLocation, isGlobalIdentifier, isNamedIdentifier, unwrapExpressionsFromTemplateLiteral, unwrapMessagePartsFromTemplateLiteral} from '../../source_file_utils';

export function makeEs2015ExtractPlugin(
    fs: PathManipulation, messages: ɵParsedMessage[], localizeName = '$localize'): PluginObj {
  return {
    visitor: {
      TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
        const tag = path.get('tag');
        if (isNamedIdentifier(tag, localizeName) && isGlobalIdentifier(tag)) {
          const quasiPath = path.get('quasi');
          const [messageParts, messagePartLocations] =
              unwrapMessagePartsFromTemplateLiteral(quasiPath.get('quasis'), fs);
          const [expressions, expressionLocations] =
              unwrapExpressionsFromTemplateLiteral(quasiPath, fs);
          const location = getLocation(fs, quasiPath);
          const message = ɵparseMessage(
              messageParts, expressions, location, messagePartLocations, expressionLocations);
          messages.push(message);
        }
      }
    }
  };
}
