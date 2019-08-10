/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodePath, PluginObj} from '@babel/core';
import {CallExpression} from '@babel/types';
import {ParsedTranslation} from '../../utils/translations';
import {buildLocalizeReplacement, isGlobal, isNamedIdentifier, translate, unwrapMessagePartsFromLocalizeCall, unwrapSubstitutionsFromLocalizeCall} from './utils';

export function makeEs5Plugin(
    translations: Record<string, ParsedTranslation>, localizeName = '$localize'): PluginObj {
  return {
    visitor: {
      CallExpression(callPath: NodePath<CallExpression>) {
        const calleePath = callPath.get('callee');
        if (isNamedIdentifier(calleePath, localizeName) && isGlobal(calleePath)) {
          const messageParts = unwrapMessagePartsFromLocalizeCall(callPath.node);
          const expressions = unwrapSubstitutionsFromLocalizeCall(callPath.node);
          const translated = translate(translations, messageParts, expressions);
          callPath.replaceWith(buildLocalizeReplacement(translated[0], translated[1]));
        }
      }
    }
  };
}
