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

export class Esm2015Renderer implements Renderer {
  renderFile(file: AnalyzedFile): string {
    const output = new MagicString(file.sourceFile.text);
    const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();
    addImports(output, file);
    file.analyzedClasses.forEach(analyzedClass => {
      addDefinitions(output, analyzedClass);
      trackDecorators(analyzedClass, decoratorsToRemove);
    });
    removeDecorators(output, decoratorsToRemove);
    return output.toString();
  }
}

// Find the position where the new definition should be inserted
function getEndPositionOfClass(analyzedClass: AnalyzedClass) {
  return analyzedClass.clazz.declaration.getEnd();
}

// Add the imports at the top of the file
function addImports(output: MagicString, file: AnalyzedFile) {
  file.imports.forEach(i => {
    output.appendLeft(0, `import * as ${i.as} from '${i.name}';\n`);
  });
}

// Add the definitions to each decorated class
function addDefinitions(output: MagicString, analyzedClass: AnalyzedClass) {
  const insertionPoint = getEndPositionOfClass(analyzedClass);
  output.appendLeft(insertionPoint, '\n' + analyzedClass.renderedDefinition);
}

// Add the decorator nodes that are to be removed to a map
// So that we can tell if we should remove the entire decorator property
function trackDecorators(analyzedClass: AnalyzedClass, decoratorsToRemove: Map<ts.Node, ts.Node[]>) {
  analyzedClass.clazz.decorators.forEach(dec => {
    const decoratorArray = dec.node.parent!;
    if (!decoratorsToRemove.has(decoratorArray)) {
      decoratorsToRemove.set(decoratorArray, [dec.node]);
    } else {
      decoratorsToRemove.get(decoratorArray)!.push(dec.node);
    }
  });
}

// Remove static decorator properties from classes
function removeDecorators(output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>) {
  decoratorsToRemove.forEach((nodesToRemove, containerNode) => {
    const children = containerNode.getChildren().filter(node => !ts.isToken(node));
    if (children.length === nodesToRemove.length) {
      output.remove(containerNode.parent!.getFullStart(), containerNode.parent!.getEnd());
    } else {
      nodesToRemove.forEach(node => {
        output.remove(node.getFullStart(), node.getEnd());
      });
    }
  });
}