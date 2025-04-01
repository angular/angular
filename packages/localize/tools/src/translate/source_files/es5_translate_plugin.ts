/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getFileSystem, PathManipulation} from '@angular/compiler-cli/private/localize';
import {ɵParsedTranslation} from '../../../../index';
import {NodePath, PluginObj, types as t} from '@babel/core';

import {Diagnostics} from '../../diagnostics';
import {
  buildCodeFrameError,
  buildLocalizeReplacement,
  isBabelParseError,
  isLocalize,
  translate,
  TranslatePluginOptions,
  unwrapMessagePartsFromLocalizeCall,
  unwrapSubstitutionsFromLocalizeCall,
} from '../../source_file_utils';

/**
 * Create a Babel plugin that can be used to do compile-time translation of `$localize` tagged
 * messages.
 *
 * @publicApi used by CLI
 */
export function makeEs5TranslatePlugin(
  diagnostics: Diagnostics,
  translations: Record<string, ɵParsedTranslation>,
  {missingTranslation = 'error', localizeName = '$localize'}: TranslatePluginOptions = {},
  fs: PathManipulation = getFileSystem(),
): PluginObj {
  return {
    visitor: {
      CallExpression(callPath: NodePath<t.CallExpression>, state) {
        try {
          const calleePath = callPath.get('callee');
          if (isLocalize(calleePath, localizeName)) {
            const [messageParts] = unwrapMessagePartsFromLocalizeCall(callPath, fs);
            const [expressions] = unwrapSubstitutionsFromLocalizeCall(callPath, fs);
            const translated = translate(
              diagnostics,
              translations,
              messageParts,
              expressions,
              missingTranslation,
            );
            callPath.replaceWith(buildLocalizeReplacement(translated[0], translated[1]));
          }
        } catch (e) {
          if (isBabelParseError(e)) {
            diagnostics.error(buildCodeFrameError(fs, callPath, state.file, e));
          } else {
            throw e;
          }
        }
      },
    },
  };
}
