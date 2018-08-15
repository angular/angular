/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {isClassMetadata, isMetadataImportedSymbolReferenceExpression, isMetadataSymbolicCallExpression, MetadataObject, MetadataValue} from '../metadata/index';

import {MetadataTransformer, ValueTransform} from './metadata_cache';

const PRECONDITIONS_TEXT =
    'angularCompilerOptions.enableResourceInlining requires all resources to be statically resolvable.';

/** A subset of members from AotCompilerHost */
export type ResourcesHost = {
  resourceNameToFileName(resourceName: string, containingFileName: string): string|null;
  loadResource(path: string): Promise<string>| string;
};

export type StaticResourceLoader = {
  get(url: string|MetadataValue): string;
};

function getResourceLoader(host: ResourcesHost, containingFileName: string): StaticResourceLoader {
  return {
    get(url: string|MetadataValue): string {
      if (typeof url !== 'string') {
        throw new Error('templateUrl and stylesUrl must be string literals. ' + PRECONDITIONS_TEXT);
      }
      const fileName = host.resourceNameToFileName(url, containingFileName);
      if (fileName) {
        const content = host.loadResource(fileName);
        if (typeof content !== 'string') {
          throw new Error('Cannot handle async resource. ' + PRECONDITIONS_TEXT);
        }
        return content;
      }
      throw new Error(`Failed to resolve ${url} from ${containingFileName}. ${PRECONDITIONS_TEXT}`);
    }
  };
}

export class InlineResourcesMetadataTransformer implements MetadataTransformer {
  constructor(private host: ResourcesHost) {}

  start(sourceFile: ts.SourceFile): ValueTransform|undefined {
    const loader = getResourceLoader(this.host, sourceFile.fileName);
    return (value: MetadataValue, node: ts.Node): MetadataValue => {
      if (isClassMetadata(value) && ts.isClassDeclaration(node) && value.decorators) {
        value.decorators.forEach(d => {
          if (isMetadataSymbolicCallExpression(d) &&
              isMetadataImportedSymbolReferenceExpression(d.expression) &&
              d.expression.module === '@angular/core' && d.expression.name === 'Component' &&
              d.arguments) {
            // Arguments to an @Component that was compiled successfully are always
            // MetadataObject(s).
            d.arguments = (d.arguments as MetadataObject[])
                              .map(this.updateDecoratorMetadata.bind(this, loader));
          }
        });
      }
      return value;
    };
  }

  updateDecoratorMetadata(loader: StaticResourceLoader, arg: MetadataObject): MetadataObject {
    if (arg['templateUrl']) {
      arg['template'] = loader.get(arg['templateUrl']);
      delete arg['templateUrl'];
    }

    const styles = arg['styles'] || [];
    const styleUrls = arg['styleUrls'] || [];
    if (!Array.isArray(styles)) throw new Error('styles should be an array');
    if (!Array.isArray(styleUrls)) throw new Error('styleUrls should be an array');

    styles.push(...styleUrls.map(styleUrl => loader.get(styleUrl)));
    if (styles.length > 0) {
      arg['styles'] = styles;
      delete arg['styleUrls'];
    }

    return arg;
  }
}

export function getInlineResourcesTransformFactory(
    program: ts.Program, host: ResourcesHost): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    const loader = getResourceLoader(host, sourceFile.fileName);
    const visitor: ts.Visitor = node => {
      // Components are always classes; skip any other node
      if (!ts.isClassDeclaration(node)) {
        return node;
      }

      // Decorator case - before or without decorator downleveling
      // @Component()
      const newDecorators = ts.visitNodes(node.decorators, (node: ts.Node) => {
        if (ts.isDecorator(node) && isComponentDecorator(node, program.getTypeChecker())) {
          return updateDecorator(node, loader);
        }
        return node;
      });

      // Annotation case - after decorator downleveling
      // static decorators: {type: Function, args?: any[]}[]
      const newMembers = ts.visitNodes(node.members, (node: ts.Node) => {
        if (ts.isClassElement(node)) {
          return updateAnnotations(node, loader, program.getTypeChecker());
        } else {
          return node;
        }
      });

      // Create a new AST subtree with our modifications
      return ts.updateClassDeclaration(
          node, newDecorators, node.modifiers, node.name, node.typeParameters,
          node.heritageClauses || [], newMembers);
    };

    return ts.visitEachChild(sourceFile, visitor, context);
  };
}

