/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceFile} from '@angular/compiler';
import {DeclarationNode} from '../../reflection';
import {IndexedComponent} from './api';
import {IndexingContext} from './context';
import {getTemplateIdentifiers} from './template';

/**
 * Generates `IndexedComponent` entries from a `IndexingContext`, which has information
 * about components discovered in the program registered in it.
 *
 * The context must be populated before `generateAnalysis` is called.
 */
export function generateAnalysis(context: IndexingContext): Map<DeclarationNode, IndexedComponent> {
  const analysis = new Map<DeclarationNode, IndexedComponent>();

  context.components.forEach(({declaration, selector, boundTemplate, templateMeta}) => {
    const name = declaration.name.getText();

    const usedComponents = new Set<DeclarationNode>();
    const usedDirs = boundTemplate.getUsedDirectives();
    usedDirs.forEach(dir => {
      if (dir.isComponent) {
        usedComponents.add(dir.ref.node);
      }
    });

    // Get source files for the component and the template. If the template is inline, its source
    // file is the component's.
    const componentFile = new ParseSourceFile(
        declaration.getSourceFile().getFullText(), declaration.getSourceFile().fileName);
    let templateFile: ParseSourceFile;
    if (templateMeta.isInline) {
      templateFile = componentFile;
    } else {
      templateFile = templateMeta.file;
    }

    analysis.set(declaration, {
      name,
      selector,
      file: componentFile,
      template: {
        identifiers: getTemplateIdentifiers(boundTemplate),
        usedComponents,
        isInline: templateMeta.isInline,
        file: templateFile,
      },
    });
  });

  return analysis;
}
