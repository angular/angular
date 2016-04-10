import * as ts from 'typescript';
import {Evaluator} from './evaluator';
import {Symbols} from './symbols';
import {
  ClassMetadata,
  ConstructorMetadata,
  ModuleMetadata,
  MemberMetadata,
  MetadataMap,
  MetadataSymbolicExpression,
  MetadataSymbolicReferenceExpression,
  MetadataValue,
  MethodMetadata
} from './schema';

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

/**
 * Collect decorator metadata from a TypeScript module.
 */
export class MetadataCollector {
  constructor() {}

  /**
   * Returns a JSON.stringify friendly form describing the decorators of the exported classes from
   * the source file that is expected to correspond to a module.
   */
  public getMetadata(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): ModuleMetadata {
    const locals = new Symbols();
    const moduleNameOf = (fileName: string) =>
        moduleNameFromBaseName(fileName, sourceFile.fileName);
    const evaluator = new Evaluator(typeChecker, locals, moduleNameOf);

    function objFromDecorator(decoratorNode: ts.Decorator): MetadataSymbolicExpression {
      return <MetadataSymbolicExpression>evaluator.evaluateNode(decoratorNode.expression);
    }

    function referenceFromType(type: ts.Type): MetadataSymbolicReferenceExpression {
      if (type) {
        let symbol = type.getSymbol();
        if (symbol) {
          if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = typeChecker.getAliasedSymbol(symbol);
          }
          if (symbol.declarations.length) {
            const declaration = symbol.declarations[0];
            const sourceFile = declaration.getSourceFile();
            return {
              __symbolic: "reference",
              module: moduleNameOf(sourceFile.fileName),
              name: symbol.name
            };
          }
        }
      }
    }

    function classMetadataOf(classDeclaration: ts.ClassDeclaration): ClassMetadata {
      let result: ClassMetadata =
      { __symbolic: "class" }

      function getDecorators(decorators: ts.Decorator[]):
          MetadataSymbolicExpression[] {
            if (decorators && decorators.length)
              return decorators.map(decorator => objFromDecorator(decorator));
            return undefined;
          }

      // Add class decorators
      if (classDeclaration.decorators) {
        result.decorators = getDecorators(classDeclaration.decorators);
      }

      // member decorators
      let members: MetadataMap = null;
      function recordMember(name: string, metadata: MemberMetadata) {
        if (!members) members = {};
        let data = members.hasOwnProperty(name) ? members[name] : [];
        data.push(metadata);
        members[name] = data;
      }
      for (const member of classDeclaration.members) {
        let isConstructor = false;
        switch (member.kind) {
          case ts.SyntaxKind.Constructor:
            isConstructor = true;
          // fallthrough
          case ts.SyntaxKind.MethodDeclaration:
            const method = <ts.MethodDeclaration | ts.ConstructorDeclaration>member;
            const methodDecorators = getDecorators(method.decorators);
            const parameters = method.parameters;
            const parameterDecoratorData: MetadataSymbolicExpression[][] = [];
            const parametersData: MetadataSymbolicReferenceExpression[] = [];
            let hasDecoratorData: boolean = false;
            let hasParameterData: boolean = false;
            for (const parameter of parameters) {
              const parameterData = getDecorators(parameter.decorators);
              parameterDecoratorData.push(parameterData);
              hasDecoratorData = hasDecoratorData || !!parameterData;
              if (isConstructor) {
                const parameterType = typeChecker.getTypeAtLocation(parameter);
                parametersData.push(referenceFromType(parameterType) || null);
                hasParameterData = true;
              }
            }
            if (methodDecorators || hasDecoratorData || hasParameterData) {
              const data: MethodMetadata = {__symbolic: isConstructor ? "constructor" : "method"};
              const name = isConstructor ? "__ctor__" : evaluator.nameOf(member.name);
              if (methodDecorators) {
                data.decorators = methodDecorators;
              }
              if (hasDecoratorData) {
                data.parameterDecorators = parameterDecoratorData;
              }
              if (hasParameterData) {
                (<ConstructorMetadata>data).parameters = parametersData;
              }
              recordMember(name, data);
            }
            break;
          case ts.SyntaxKind.PropertyDeclaration:
          case ts.SyntaxKind.GetAccessor:
          case ts.SyntaxKind.SetAccessor:
            const property = <ts.PropertyDeclaration>member;
            const propertyDecorators = getDecorators(property.decorators);
            if (propertyDecorators) {
              recordMember(evaluator.nameOf(property.name),
                           {__symbolic: 'property', decorators: propertyDecorators});
            }
            break;
        }
      }
      if (members) {
        result.members = members;
      }

      return result.decorators || members ? result : undefined;
    }

    let metadata: {[name: string]: (ClassMetadata | MetadataValue)};
    const symbols = typeChecker.getSymbolsInScope(sourceFile, ts.SymbolFlags.ExportValue);
    for (var symbol of symbols) {
      for (var declaration of symbol.getDeclarations()) {
        switch (declaration.kind) {
          case ts.SyntaxKind.ClassDeclaration:
            const classDeclaration = <ts.ClassDeclaration>declaration;
            if (classDeclaration.decorators) {
              if (!metadata) metadata = {};
              metadata[classDeclaration.name.text] = classMetadataOf(classDeclaration)
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