/**
 * Update a Decorator AST node to inline the resources
 * @param node the @Component decorator
 * @param loader provides access to load resources
 */
function updateDecorator(node: ts.Decorator, loader: StaticResourceLoader): ts.Decorator {
  if (!ts.isCallExpression(node.expression)) {
    // User will get an error somewhere else with bare @Component
    return node;
  }
  const expr = node.expression;
  const newArguments = updateComponentProperties(expr.arguments, loader);
  return ts.updateDecorator(
      node, ts.updateCall(expr, expr.expression, expr.typeArguments, newArguments));
}

/**
 * Update an Annotations AST node to inline the resources
 * @param node the static decorators property
 * @param loader provides access to load resources
 * @param typeChecker provides access to symbol table
 */
function updateAnnotations(
    node: ts.ClassElement, loader: StaticResourceLoader,
    typeChecker: ts.TypeChecker): ts.ClassElement {
  // Looking for a member of this shape:
  // PropertyDeclaration called decorators, with static modifier
  // Initializer is ArrayLiteralExpression
  // One element is the Component type, its initializer is the @angular/core Component symbol
  // One element is the component args, its initializer is the Component arguments to change
  // e.g.
  //   static decorators: {type: Function, args?: any[]}[] =
  //   [{
  //     type: Component,
  //     args: [{
  //       templateUrl: './my.component.html',
  //       styleUrls: ['./my.component.css'],
  //     }],
  //   }];
  if (!ts.isPropertyDeclaration(node) ||  // ts.ModifierFlags.Static &&
      !ts.isIdentifier(node.name) || node.name.text !== 'decorators' || !node.initializer ||
      !ts.isArrayLiteralExpression(node.initializer)) {
    return node;
  }

  const newAnnotations = node.initializer.elements.map(annotation => {
    // No-op if there's a non-object-literal mixed in the decorators values
    if (!ts.isObjectLiteralExpression(annotation)) return annotation;

    const decoratorType = annotation.properties.find(p => isIdentifierNamed(p, 'type'));

    // No-op if there's no 'type' property, or if it's not initialized to the Component symbol
    if (!decoratorType || !ts.isPropertyAssignment(decoratorType) ||
        !ts.isIdentifier(decoratorType.initializer) ||
        !isComponentSymbol(decoratorType.initializer, typeChecker)) {
      return annotation;
    }

    const newAnnotation = annotation.properties.map(prop => {
      // No-op if this isn't the 'args' property or if it's not initialized to an array
      if (!isIdentifierNamed(prop, 'args') || !ts.isPropertyAssignment(prop) ||
          !ts.isArrayLiteralExpression(prop.initializer))
        return prop;

      const newDecoratorArgs = ts.updatePropertyAssignment(
          prop, prop.name,
          ts.createArrayLiteral(updateComponentProperties(prop.initializer.elements, loader)));

      return newDecoratorArgs;
    });

    return ts.updateObjectLiteral(annotation, newAnnotation);
  });

  return ts.updateProperty(
      node, node.decorators, node.modifiers, node.name, node.questionToken, node.type,
      ts.updateArrayLiteral(node.initializer, newAnnotations));
}

function isIdentifierNamed(p: ts.ObjectLiteralElementLike, name: string): boolean {
  return !!p.name && ts.isIdentifier(p.name) && p.name.text === name;
}

/**
 * Check that the node we are visiting is the actual Component decorator defined in @angular/core.
 */
