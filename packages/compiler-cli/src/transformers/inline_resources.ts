/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {MetadataObject, MetadataValue, isClassMetadata, isMetadataImportedSymbolReferenceExpression, isMetadataSymbolicCallExpression} from '../metadata/index';

import {MetadataTransformer, ValueTransform} from './metadata_cache';

export type ResourceLoader = {
  loadResource(path: string): Promise<string>| string;
};

export class InlineResourcesMetadataTransformer implements MetadataTransformer {
  constructor(private host: ResourceLoader) {}

  start(sourceFile: ts.SourceFile): ValueTransform|undefined {
    return (value: MetadataValue, node: ts.Node): MetadataValue => {
      if (isClassMetadata(value) && ts.isClassDeclaration(node) && value.decorators) {
        value.decorators.forEach(d => {
          if (isMetadataSymbolicCallExpression(d) &&
              isMetadataImportedSymbolReferenceExpression(d.expression) &&
              d.expression.module === '@angular/core' && d.expression.name === 'Component' &&
              d.arguments) {
            d.arguments = d.arguments.map(this.updateDecoratorMetadata.bind(this));
          }
        });
      }
      return value;
    };
  }

  inlineResource(url: MetadataValue): string|undefined {
    if (typeof url === 'string') {
      const content = this.host.loadResource(url);
      if (typeof content === 'string') {
        return content;
      }
    }
  }

  updateDecoratorMetadata(arg: MetadataObject): MetadataObject {
    if (arg['templateUrl']) {
      const template = this.inlineResource(arg['templateUrl']);
      if (template) {
        arg['template'] = template;
        delete arg.templateUrl;
      }
    }
    if (arg['styleUrls']) {
      const styleUrls = arg['styleUrls'];
      if (Array.isArray(styleUrls)) {
        let allStylesInlined = true;
        const newStyles = styleUrls.map(styleUrl => {
          const style = this.inlineResource(styleUrl);
          if (style) return style;
          allStylesInlined = false;
          return styleUrl;
        });
        if (allStylesInlined) {
          arg['styles'] = newStyles;
          delete arg.styleUrls;
        }
      }
    }

    return arg;
  }
}

export function getInlineResourcesTransformFactory(
    program: ts.Program, host: ResourceLoader): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => {
    const visitor: ts.Visitor = node => {
      // Components are always classes; skip any other node
      if (!ts.isClassDeclaration(node)) {
        return node;
      }

      // Decorator case - before or without decorator downleveling
      // @Component()
      const newDecorators = ts.visitNodes(node.decorators, (node: ts.Decorator) => {
        if (isComponentDecorator(node, program.getTypeChecker())) {
          return updateDecorator(node, host);
        }
        return node;
      });

      // Annotation case - after decorator downleveling
      // static decorators: {type: Function, args?: any[]}[]
      const newMembers = ts.visitNodes(
          node.members,
          (node: ts.ClassElement) => updateAnnotations(node, host, program.getTypeChecker()));

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
 * @param host provides access to load resources
 */
function updateDecorator(node: ts.Decorator, host: ResourceLoader): ts.Decorator {
  if (!ts.isCallExpression(node.expression)) {
    // User will get an error somewhere else with bare @Component
    return node;
  }
  const expr = node.expression;
  const newArguments = updateComponentProperties(expr.arguments, host);
  return ts.updateDecorator(
      node, ts.updateCall(expr, expr.expression, expr.typeArguments, newArguments));
}

/**
 * Update an Annotations AST node to inline the resources
 * @param node the static decorators property
 * @param host provides access to load resources
 * @param typeChecker provides access to symbol table
 */
function updateAnnotations(
    node: ts.ClassElement, host: ResourceLoader, typeChecker: ts.TypeChecker): ts.ClassElement {
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
          ts.createArrayLiteral(updateComponentProperties(prop.initializer.elements, host)));

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
  const moduleId =
      (declaration.parent !.parent !.parent !.moduleSpecifier as ts.StringLiteral).text;
  return moduleId === '@angular/core' && name === 'Component';
}

/**
 * For each property in the object literal, if it's templateUrl or styleUrls, replace it
 * with content.
 * @param node the arguments to @Component() or args property of decorators: [{type:Component}]
 * @param host provides access to the loadResource method of the host
 * @returns updated arguments
 */
function updateComponentProperties(
    args: ts.NodeArray<ts.Expression>, host: ResourceLoader): ts.NodeArray<ts.Expression> {
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
  const newArgument = ts.updateObjectLiteral(
      componentArg, ts.visitNodes(componentArg.properties, (node: ts.ObjectLiteralElementLike) => {
        if (!ts.isPropertyAssignment(node)) {
          // Error: unsupported
          return node;
        }

        if (ts.isComputedPropertyName(node.name)) {
          // computed names are not supported
          return node;
        }

        const name = node.name.text;
        switch (name) {
          case 'styleUrls':
            if (!ts.isArrayLiteralExpression(node.initializer)) {
              // Error: unsupported
              return node;
            }
            const styleUrls = node.initializer.elements;

            return ts.updatePropertyAssignment(
                node, ts.createIdentifier('styles'),
                ts.createArrayLiteral(ts.visitNodes(styleUrls, (expr: ts.Expression) => {
                  if (ts.isStringLiteral(expr)) {
                    const styles = host.loadResource(expr.text);
                    if (typeof styles === 'string') {
                      return ts.createLiteral(styles);
                    }
                  }
                  return expr;
                })));


          case 'templateUrl':
            if (ts.isStringLiteral(node.initializer)) {
              const template = host.loadResource(node.initializer.text);
              if (typeof template === 'string') {
                return ts.updatePropertyAssignment(
                    node, ts.createIdentifier('template'), ts.createLiteral(template));
              }
            }
            return node;

          default:
            return node;
        }
      }));
  return ts.createNodeArray<ts.Expression>([newArgument]);
}
