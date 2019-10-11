/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedTranslation} from '@angular/localize';
import {NodePath, PluginObj} from '@babel/core';
import {CallExpression} from '@babel/types';
import {Diagnostics} from '../../diagnostics';
import {TranslatePluginOptions, buildLocalizeReplacement, isBabelParseError, isGlobalIdentifier, isNamedIdentifier, translate, unwrapMessagePartsFromLocalizeCall, unwrapSubstitutionsFromLocalizeCall} from './source_file_utils';

export function makeEs5TranslatePlugin(
    diagnostics: Diagnostics, translations: Record<string, ɵParsedTranslation>,
    {missingTranslation = 'error', localizeName = '$localize'}: TranslatePluginOptions = {}):
    PluginObj {
  return {
    visitor: {
      CallExpression(callPath: NodePath<CallExpression>) {
        try {
          const calleePath = callPath.get('callee');
          if (isNamedIdentifier(calleePath, localizeName) && isGlobalIdentifier(calleePath)) {
            const messageParts = unwrapMessagePartsFromLocalizeCall(callPath);
            const expressions = unwrapSubstitutionsFromLocalizeCall(callPath.node);
            const translated =
                translate(diagnostics, translations, messageParts, expressions, missingTranslation);
            callPath.replaceWith(buildLocalizeReplacement(translated[0], translated[1]));
          }
        } catch (e) {
          if (isBabelParseError(e)) {
            diagnostics.error(callPath.hub.file.buildCodeFrameError(e.node, e.message).message);
          }
        }
      }
    }
  };
}
