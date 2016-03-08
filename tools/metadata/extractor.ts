import * as ts from 'typescript';
import {Evaluator} from './evaluator';
import {Symbols} from './symbols';
import * as path from 'path';

const EXT_REGEX = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const NODE_MODULES = '/node_modules/';
const NODE_MODULES_PREFIX = 'node_modules/';

function pathTo(from: string, to: string): string {
  var result = path.relative(path.dirname(from), to);
  if (path.dirname(result) === '.') {
    result = '.' + path.sep + result;
  }
  return result;
}

function moduleNameFromBaseName(moduleFileName: string, baseFileName: string): string {
  // Remove the extension
  moduleFileName = moduleFileName.replace(EXT_REGEX, '');

  // Check for node_modules
  const nodeModulesIndex = moduleFileName.lastIndexOf(NODE_MODULES);
  if (nodeModulesIndex >= 0) {
    return moduleFileName.substr(nodeModulesIndex + NODE_MODULES.length);
  }
  if (moduleFileName.lastIndexOf(NODE_MODULES_PREFIX, NODE_MODULES_PREFIX.length) !== -1) {
    return moduleFileName.substr(NODE_MODULES_PREFIX.length);
  }

  // Construct a simplified path from the file to the module
  return pathTo(baseFileName, moduleFileName);
}

// TODO: Support cross-module folding
export class MetadataExtractor {
  constructor(private service: ts.LanguageService) {}

  /**
   * Returns a JSON.stringify friendly form describing the decorators of the exported classes from
   * the source file that is expected to correspond to a module.
   */
  public getMetadata(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): any {
    const locals = new Symbols();
    const moduleNameOf = (fileName: string) =>
        moduleNameFromBaseName(fileName, sourceFile.fileName);
    const evaluator = new Evaluator(this.service, typeChecker, locals, moduleNameOf);

    function objFromDecorator(decoratorNode: ts.Decorator): any {
      return evaluator.evaluateNode(decoratorNode.expression);
    }

    function classWithDecorators(classDeclaration: ts.ClassDeclaration): any {
      return {
        __symbolic: "class",
        decorators: classDeclaration.decorators.map(decorator => objFromDecorator(decorator))
      };
    }

    let metadata: any;
    const symbols = typeChecker.getSymbolsInScope(sourceFile, ts.SymbolFlags.ExportValue);
    for (var symbol of symbols) {
      for (var declaration of symbol.getDeclarations()) {
        switch (declaration.kind) {
          case ts.SyntaxKind.ClassDeclaration:
            const classDeclaration = <ts.ClassDeclaration>declaration;
            if (classDeclaration.decorators) {
              if (!metadata) metadata = {};
              metadata[classDeclaration.name.text] = classWithDecorators(classDeclaration)
            }
            break;
          case ts.SyntaxKind.VariableDeclaration:
            const variableDeclaration = <ts.VariableDeclaration>declaration;
            if (variableDeclaration.initializer) {
              const value = evaluator.evaluateNode(variableDeclaration.initializer);
              if (value !== undefined) {
                if (evaluator.isFoldable(variableDeclaration.initializer)) {
                  // Record the value for use in other initializers
                  locals.set(symbol, value);
                }
                if (!metadata) metadata = {};
                metadata[evaluator.nameOf(variableDeclaration.name)] =
                    evaluator.evaluateNode(variableDeclaration.initializer);
              }
            }
            break;
        }
      }
    }
    return metadata && {__symbolic: "module", module: moduleNameOf(sourceFile.fileName), metadata};
  }
}
