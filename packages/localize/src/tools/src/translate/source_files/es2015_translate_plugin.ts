/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedTranslation} from '@angular/localize';
import {NodePath, PluginObj} from '@babel/core';
import {TaggedTemplateExpression} from '@babel/types';

import {Diagnostics} from '../../diagnostics';

import {buildCodeFrameError, buildLocalizeReplacement, isBabelParseError, isLocalize, translate, TranslatePluginOptions, unwrapMessagePartsFromTemplateLiteral} from '../../source_file_utils';

export function makeEs2015TranslatePlugin(
    diagnostics: Diagnostics, translations: Record<string, ɵParsedTranslation>,
    {missingTranslation = 'error', localizeName = '$localize'}: TranslatePluginOptions = {}):
    PluginObj {
  return {
    visitor: {
      TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
        try {
          const tag = path.get('tag');
          if (isLocalize(tag, localizeName)) {
            const messageParts = unwrapMessagePartsFromTemplateLiteral(path.node.quasi.quasis);
            const translated = translate(
                diagnostics, translations, messageParts, path.node.quasi.expressions,
                missingTranslation);
            path.replaceWith(buildLocalizeReplacement(translated[0], translated[1]));
          }
        } catch (e) {
          if (isBabelParseError(e)) {
            // If we get a BabelParseError here then something went wrong with Babel itself
            // since there must be something wrong with the structure of the AST generated
            // by Babel parsing a TaggedTemplateExpression.
            throw buildCodeFrameError(path, e);
          } else {
            throw e;
          }
        }
      }
    }
  };
}
