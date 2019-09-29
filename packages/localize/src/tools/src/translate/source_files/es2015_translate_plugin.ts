/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodePath, PluginObj} from '@babel/core';
import {TaggedTemplateExpression} from '@babel/types';
import {ParsedTranslation, buildLocalizeReplacement, isGlobal, isNamedIdentifier, translate, unwrapMessagePartsFromTemplateLiteral} from '../../utils';

export function makeEs2015TranslatePlugin(
    translations: Record<string, ParsedTranslation>, localizeName = '$localize'): PluginObj {
  return {
    visitor: {
      TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
        const tag = path.get('tag');
        if (isNamedIdentifier(tag, localizeName) && isGlobal(tag)) {
          const messageParts = unwrapMessagePartsFromTemplateLiteral(path.node.quasi.quasis);
          const translated = translate(translations, messageParts, path.node.quasi.expressions);
          path.replaceWith(buildLocalizeReplacement(translated[0], translated[1]));
        }
      }
    }
  };
}
