/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceFile} from '@angular/compiler';
import * as ts from 'typescript';
import {AnnotationKind, IndexedAnnotation} from './api';
import {IndexingContext} from './context';
import {getTemplateIdentifiers} from './template';

/**
 * Generates `IndexedComponent` entries from a `IndexingContext`, which has information
 * about components discovered in the program registered in it.
 *
 * The context must be populated before `generateAnalysis` is called.
 */
export function generateAnalysis(context: IndexingContext): Map<ts.Declaration, IndexedAnnotation> {
  const analysis = new Map<ts.Declaration, IndexedAnnotation>();

  context.registry.forEach(entry => {
    switch (entry.kind) {
      case AnnotationKind.Component:
        const name = entry.declaration.name.getText();

        const usedComponents = new Set<ts.Declaration>();
        const usedDirs = entry.boundTemplate.getUsedDirectives();
        usedDirs.forEach(dir => {
          if (dir.isComponent) {
            usedComponents.add(dir.ref.node);
          }
        });

        // Get source files for the component and the template. If the template is inline, its
        // source file is the component's.
        const componentFile = new ParseSourceFile(
            entry.declaration.getSourceFile().getFullText(),
            entry.declaration.getSourceFile().fileName);
        let templateFile: ParseSourceFile;
        if (entry.templateMeta.isInline) {
          templateFile = componentFile;
        } else {
          templateFile = entry.templateMeta.file;
        }

        analysis.set(entry.declaration, {
          kind: AnnotationKind.Component,
          name,
          selector: entry.selector,
          file: componentFile,
          template: {
            identifiers: getTemplateIdentifiers(entry.boundTemplate),
            usedComponents,
            isInline: entry.templateMeta.isInline,
            file: templateFile,
          },
        });
        break;
    }
  });

  return analysis;
}
