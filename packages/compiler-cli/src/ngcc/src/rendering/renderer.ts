/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import MagicString from 'magic-string';
import {Expression, WrappedNodeExpr, WritePropExpr} from '@angular/compiler';
import {AnalyzedClass, AnalyzedFile} from '../analyzer';
import { Decorator } from '../../../ngtsc/host';
import {ImportManager, translateStatement} from '../../../ngtsc/transform/src/translator';


export interface RenderResult {
  file: AnalyzedFile;
  source: FileInfo;
  map: FileInfo;
}

export interface FileInfo {
  path: string;
  contents: string;
}

export abstract class Renderer {
  renderFile(file: AnalyzedFile, targetPath: string): RenderResult {
    const importManager = new ImportManager(false);

    const output = new MagicString(file.sourceFile.text);
    const decoratorsToRemove = new Map<ts.Node, ts.Node[]>();

    file.analyzedClasses.forEach(clazz => {
      const renderedDefinition = renderDefinitions(file.sourceFile, clazz, importManager);
      this.addDefinitions(output, clazz, renderedDefinition);
      this.trackDecorators(clazz.decorators, decoratorsToRemove);
    });

    this.addImports(output, importManager.getAllImports(file.sourceFile.fileName, null));
    this.removeDecorators(output, decoratorsToRemove);

    const mapPath = `${targetPath}.map`;
    const map = output.generateMap({
      source: file.sourceFile.fileName,
      file: mapPath,
      // includeContent: true
    });

    return {
      file,
      source: { path: targetPath, contents: output.toString() },
      map: { path: mapPath, contents: map.toString() }
    };
  }

  abstract addImports(output: MagicString, imports: { name: string, as: string }[]): void;
  abstract addDefinitions(output: MagicString, analyzedClass: AnalyzedClass, definitions: string): void;
  abstract removeDecorators(output: MagicString, decoratorsToRemove: Map<ts.Node, ts.Node[]>): void;

  // Add the decorator nodes that are to be removed to a map
  // So that we can tell if we should remove the entire decorator property
  protected trackDecorators(decorators: Decorator[], decoratorsToRemove: Map<ts.Node, ts.Node[]>) {
    decorators.forEach(dec => {
      const decoratorArray = dec.node.parent!;
      if (!decoratorsToRemove.has(decoratorArray)) {
        decoratorsToRemove.set(decoratorArray, [dec.node]);
      } else {
        decoratorsToRemove.get(decoratorArray)!.push(dec.node);
      }
    });
  }
}


/**
 * Render the definitions as source code for the given class.
 * @param sourceFile The file containing the class to process.
 * @param clazz The class whose definitions are to be rendered.
 * @param compilation The results of analyzing the class - this is used to generate the rendered definitions.
 * @param imports An object that tracks the imports that are needed by the rendered definitions.
 */
function renderDefinitions(sourceFile: ts.SourceFile, analyzedClass: AnalyzedClass, imports: ImportManager): string {
  const printer = ts.createPrinter();
  const name = (analyzedClass.declaration as ts.NamedDeclaration).name!;
  const definitions = analyzedClass.compilation.map(c => c.statements
    .map(statement => translateStatement(statement, imports))
    .concat(translateStatement(createAssignmentStatement(name, c.name, c.initializer), imports))
    .map(statement => printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile))
    .join('\n')
  ).join('\n');
  return definitions;
}

/**
 * Create an Angular AST statement node that contains the assignment of the
 * compiled decorator to be applied to the class.
 * @param analyzedClass The info about the class whose statement we want to create.
 */
function createAssignmentStatement(receiverName: ts.DeclarationName, propName: string, initializer: Expression) {
  const receiver = new WrappedNodeExpr(receiverName);
  return new WritePropExpr(receiver, propName, initializer).toStmt();
}
