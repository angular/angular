/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ParseSourceFile} from '@angular/compiler';
import {getTemplateIdentifiers} from './template';
/**
 * Generates `IndexedComponent` entries from a `IndexingContext`, which has information
 * about components discovered in the program registered in it.
 *
 * The context must be populated before `generateAnalysis` is called.
 */
export function generateAnalysis(context) {
  const analysis = new Map();
  context.components.forEach(({declaration, selector, boundTemplate, templateMeta}) => {
    const name = declaration.name.getText();
    const usedComponents = new Set();
    const usedDirs = boundTemplate.getUsedDirectives();
    usedDirs.forEach((dir) => {
      if (dir.isComponent) {
        usedComponents.add(dir.ref.node);
      }
    });
    // Get source files for the component and the template. If the template is inline, its source
    // file is the component's.
    const componentFile = new ParseSourceFile(
      declaration.getSourceFile().getFullText(),
      declaration.getSourceFile().fileName,
    );
    let templateFile;
    if (templateMeta.isInline) {
      templateFile = componentFile;
    } else {
      templateFile = templateMeta.file;
    }
    const {identifiers, errors} = getTemplateIdentifiers(boundTemplate);
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
//# sourceMappingURL=transform.js.map