function isComponentDecorator(node: ts.Decorator, typeChecker: ts.TypeChecker): boolean {
  if (!ts.isCallExpression(node.expression)) {
    return false;
  }
  const callExpr = node.expression;

  let identifier: ts.Node;

  if (ts.isIdentifier(callExpr.expression)) {
    identifier = callExpr.expression;
  } else {
    return false;
  }
  return isComponentSymbol(identifier, typeChecker);
}

function isComponentSymbol(identifier: ts.Node, typeChecker: ts.TypeChecker) {
  // Only handle identifiers, not expressions
  if (!ts.isIdentifier(identifier)) return false;

  // NOTE: resolver.getReferencedImportDeclaration would work as well but is internal
  const symbol = typeChecker.getSymbolAtLocation(identifier);

  if (!symbol || !symbol.declarations || !symbol.declarations.length) {
    console.error(
        `Unable to resolve symbol '${identifier.text}' in the program, does it type-check?`);
    return false;
  }

  const declaration = symbol.declarations[0];

  if (!declaration || !ts.isImportSpecifier(declaration)) {
    return false;
  }

  const name = (declaration.propertyName || declaration.name).text;
  // We know that parent pointers are set because we created the SourceFile ourselves.
  // The number of parent references here match the recursion depth at this point.
  const moduleId = (declaration.parent!.parent!.parent!.moduleSpecifier as ts.StringLiteral).text;
  return moduleId === '@angular/core' && name === 'Component';
}

/**
 * For each property in the object literal, if it's templateUrl or styleUrls, replace it
 * with content.
 * @param node the arguments to @Component() or args property of decorators: [{type:Component}]
 * @param loader provides access to the loadResource method of the host
 * @returns updated arguments
 */
function updateComponentProperties(
    args: ts.NodeArray<ts.Expression>, loader: StaticResourceLoader): ts.NodeArray<ts.Expression> {
  if (args.length !== 1) {
    // User should have gotten a type-check error because @Component takes one argument
    return args;
  }
  const componentArg = args[0];
  if (!ts.isObjectLiteralExpression(componentArg)) {
    // User should have gotten a type-check error because @Component takes an object literal
    // argument
    return args;
  }

  const newProperties: ts.ObjectLiteralElementLike[] = [];
  const newStyleExprs: ts.Expression[] = [];
  componentArg.properties.forEach(prop => {
    if (!ts.isPropertyAssignment(prop) || ts.isComputedPropertyName(prop.name)) {
      newProperties.push(prop);
      return;
    }

    switch (prop.name.text) {
      case 'styles':
        if (!ts.isArrayLiteralExpression(prop.initializer)) {
          throw new Error('styles takes an array argument');
        }
        newStyleExprs.push(...prop.initializer.elements);
        break;

      case 'styleUrls':
        if (!ts.isArrayLiteralExpression(prop.initializer)) {
          throw new Error('styleUrls takes an array argument');
        }
        newStyleExprs.push(...prop.initializer.elements.map((expr: ts.Expression) => {
          if (!ts.isStringLiteral(expr) && !ts.isNoSubstitutionTemplateLiteral(expr)) {
            throw new Error(
                'Can only accept string literal arguments to styleUrls. ' + PRECONDITIONS_TEXT);
          }
          const styles = loader.get(expr.text);
          return ts.createLiteral(styles);
        }));
        break;

      case 'templateUrl':
        if (!ts.isStringLiteral(prop.initializer) &&
            !ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
          throw new Error(
              'Can only accept a string literal argument to templateUrl. ' + PRECONDITIONS_TEXT);
        }
        const template = loader.get(prop.initializer.text);
        newProperties.push(ts.updatePropertyAssignment(
            prop, ts.createIdentifier('template'), ts.createLiteral(template)));
        break;

      default:
        newProperties.push(prop);
    }
  });

  // Add the non-inline styles
  if (newStyleExprs.length > 0) {
    const newStyles = ts.createPropertyAssignment(
        ts.createIdentifier('styles'), ts.createArrayLiteral(newStyleExprs));
    newProperties.push(newStyles);
  }

  return ts.createNodeArray([ts.updateObjectLiteral(componentArg, newProperties)]);
}
