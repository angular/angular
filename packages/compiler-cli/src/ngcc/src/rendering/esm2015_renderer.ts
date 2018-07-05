/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import MagicString from 'magic-string';
import {AnalyzedClass, AnalyzedFile} from '../analyzer';
import {Renderer} from './renderer';

export interface RenderedFile {
  file: AnalyzedFile;
  content: string;
  map: string;
}

export class Esm2015Renderer extends Renderer {
  // Add the imports at the top of the file
  addImports(output: MagicString, imports: { name: string; as: string; }[]): void {
    imports.forEach(i => {
      output.appendLeft(0, `import * as ${i.as} from '${i.name}';\n`);
    });
  }

  // Add the definitions to each decorated class
  addDefinitions(output: MagicString, analyzedClass: AnalyzedClass, definitions: string) {
    const insertionPoint = getEndPositionOfClass(analyzedClass);
    output.appendLeft(insertionPoint, '\n' + definitions);
  }

// Remove static decorator properties from classes
removeDecorators(output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>): void {
    decoratorsToRemove.forEach((nodesToRemove, containerNode) => {
      const children = containerNode.getChildren().filter(node => !ts.isToken(node));
      if (children.length === nodesToRemove.length) {
        output.remove(containerNode.parent!.getFullStart(), containerNode.parent!.getEnd() + 1 /* include semi-colon */);
      } else {
        nodesToRemove.forEach(node => {
          output.remove(node.getFullStart(), node.getEnd());
        });
      }
    });
    }

}

// Find the position where the new definition should be inserted
function getEndPositionOfClass(analyzedClass: AnalyzedClass) {
  return analyzedClass.clazz.declaration.getEnd();
}
