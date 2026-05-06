/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceFile} from '@angular/compiler';

import {DeclarationNode} from '../../reflection';

import {IndexedComponent, NodeAdapter} from './api.js';
import {IndexingContext} from './context.js';
import {getTemplateIdentifiers} from './template.js';

/**
 * Generates `IndexedComponent` entries from a `IndexingContext`, which has information
 * about components discovered in the program registered in it.
 *
 * The context must be populated before `generateAnalysis` is called.
 */
export function generateAnalysis<T = DeclarationNode>(
  context: IndexingContext<T>,
  adapter: NodeAdapter<T>,
): Map<T, IndexedComponent<T>> {
  const analysis = new Map<T, IndexedComponent<T>>();

  context.components.forEach(({declaration, selector, boundTemplate, templateMeta}) => {
    const name = adapter.getName(declaration);
    const fileName = adapter.getFileName(declaration);

    const usedComponents = new Set<T>();
    const usedDirs = boundTemplate.getUsedDirectives();
    usedDirs.forEach((dir) => {
      if (dir.isComponent) {
        usedComponents.add(dir.ref.node);
      }
    });

    // Get source files for the component and the template. If the template is inline, its source
    // file is the component's.
    const componentFile = new ParseSourceFile(adapter.getContent(declaration), fileName);
    let templateFile: ParseSourceFile;
    if (templateMeta.isInline) {
      templateFile = componentFile;
    } else {
      templateFile = templateMeta.file;
    }

    const {identifiers, errors} = getTemplateIdentifiers<T>(boundTemplate);
    analysis.set(declaration, {
      name,
      selector,
      file: componentFile,
      template: {
        identifiers,
        usedComponents,
        isInline: templateMeta.isInline,
        file: templateFile,
      },
      errors,
    });
  });

  return analysis;
}
