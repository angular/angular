/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {errorSymbol, Evaluator, recordMapEntry} from './evaluator';
import {ClassMetadata, ConstructorMetadata, FunctionMetadata, InterfaceMetadata, isClassMetadata, isConstructorMetadata, isFunctionMetadata, isMetadataError, isMetadataGlobalReferenceExpression, isMetadataImportDefaultReference, isMetadataImportedSymbolReferenceExpression, isMetadataSymbolicExpression, isMetadataSymbolicReferenceExpression, isMetadataSymbolicSelectExpression, isMethodMetadata, MemberMetadata, METADATA_VERSION, MetadataEntry, MetadataError, MetadataMap, MetadataSymbolicBinaryExpression, MetadataSymbolicCallExpression, MetadataSymbolicExpression, MetadataSymbolicIfExpression, MetadataSymbolicIndexExpression, MetadataSymbolicPrefixExpression, MetadataSymbolicReferenceExpression, MetadataSymbolicSelectExpression, MetadataSymbolicSpreadExpression, MetadataValue, MethodMetadata, ModuleExportMetadata, ModuleMetadata} from './schema';
import {Symbols} from './symbols';

const isStatic = (node: ts.Declaration) =>
    ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Static;

/**
 * A set of collector options to use when collecting metadata.
 */
export interface CollectorOptions {
  /**
   * Version of the metadata to collect.
   */
  version?: number;

  /**
   * Collect a hidden field "$quoted$" in objects literals that record when the key was quoted in
   * the source.
   */
  quotedNames?: boolean;

  /**
   * Do not simplify invalid expressions.
   */
  verboseInvalidExpression?: boolean;

  /**
   * An expression substitution callback.
   */
  substituteExpression?: (value: MetadataValue, node: ts.Node) => MetadataValue;
}

/**
 * Collect decorator metadata from a TypeScript module.
 */
export class MetadataCollector {
  constructor(private options: CollectorOptions = {}) {}

