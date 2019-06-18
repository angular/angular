/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {IndexedComponent} from './api';
import {IndexingContext} from './context';
import {getTemplateIdentifiers} from './template';

/**
 * Generates `IndexedComponent` entries from a `IndexingContext`, which has information
 * about components discovered in the program registered in it.
 *
 * The context must be populated before `generateAnalysis` is called.
 */
export function generateAnalysis(context: IndexingContext): Map<ts.Declaration, IndexedComponent> {
  const analysis = new Map<ts.Declaration, IndexedComponent>();

  context.components.forEach(({declaration, selector, interpolationConfig, template}) => {
    const name = declaration.name.getText();
    const usedComponents = context.getUsedComponents(template);

    analysis.set(declaration, {
      name,
      selector,
      sourceFile: declaration.getSourceFile().fileName,
      content: declaration.getSourceFile().getFullText(),
      template: {
        identifiers: getTemplateIdentifiers(template, {
          preserveWhitespaces: true,
          interpolationConfig,
        }),
        usedComponents,
      },
    });
  });

  return analysis;
}
