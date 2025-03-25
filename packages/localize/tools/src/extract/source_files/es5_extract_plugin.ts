/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PathManipulation} from '@angular/compiler-cli/private/localize';
import {ɵParsedMessage, ɵparseMessage} from '@angular/localize';
import {NodePath, PluginObj, types as t} from '@babel/core';

import {
  buildCodeFrameError,
  getLocation,
  isBabelParseError,
  isGlobalIdentifier,
  isNamedIdentifier,
  unwrapMessagePartsFromLocalizeCall,
  unwrapSubstitutionsFromLocalizeCall,
} from '../../source_file_utils';

export function makeEs5ExtractPlugin(
  fs: PathManipulation,
  messages: ɵParsedMessage[],
  localizeName = '$localize',
): PluginObj {
  return {
    visitor: {
      CallExpression(callPath: NodePath<t.CallExpression>, state) {
        try {
          const calleePath = callPath.get('callee');
          if (isNamedIdentifier(calleePath, localizeName) && isGlobalIdentifier(calleePath)) {
            const [messageParts, messagePartLocations] = unwrapMessagePartsFromLocalizeCall(
              callPath,
              fs,
            );
            const [expressions, expressionLocations] = unwrapSubstitutionsFromLocalizeCall(
              callPath,
              fs,
            );
            const [messagePartsArg, expressionsArg] = callPath.get('arguments');
            const location = getLocation(fs, messagePartsArg, expressionsArg);
            const message = ɵparseMessage(
              messageParts,
              expressions,
              location,
              messagePartLocations,
              expressionLocations,
            );
            messages.push(message);
          }
        } catch (e) {
          if (isBabelParseError(e)) {
            // If we get a BabelParseError here then something went wrong with Babel itself
            // since there must be something wrong with the structure of the AST generated
            // by Babel parsing a TaggedTemplateExpression.
            throw buildCodeFrameError(fs, callPath, state.file, e);
          } else {
            throw e;
          }
        }
      },
    },
  };
}