  /**
   * Returns a JSON.stringify friendly form describing the decorators of the exported classes from
   * the source file that is expected to correspond to a module.
   */
  public getMetadata(
      sourceFile: ts.SourceFile, strict: boolean = false,
      substituteExpression?: (value: MetadataValue, node: ts.Node) => MetadataValue): ModuleMetadata
      |undefined {
    const locals = new Symbols(sourceFile);
    const nodeMap =
        new Map<MetadataValue|ClassMetadata|InterfaceMetadata|FunctionMetadata, ts.Node>();
    const composedSubstituter = substituteExpression && this.options.substituteExpression ?
        (value: MetadataValue, node: ts.Node) =>
            this.options.substituteExpression!(substituteExpression(value, node), node) :
        substituteExpression;
    const evaluatorOptions = substituteExpression ?
        {...this.options, substituteExpression: composedSubstituter} :
        this.options;
    let metadata: {[name: string]: MetadataValue|ClassMetadata|FunctionMetadata}|undefined;
    const evaluator = new Evaluator(locals, nodeMap, evaluatorOptions, (name, value) => {
      if (!metadata) metadata = {};
      metadata[name] = value;
    });
    let exports: ModuleExportMetadata[]|undefined = undefined;

    function objFromDecorator(decoratorNode: ts.Decorator): MetadataSymbolicExpression {
      return <MetadataSymbolicExpression>evaluator.evaluateNode(decoratorNode.expression);
    }

    function recordEntry<T extends MetadataEntry>(entry: T, node: ts.Node): T {
      if (composedSubstituter) {
        entry = composedSubstituter(entry as MetadataValue, node) as T;
      }
      return recordMapEntry(entry, node, nodeMap, sourceFile);
    }

    function errorSym(
        message: string, node?: ts.Node, context?: {[name: string]: string}): MetadataError {
      return errorSymbol(message, node, context, sourceFile);
    }

    function maybeGetSimpleFunction(functionDeclaration: ts.FunctionDeclaration|
                                    ts.MethodDeclaration): {func: FunctionMetadata, name: string}|
        undefined {
      if (functionDeclaration.name && functionDeclaration.name.kind == ts.SyntaxKind.Identifier) {
        const nameNode = <ts.Identifier>functionDeclaration.name;
        const functionName = nameNode.text;
        const functionBody = functionDeclaration.body;
        if (functionBody && functionBody.statements.length == 1) {
          const statement = functionBody.statements[0];
          if (statement.kind === ts.SyntaxKind.ReturnStatement) {
            const returnStatement = <ts.ReturnStatement>statement;
            if (returnStatement.expression) {
              const func: FunctionMetadata = {
                __symbolic: 'function',
                parameters: namesOf(functionDeclaration.parameters),
                value: evaluator.evaluateNode(returnStatement.expression)
              };
              if (functionDeclaration.parameters.some(p => p.initializer != null)) {
                func.defaults = functionDeclaration.parameters.map(
                    p => p.initializer && evaluator.evaluateNode(p.initializer));
              }
              return recordEntry({func, name: functionName}, functionDeclaration);
            }
          }
        }
      }
    }

    function classMetadataOf(classDeclaration: ts.ClassDeclaration): ClassMetadata {
      const result: ClassMetadata = {__symbolic: 'class'};

      function getDecorators(decorators: ReadonlyArray<ts.Decorator>|
                             undefined): MetadataSymbolicExpression[]|undefined {
        if (decorators && decorators.length)
          return decorators.map(decorator => objFromDecorator(decorator));
        return undefined;
      }

      function referenceFrom(node: ts.Node): MetadataSymbolicReferenceExpression|MetadataError|
          MetadataSymbolicSelectExpression {
        const result = evaluator.evaluateNode(node);
        if (isMetadataError(result) || isMetadataSymbolicReferenceExpression(result) ||
            isMetadataSymbolicSelectExpression(result)) {
          return result;
        } else {
          return errorSym('Symbol reference expected', node);
        }
      }

      // Add class parents
      if (classDeclaration.heritageClauses) {
        classDeclaration.heritageClauses.forEach((hc) => {
          if (hc.token === ts.SyntaxKind.ExtendsKeyword && hc.types) {
            hc.types.forEach(type => result.extends = referenceFrom(type.expression));
          }
        });
      }

      // Add arity if the type is generic
      const typeParameters = classDeclaration.typeParameters;
      if (typeParameters && typeParameters.length) {
        result.arity = typeParameters.length;
      }

      // Add class decorators
      if (classDeclaration.decorators) {
        result.decorators = getDecorators(classDeclaration.decorators);
      }

      // member decorators
      let members: MetadataMap|null = null;
      function recordMember(name: string, metadata: MemberMetadata) {
        if (!members) members = {};
        const data = members.hasOwnProperty(name) ? members[name] : [];
        data.push(metadata);
        members[name] = data;
      }

      // static member
      let statics: {[name: string]: MetadataValue|FunctionMetadata}|null = null;
      function recordStaticMember(name: string, value: MetadataValue|FunctionMetadata) {
        if (!statics) statics = {};
        statics[name] = value;
      }

      for (const member of classDeclaration.members) {
        let isConstructor = false;
        switch (member.kind) {
          case ts.SyntaxKind.Constructor:
          case ts.SyntaxKind.MethodDeclaration:
            isConstructor = member.kind === ts.SyntaxKind.Constructor;
            const method = <ts.MethodDeclaration|ts.ConstructorDeclaration>member;
            if (isStatic(method)) {
              const maybeFunc = maybeGetSimpleFunction(<ts.MethodDeclaration>method);
              if (maybeFunc) {
                recordStaticMember(maybeFunc.name, maybeFunc.func);
              }
              continue;
            }
            const methodDecorators = getDecorators(method.decorators);
            const parameters = method.parameters;
            const parameterDecoratorData: ((MetadataSymbolicExpression | MetadataError)[]|
                                           undefined)[] = [];
            const parametersData: (MetadataSymbolicReferenceExpression|MetadataError|
                                   MetadataSymbolicSelectExpression|null)[] = [];
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
            if (isStatic(property)) {
              const name = evaluator.nameOf(property.name);
              if (!isMetadataError(name) && !shouldIgnoreStaticMember(name)) {
                if (property.initializer) {
                  const value = evaluator.evaluateNode(property.initializer);
                  recordStaticMember(name, value);
                } else {
                  recordStaticMember(name, errorSym('Variable not initialized', property.name));
                }
              }
            }
            const propertyDecorators = getDecorators(property.decorators);
            if (propertyDecorators) {
              const name = evaluator.nameOf(property.name);
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
      if (statics) {
        result.statics = statics;
      }

      return recordEntry(result, classDeclaration);
    }

    // Collect all exported symbols from an exports clause.
    const exportMap = new Map<string, string>();
    ts.forEachChild(sourceFile, node => {
      switch (node.kind) {
        case ts.SyntaxKind.ExportDeclaration:
          const exportDeclaration = <ts.ExportDeclaration>node;
          const {moduleSpecifier, exportClause} = exportDeclaration;

          if (!moduleSpecifier && exportClause && ts.isNamedExports(exportClause)) {
            // If there is a module specifier there is also an exportClause
            exportClause.elements.forEach(spec => {
              const exportedAs = spec.name.text;
              const name = (spec.propertyName || spec.name).text;
              exportMap.set(name, exportedAs);
            });
          }
      }
    });

    const isExport = (node: ts.Node) => sourceFile.isDeclarationFile ||
        ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export;
    const isExportedIdentifier = (identifier?: ts.Identifier) =>
        identifier && exportMap.has(identifier.text);
    const isExported = (node: ts.FunctionDeclaration|ts.ClassDeclaration|ts.TypeAliasDeclaration|
                        ts.InterfaceDeclaration|ts.EnumDeclaration) =>
        isExport(node) || isExportedIdentifier(node.name);
    const exportedIdentifierName = (identifier?: ts.Identifier) =>
        identifier && (exportMap.get(identifier.text) || identifier.text);
    const exportedName = (node: ts.FunctionDeclaration|ts.ClassDeclaration|
                          ts.InterfaceDeclaration|ts.TypeAliasDeclaration|ts.EnumDeclaration) =>
        exportedIdentifierName(node.name);


    // Pre-declare classes and functions
    ts.forEachChild(sourceFile, node => {
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclaration = <ts.ClassDeclaration>node;
          if (classDeclaration.name) {
            const className = classDeclaration.name.text;
            if (isExported(classDeclaration)) {
              locals.define(
                  className, {__symbolic: 'reference', name: exportedName(classDeclaration)});
            } else {
              locals.define(
                  className, errorSym('Reference to non-exported class', node, {className}));
            }
          }
          break;

        case ts.SyntaxKind.InterfaceDeclaration:
          const interfaceDeclaration = <ts.InterfaceDeclaration>node;
          if (interfaceDeclaration.name) {
            const interfaceName = interfaceDeclaration.name.text;
            // All references to interfaces should be converted to references to `any`.
            locals.define(interfaceName, {__symbolic: 'reference', name: 'any'});
          }
          break;

        case ts.SyntaxKind.FunctionDeclaration:
          const functionDeclaration = <ts.FunctionDeclaration>node;
          if (!isExported(functionDeclaration)) {
            // Report references to this function as an error.
            const nameNode = functionDeclaration.name;
            if (nameNode && nameNode.text) {
              locals.define(
                  nameNode.text,
                  errorSym(
                      'Reference to a non-exported function', nameNode, {name: nameNode.text}));
            }
          }
          break;
      }
    });

    ts.forEachChild(sourceFile, node => {
      switch (node.kind) {
        case ts.SyntaxKind.ExportDeclaration:
          // Record export declarations
          const exportDeclaration = <ts.ExportDeclaration>node;
          const {moduleSpecifier, exportClause} = exportDeclaration;

          if (!moduleSpecifier) {
            // no module specifier -> export {propName as name};
            if (exportClause && ts.isNamedExports(exportClause)) {
              exportClause.elements.forEach(spec => {
                const name = spec.name.text;
                // If the symbol was not already exported, export a reference since it is a
                // reference to an import
                if (!metadata || !metadata[name]) {
                  const propNode = spec.propertyName || spec.name;
                  const value: MetadataValue = evaluator.evaluateNode(propNode);
                  if (!metadata) metadata = {};
                  metadata[name] = recordEntry(value, node);
                }
              });
            }
          }

          if (moduleSpecifier && moduleSpecifier.kind == ts.SyntaxKind.StringLiteral) {
            // Ignore exports that don't have string literals as exports.
            // This is allowed by the syntax but will be flagged as an error by the type checker.
            const from = (<ts.StringLiteral>moduleSpecifier).text;
            const moduleExport: ModuleExportMetadata = {from};
            if (exportClause && ts.isNamedExports(exportClause)) {
              moduleExport.export = exportClause.elements.map(
                  spec => spec.propertyName ? {name: spec.propertyName.text, as: spec.name.text} :
                                              spec.name.text);
            }
            if (!exports) exports = [];
            exports.push(moduleExport);
          }
          break;
        case ts.SyntaxKind.ClassDeclaration:
          const classDeclaration = <ts.ClassDeclaration>node;
          if (classDeclaration.name) {
            if (isExported(classDeclaration)) {
              const name = exportedName(classDeclaration);
              if (name) {
                if (!metadata) metadata = {};
                metadata[name] = classMetadataOf(classDeclaration);
              }
            }
          }
          // Otherwise don't record metadata for the class.
          break;

        case ts.SyntaxKind.TypeAliasDeclaration:
          const typeDeclaration = <ts.TypeAliasDeclaration>node;
          if (typeDeclaration.name && isExported(typeDeclaration)) {
            const name = exportedName(typeDeclaration);
            if (name) {
              if (!metadata) metadata = {};
              metadata[name] = {__symbolic: 'interface'};
            }
          }
          break;

        case ts.SyntaxKind.InterfaceDeclaration:
          const interfaceDeclaration = <ts.InterfaceDeclaration>node;
          if (interfaceDeclaration.name && isExported(interfaceDeclaration)) {
            const name = exportedName(interfaceDeclaration);
            if (name) {
              if (!metadata) metadata = {};
              metadata[name] = {__symbolic: 'interface'};
            }
          }
          break;

        case ts.SyntaxKind.FunctionDeclaration:
          // Record functions that return a single value. Record the parameter
          // names substitution will be performed by the StaticReflector.
          const functionDeclaration = <ts.FunctionDeclaration>node;
          if (isExported(functionDeclaration) && functionDeclaration.name) {
            const name = exportedName(functionDeclaration);
            const maybeFunc = maybeGetSimpleFunction(functionDeclaration);
            if (name) {
              if (!metadata) metadata = {};
              // TODO(alxhub): The literal here is not valid FunctionMetadata.
              metadata[name] =
                  maybeFunc ? recordEntry(maybeFunc.func, node) : ({__symbolic: 'function'} as any);
            }
          }
          break;

        case ts.SyntaxKind.EnumDeclaration:
          const enumDeclaration = <ts.EnumDeclaration>node;
          if (isExported(enumDeclaration)) {
            const enumValueHolder: {[name: string]: MetadataValue} = {};
            const enumName = exportedName(enumDeclaration);
            let nextDefaultValue: MetadataValue = 0;
            let writtenMembers = 0;
            for (const member of enumDeclaration.members) {
              let enumValue: MetadataValue;
              if (!member.initializer) {
                enumValue = nextDefaultValue;
              } else {
                enumValue = evaluator.evaluateNode(member.initializer);
              }
              let name: string|undefined = undefined;
              if (member.name.kind == ts.SyntaxKind.Identifier) {
                const identifier = <ts.Identifier>member.name;
                name = identifier.text;
                enumValueHolder[name] = enumValue;
                writtenMembers++;
              }
              if (typeof enumValue === 'number') {
                nextDefaultValue = enumValue + 1;
              } else if (name) {
                // TODO(alxhub): 'left' here has a name propery which is not valid for
                // MetadataSymbolicSelectExpression.
                nextDefaultValue = {
                  __symbolic: 'binary',
                  operator: '+',
                  left: {
                    __symbolic: 'select',
                    expression: recordEntry({__symbolic: 'reference', name: enumName}, node),
                    name
                  },
                } as any;
              } else {
                nextDefaultValue =
                    recordEntry(errorSym('Unsupported enum member name', member.name), node);
              }
            }
            if (writtenMembers) {
              if (enumName) {
                if (!metadata) metadata = {};
                metadata[enumName] = recordEntry(enumValueHolder, node);
              }
            }
          }
          break;

        case ts.SyntaxKind.VariableStatement:
          const variableStatement = <ts.VariableStatement>node;
          for (const variableDeclaration of variableStatement.declarationList.declarations) {
            if (variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
              const nameNode = <ts.Identifier>variableDeclaration.name;
              let varValue: MetadataValue;
              if (variableDeclaration.initializer) {
                varValue = evaluator.evaluateNode(variableDeclaration.initializer);
              } else {
                varValue = recordEntry(errorSym('Variable not initialized', nameNode), nameNode);
              }
              let exported = false;
              if (isExport(variableStatement) || isExport(variableDeclaration) ||
                  isExportedIdentifier(nameNode)) {
                const name = exportedIdentifierName(nameNode);
                if (name) {
                  if (!metadata) metadata = {};
                  metadata[name] = recordEntry(varValue, node);
                }
                exported = true;
              }
              if (typeof varValue == 'string' || typeof varValue == 'number' ||
                  typeof varValue == 'boolean') {
                locals.define(nameNode.text, varValue);
                if (exported) {
                  locals.defineReference(
                      nameNode.text, {__symbolic: 'reference', name: nameNode.text});
                }
              } else if (!exported) {
                if (varValue && !isMetadataError(varValue)) {
                  locals.define(nameNode.text, recordEntry(varValue, node));
                } else {
                  locals.define(
                      nameNode.text,
                      recordEntry(
                          errorSym('Reference to a local symbol', nameNode, {name: nameNode.text}),
                          node));
                }
              }
            } else {
              // Destructuring (or binding) declarations are not supported,
              // var {<identifier>[, <identifier>]+} = <expression>;
              //   or
              // var [<identifier>[, <identifier}+] = <expression>;
              // are not supported.
              const report: (nameNode: ts.Node) => void = (nameNode: ts.Node) => {
                switch (nameNode.kind) {
                  case ts.SyntaxKind.Identifier:
                    const name = <ts.Identifier>nameNode;
                    const varValue = errorSym('Destructuring not supported', name);
                    locals.define(name.text, varValue);
                    if (isExport(node)) {
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
                    (bindings as any).elements.forEach(report);
                    break;
                }
              };
              report(variableDeclaration.name);
            }
          }
          break;
      }
    });

    if (metadata || exports) {
      if (!metadata)
        metadata = {};
      else if (strict) {
        validateMetadata(sourceFile, nodeMap, metadata);
      }
      const result: ModuleMetadata = {
        __symbolic: 'module',
        version: this.options.version || METADATA_VERSION,
        metadata
      };
      if (sourceFile.moduleName) result.importAs = sourceFile.moduleName;
      if (exports) result.exports = exports;
      return result;
    }
  }
}

// This will throw if the metadata entry given contains an error node.
function validateMetadata(
    sourceFile: ts.SourceFile, nodeMap: Map<MetadataEntry, ts.Node>,
    metadata: {[name: string]: MetadataEntry}) {
  let locals: Set<string> = new Set(['Array', 'Object', 'Set', 'Map', 'string', 'number', 'any']);

  function validateExpression(expression: MetadataValue|MetadataSymbolicExpression|MetadataError) {
    if (!expression) {
      return;
    } else if (Array.isArray(expression)) {
      expression.forEach(validateExpression);
    } else if (typeof expression === 'object' && !expression.hasOwnProperty('__symbolic')) {
      Object.getOwnPropertyNames(expression).forEach(v => validateExpression((<any>expression)[v]));
    } else if (isMetadataError(expression)) {
      reportError(expression);
    } else if (isMetadataGlobalReferenceExpression(expression)) {
      if (!locals.has(expression.name)) {
        const reference = <MetadataValue>metadata[expression.name];
        if (reference) {
          validateExpression(reference);
        }
      }
    } else if (isFunctionMetadata(expression)) {
      validateFunction(<any>expression);
    } else if (isMetadataSymbolicExpression(expression)) {
      switch (expression.__symbolic) {
        case 'binary':
          const binaryExpression = <MetadataSymbolicBinaryExpression>expression;
          validateExpression(binaryExpression.left);
          validateExpression(binaryExpression.right);
          break;
        case 'call':
        case 'new':
          const callExpression = <MetadataSymbolicCallExpression>expression;
          validateExpression(callExpression.expression);
          if (callExpression.arguments) callExpression.arguments.forEach(validateExpression);
          break;
        case 'index':
          const indexExpression = <MetadataSymbolicIndexExpression>expression;
          validateExpression(indexExpression.expression);
          validateExpression(indexExpression.index);
          break;
        case 'pre':
          const prefixExpression = <MetadataSymbolicPrefixExpression>expression;
          validateExpression(prefixExpression.operand);
          break;
        case 'select':
          const selectExpression = <MetadataSymbolicSelectExpression>expression;
          validateExpression(selectExpression.expression);
          break;
        case 'spread':
          const spreadExpression = <MetadataSymbolicSpreadExpression>expression;
          validateExpression(spreadExpression.expression);
          break;
        case 'if':
          const ifExpression = <MetadataSymbolicIfExpression>expression;
          validateExpression(ifExpression.condition);
          validateExpression(ifExpression.elseExpression);
          validateExpression(ifExpression.thenExpression);
          break;
      }
    }
  }

  function validateMember(classData: ClassMetadata, member: MemberMetadata) {
    if (member.decorators) {
      member.decorators.forEach(validateExpression);
    }
    if (isMethodMetadata(member) && member.parameterDecorators) {
      member.parameterDecorators.forEach(validateExpression);
    }
    // Only validate parameters of classes for which we know that are used with our DI
    if (classData.decorators && isConstructorMetadata(member) && member.parameters) {
      member.parameters.forEach(validateExpression);
    }
  }

  function validateClass(classData: ClassMetadata) {
    if (classData.decorators) {
      classData.decorators.forEach(validateExpression);
    }
    if (classData.members) {
      Object.getOwnPropertyNames(classData.members)
          .forEach(name => classData.members![name].forEach((m) => validateMember(classData, m)));
    }
    if (classData.statics) {
      Object.getOwnPropertyNames(classData.statics).forEach(name => {
        const staticMember = classData.statics![name];
        if (isFunctionMetadata(staticMember)) {
          validateExpression(staticMember.value);
        } else {
          validateExpression(staticMember);
        }
      });
    }
  }

  function validateFunction(functionDeclaration: FunctionMetadata) {
    if (functionDeclaration.value) {
      const oldLocals = locals;
      if (functionDeclaration.parameters) {
        locals = new Set(oldLocals.values());
        if (functionDeclaration.parameters)
          functionDeclaration.parameters.forEach(n => locals.add(n));
      }
      validateExpression(functionDeclaration.value);
      locals = oldLocals;
    }
  }

  function shouldReportNode(node: ts.Node|undefined) {
    if (node) {
      const nodeStart = node.getStart();
      return !(
          node.pos != nodeStart &&
          sourceFile.text.substring(node.pos, nodeStart).indexOf('@dynamic') >= 0);
    }
    return true;
  }

  function reportError(error: MetadataError) {
    const node = nodeMap.get(error);
    if (shouldReportNode(node)) {
      const lineInfo = error.line != undefined ? error.character != undefined ?
                                                 `:${error.line + 1}:${error.character + 1}` :
                                                 `:${error.line + 1}` :
                                                 '';
      throw new Error(`${sourceFile.fileName}${
          lineInfo}: Metadata collected contains an error that will be reported at runtime: ${
          expandedMessage(error)}.\n  ${JSON.stringify(error)}`);
    }
  }

  Object.getOwnPropertyNames(metadata).forEach(name => {
    const entry = metadata[name];
    try {
      if (isClassMetadata(entry)) {
        validateClass(entry);
      }
    } catch (e) {
      const node = nodeMap.get(entry);
      if (shouldReportNode(node)) {
        if (node) {
          const {line, character} = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          throw new Error(`${sourceFile.fileName}:${line + 1}:${
              character + 1}: Error encountered in metadata generated for exported symbol '${
              name}': \n ${e.message}`);
        }
        throw new Error(
            `Error encountered in metadata generated for exported symbol ${name}: \n ${e.message}`);
      }
    }
  });
}

// Collect parameter names from a function.
function namesOf(parameters: ts.NodeArray<ts.ParameterDeclaration>): string[] {
  const result: string[] = [];

  function addNamesOf(name: ts.Identifier|ts.BindingPattern) {
    if (name.kind == ts.SyntaxKind.Identifier) {
      const identifier = <ts.Identifier>name;
      result.push(identifier.text);
    } else {
      const bindingPattern = <ts.BindingPattern>name;
      for (const element of bindingPattern.elements) {
        const name = (element as any).name;
        if (name) {
          addNamesOf(name);
        }
      }
    }
  }

  for (const parameter of parameters) {
    addNamesOf(parameter.name);
  }

  return result;
}

function shouldIgnoreStaticMember(memberName: string): boolean {
  return memberName.startsWith('ngAcceptInputType_') || memberName.startsWith('ngTemplateGuard_');
}

function expandedMessage(error: any): string {
  switch (error.message) {
    case 'Reference to non-exported class':
      if (error.context && error.context.className) {
        return `Reference to a non-exported class ${
            error.context.className}. Consider exporting the class`;
      }
      break;
    case 'Variable not initialized':
      return 'Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler';
    case 'Destructuring not supported':
      return 'Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring';
    case 'Could not resolve type':
      if (error.context && error.context.typeName) {
        return `Could not resolve type ${error.context.typeName}`;
      }
      break;
    case 'Function call not supported':
      let prefix =
          error.context && error.context.name ? `Calling function '${error.context.name}', f` : 'F';
      return prefix +
          'unction calls are not supported. Consider replacing the function or lambda with a reference to an exported function';
    case 'Reference to a local symbol':
      if (error.context && error.context.name) {
        return `Reference to a local (non-exported) symbol '${
            error.context.name}'. Consider exporting the symbol`;
      }
  }
  return error.message;
}
