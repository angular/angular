import * as ts from 'typescript';

import {Evaluator, ImportMetadata, ImportSpecifierMetadata, isPrimitive} from './evaluator';
import {ClassMetadata, ConstructorMetadata, ModuleMetadata, MemberMetadata, MetadataError, MetadataMap, MetadataSymbolicExpression, MetadataSymbolicReferenceExpression, MetadataValue, MethodMetadata, isMetadataError, isMetadataSymbolicReferenceExpression, VERSION} from './schema';
import {Symbols} from './symbols';

/**
 * Collect decorator metadata from a TypeScript module.
 */
export class MetadataCollector {
  constructor() {}

  /**
   * Returns a JSON.stringify friendly form describing the decorators of the exported classes from
   * the source file that is expected to correspond to a module.
   */
  public getMetadata(sourceFile: ts.SourceFile): ModuleMetadata {
    const locals = new Symbols(sourceFile);
    const evaluator = new Evaluator(locals);
    let metadata: {[name: string]: MetadataValue | ClassMetadata}|undefined;

    function objFromDecorator(decoratorNode: ts.Decorator): MetadataSymbolicExpression {
      return <MetadataSymbolicExpression>evaluator.evaluateNode(decoratorNode.expression);
    }

    function classMetadataOf(classDeclaration: ts.ClassDeclaration): ClassMetadata {
      let result: ClassMetadata = {__symbolic: 'class'};

      function getDecorators(decorators: ts.Decorator[]): MetadataSymbolicExpression[] {
        if (decorators && decorators.length)
          return decorators.map(decorator => objFromDecorator(decorator));
        return undefined;
      }

      function referenceFrom(node: ts.Node): MetadataSymbolicReferenceExpression|MetadataError {
        const result = evaluator.evaluateNode(node);
        if (isMetadataError(result) || isMetadataSymbolicReferenceExpression(result)) {
          return result;
        } else {
          return {__symbolic: 'error', message: 'Symbol reference expected'};
        }
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
            const method = <ts.MethodDeclaration|ts.ConstructorDeclaration>member;
            const methodDecorators = getDecorators(method.decorators);
            const parameters = method.parameters;
            const parameterDecoratorData: (MetadataSymbolicExpression | MetadataError)[][] = [];
            const parametersData: (MetadataSymbolicReferenceExpression | MetadataError | null)[] =
                [];
            let hasDecoratorData: boolean = false;
            let hasParameterData: boolean = false;
            for (const parameter of parameters) {
              const parameterData = getDecorators(parameter.decorators);
              parameterDecoratorData.push(parameterData);
              hasDecoratorData = hasDecoratorData || !!parameterData;
              if (isConstructor) {
                if (parameter.type) {
                  parametersData.push(referenceFrom(parameter.type));
                } else {
                  parametersData.push(null);
                }
                hasParameterData = true;
              }
            }
            const data: MethodMetadata = {__symbolic: isConstructor ? 'constructor' : 'method'};
            const name = isConstructor ? '__ctor__' : evaluator.nameOf(member.name);
            if (methodDecorators) {
              data.decorators = methodDecorators;
            }
            if (hasDecoratorData) {
              data.parameterDecorators = parameterDecoratorData;
            }
            if (hasParameterData) {
              (<ConstructorMetadata>data).parameters = parametersData;
            }
            if (!isMetadataError(name)) {
              recordMember(name, data);
            }
            break;
          case ts.SyntaxKind.PropertyDeclaration:
          case ts.SyntaxKind.GetAccessor:
          case ts.SyntaxKind.SetAccessor:
            const property = <ts.PropertyDeclaration>member;
            const propertyDecorators = getDecorators(property.decorators);
            if (propertyDecorators) {
              let name = evaluator.nameOf(property.name);
              if (!isMetadataError(name)) {
                recordMember(name, {__symbolic: 'property', decorators: propertyDecorators});
              }
            }
            break;
        }
      }
      if (members) {
        result.members = members;
      }

      return result.decorators || members ? result : undefined;
    }

    // Predeclare classes
    ts.forEachChild(sourceFile, node => {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclaration = <ts.ClassDeclaration>node;
          const className = classDeclaration.name.text;
          if (node.flags & ts.NodeFlags.Export) {
            locals.define(className, {__symbolic: 'reference', name: className});
          } else {
            locals.define(
                className,
                {__symbolic: 'error', message: `Reference to non-exported class ${className}`});
          }
          break;
      }
    });
    ts.forEachChild(sourceFile, node => {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclaration = <ts.ClassDeclaration>node;
          const className = classDeclaration.name.text;
          if (node.flags & ts.NodeFlags.Export) {
            if (classDeclaration.decorators) {
              if (!metadata) metadata = {};
              metadata[className] = classMetadataOf(classDeclaration);
            }
          }
          // Otherwise don't record metadata for the class.
          break;
        case ts.SyntaxKind.VariableStatement:
          const variableStatement = <ts.VariableStatement>node;
          for (let variableDeclaration of variableStatement.declarationList.declarations) {
            if (variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
              let nameNode = <ts.Identifier>variableDeclaration.name;
              let varValue: MetadataValue;
              if (variableDeclaration.initializer) {
                varValue = evaluator.evaluateNode(variableDeclaration.initializer);
              } else {
                varValue = {
                  __symbolic: 'error',
                  message: 'Only intialized variables and constants can be referenced statically'
                };
              }
              if (variableStatement.flags & ts.NodeFlags.Export ||
                  variableDeclaration.flags & ts.NodeFlags.Export) {
                if (!metadata) metadata = {};
                metadata[nameNode.text] = varValue;
              }
              if (isPrimitive(varValue)) {
                locals.define(nameNode.text, varValue);
              }
            } else {
              // Destructuring (or binding) declarations are not supported,
              // var {<identifier>[, <identifer>]+} = <expression>;
              //   or
              // var [<identifier>[, <identifier}+] = <expression>;
              // are not supported.
              let varValue = {
                __symbolc: 'error',
                message: 'Destructuring declarations cannot be referenced statically'
              };
              const report = (nameNode: ts.Node) => {
                switch (nameNode.kind) {
                  case ts.SyntaxKind.Identifier:
                    const name = <ts.Identifier>nameNode;
                    locals.define(name.text, varValue);
                    if (node.flags & ts.NodeFlags.Export) {
                      if (!metadata) metadata = {};
                      metadata[name.text] = varValue;
                    }
                    break;
                  case ts.SyntaxKind.BindingElement:
                    const bindingElement = <ts.BindingElement>nameNode;
                    report(bindingElement.name);
                    break;
                  case ts.SyntaxKind.ObjectBindingPattern:
                  case ts.SyntaxKind.ArrayBindingPattern:
                    const bindings = <ts.BindingPattern>nameNode;
                    bindings.elements.forEach(report);
                    break;
                }
              };
              report(variableDeclaration.name);
            }
          }
          break;
      }
    });

    return metadata && {__symbolic: 'module', version: VERSION, metadata};
  }
}
