/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedMessage, ɵparseMessage} from '@angular/localize';
import {NodePath, PluginObj} from '@babel/core';
import {CallExpression} from '@babel/types';

import {getLocation, isGlobalIdentifier, isNamedIdentifier, unwrapMessagePartsFromLocalizeCall, unwrapSubstitutionsFromLocalizeCall} from '../../source_file_utils';

export function makeEs5ExtractPlugin(
    messages: ɵParsedMessage[], localizeName = '$localize'): PluginObj {
  return {
    visitor: {
      CallExpression(callPath: NodePath<CallExpression>) {
        const calleePath = callPath.get('callee');
        if (isNamedIdentifier(calleePath, localizeName) && isGlobalIdentifier(calleePath)) {
          const messageParts = unwrapMessagePartsFromLocalizeCall(callPath);
          const expressions = unwrapSubstitutionsFromLocalizeCall(callPath.node);
          const location = getLocation(callPath);
          const message = ɵparseMessage(messageParts, expressions, location);
          messages.push(message);
        }
      }
    }
  };
}
