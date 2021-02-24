/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/** Names of the helper functions that are supported for this migration. */
export const enum HelperFunction {
  any = 'AnyDuringRendererMigration',
  createElement = '__ngRendererCreateElementHelper',
  createText = '__ngRendererCreateTextHelper',
  createTemplateAnchor = '__ngRendererCreateTemplateAnchorHelper',
  projectNodes = '__ngRendererProjectNodesHelper',
  animate = '__ngRendererAnimateHelper',
  destroyView = '__ngRendererDestroyViewHelper',
  detachView = '__ngRendererDetachViewHelper',
  attachViewAfter = '__ngRendererAttachViewAfterHelper',
  splitNamespace = '__ngRendererSplitNamespaceHelper',
  setElementAttribute = '__ngRendererSetElementAttributeHelper'
}

/** Gets the string representation of a helper function. */
export function getHelper(
    name: HelperFunction, sourceFile: ts.SourceFile, printer: ts.Printer): string {
  const helperDeclaration = getHelperDeclaration(name);
  return '\n' + printer.printNode(ts.EmitHint.Unspecified, helperDeclaration, sourceFile) + '\n';
}

/** Creates a function declaration for the specified helper name. */
function getHelperDeclaration(name: HelperFunction): ts.Node {
  switch (name) {
    case HelperFunction.any:
      return createAnyTypeHelper();
    case HelperFunction.createElement:
      return getCreateElementHelper();
    case HelperFunction.createText:
      return getCreateTextHelper();
    case HelperFunction.createTemplateAnchor:
      return getCreateTemplateAnchorHelper();
    case HelperFunction.projectNodes:
      return getProjectNodesHelper();
    case HelperFunction.animate:
      return getAnimateHelper();
    case HelperFunction.destroyView:
      return getDestroyViewHelper();
    case HelperFunction.detachView:
      return getDetachViewHelper();
    case HelperFunction.attachViewAfter:
      return getAttachViewAfterHelper();
    case HelperFunction.setElementAttribute:
      return getSetElementAttributeHelper();
    case HelperFunction.splitNamespace:
      return getSplitNamespaceHelper();
  }
}

/** Creates a helper for a custom `any` type during the migration. */
function createAnyTypeHelper(): ts.TypeAliasDeclaration {
  // type AnyDuringRendererMigration = any;
  return ts.createTypeAliasDeclaration(
      [], [], HelperFunction.any, [], ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
}

/** Creates a function parameter that is typed as `any`. */
function getAnyTypedParameter(
    parameterName: string|ts.Identifier, isRequired = true): ts.ParameterDeclaration {
  // Declare the parameter as `any` so we don't have to add extra logic to ensure that the
  // generated code will pass type checking. Use our custom `any` type so people have an incentive
  // to clean it up afterwards and to avoid potentially introducing lint warnings in G3.
  const type = ts.createTypeReferenceNode(HelperFunction.any, []);
  return ts.createParameter(
      [], [], undefined, parameterName,
      isRequired ? undefined : ts.createToken(ts.SyntaxKind.QuestionToken), type);
}

/** Creates a helper for `createElement`. */
function getCreateElementHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const parent = ts.createIdentifier('parent');
  const namespaceAndName = ts.createIdentifier('namespaceAndName');
  const name = ts.createIdentifier('name');
  const namespace = ts.createIdentifier('namespace');

  // [namespace, name] = splitNamespace(namespaceAndName);
  const namespaceAndNameVariable = ts.createVariableDeclaration(
      ts.createArrayBindingPattern(
          [namespace, name].map(id => ts.createBindingElement(undefined, undefined, id))),
      undefined,
      ts.createCall(ts.createIdentifier(HelperFunction.splitNamespace), [], [namespaceAndName]));

  // `renderer.createElement(name, namespace)`.
  const creationCall =
      ts.createCall(ts.createPropertyAccess(renderer, 'createElement'), [], [name, namespace]);

  return getCreationHelper(
      HelperFunction.createElement, creationCall, renderer, parent, [namespaceAndName],
      [ts.createVariableStatement(
          undefined,
          ts.createVariableDeclarationList([namespaceAndNameVariable], ts.NodeFlags.Const))]);
}

/** Creates a helper for `createText`. */
function getCreateTextHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const parent = ts.createIdentifier('parent');
  const value = ts.createIdentifier('value');

  // `renderer.createText(value)`.
  const creationCall = ts.createCall(ts.createPropertyAccess(renderer, 'createText'), [], [value]);

  return getCreationHelper(HelperFunction.createText, creationCall, renderer, parent, [value]);
}

/** Creates a helper for `createTemplateAnchor`. */
function getCreateTemplateAnchorHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const parent = ts.createIdentifier('parent');

  // `renderer.createComment('')`.
  const creationCall = ts.createCall(
      ts.createPropertyAccess(renderer, 'createComment'), [], [ts.createStringLiteral('')]);

  return getCreationHelper(HelperFunction.createTemplateAnchor, creationCall, renderer, parent);
}

/**
 * Gets the function declaration for a creation helper. This is reused between `createElement`,
 * `createText` and `createTemplateAnchor` which follow a very similar pattern.
 * @param functionName Function that the helper should have.
 * @param creationCall Expression that is used to create a node inside the function.
 * @param rendererParameter Parameter for the `renderer`.
 * @param parentParameter Parameter for the `parent` inside the function.
 * @param extraParameters Extra parameters to be added to the end.
 * @param precedingVariables Extra variables to be added before the one that creates the `node`.
 */
function getCreationHelper(
    functionName: HelperFunction, creationCall: ts.CallExpression, renderer: ts.Identifier,
    parent: ts.Identifier, extraParameters: ts.Identifier[] = [],
    precedingVariables: ts.VariableStatement[] = []): ts.FunctionDeclaration {
  const node = ts.createIdentifier('node');

  // `const node = {{creationCall}}`.
  const nodeVariableStatement = ts.createVariableStatement(
      undefined,
      ts.createVariableDeclarationList(
          [ts.createVariableDeclaration(node, undefined, creationCall)], ts.NodeFlags.Const));

  // `if (parent) { renderer.appendChild(parent, node) }`.
  const guardedAppendChildCall = ts.createIf(
      parent,
      ts.createBlock(
          [ts.createExpressionStatement(
              ts.createCall(ts.createPropertyAccess(renderer, 'appendChild'), [], [parent, node]))],
          true));

  return ts.createFunctionDeclaration(
      [], [], undefined, functionName, [],
      [renderer, parent, ...extraParameters].map(name => getAnyTypedParameter(name)), undefined,
      ts.createBlock(
          [
            ...precedingVariables, nodeVariableStatement, guardedAppendChildCall,
            ts.createReturn(node)
          ],
          true));
}

/** Creates a helper for `projectNodes`. */
function getProjectNodesHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const parent = ts.createIdentifier('parent');
  const nodes = ts.createIdentifier('nodes');
  const incrementor = ts.createIdentifier('i');

  // for (let i = 0; i < nodes.length; i++) {
  //   renderer.appendChild(parent, nodes[i]);
  // }
  const loopInitializer = ts.createVariableDeclarationList(
      [ts.createVariableDeclaration(incrementor, undefined, ts.createNumericLiteral('0'))],
      ts.NodeFlags.Let);
  const loopCondition = ts.createBinary(
      incrementor, ts.SyntaxKind.LessThanToken,
      ts.createPropertyAccess(nodes, ts.createIdentifier('length')));
  const appendStatement = ts.createExpressionStatement(ts.createCall(
      ts.createPropertyAccess(renderer, 'appendChild'), [],
      [parent, ts.createElementAccess(nodes, incrementor)]));
  const loop = ts.createFor(
      loopInitializer, loopCondition, ts.createPostfix(incrementor, ts.SyntaxKind.PlusPlusToken),
      ts.createBlock([appendStatement]));

  return ts.createFunctionDeclaration(
      [], [], undefined, HelperFunction.projectNodes, [],
      [renderer, parent, nodes].map(name => getAnyTypedParameter(name)), undefined,
      ts.createBlock([loop], true));
}

/** Creates a helper for `animate`. */
function getAnimateHelper(): ts.FunctionDeclaration {
  // throw new Error('...');
  const throwStatement = ts.createThrow(ts.createNew(
      ts.createIdentifier('Error'), [],
      [ts.createStringLiteral('Renderer.animate is no longer supported!')]));

  return ts.createFunctionDeclaration(
      [], [], undefined, HelperFunction.animate, [], [], undefined,
      ts.createBlock([throwStatement], true));
}

/** Creates a helper for `destroyView`. */
function getDestroyViewHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const allNodes = ts.createIdentifier('allNodes');
  const incrementor = ts.createIdentifier('i');

  // for (let i = 0; i < allNodes.length; i++) {
  //   renderer.destroyNode(allNodes[i]);
  // }
  const loopInitializer = ts.createVariableDeclarationList(
      [ts.createVariableDeclaration(incrementor, undefined, ts.createNumericLiteral('0'))],
      ts.NodeFlags.Let);
  const loopCondition = ts.createBinary(
      incrementor, ts.SyntaxKind.LessThanToken,
      ts.createPropertyAccess(allNodes, ts.createIdentifier('length')));
  const destroyStatement = ts.createExpressionStatement(ts.createCall(
      ts.createPropertyAccess(renderer, 'destroyNode'), [],
      [ts.createElementAccess(allNodes, incrementor)]));
  const loop = ts.createFor(
      loopInitializer, loopCondition, ts.createPostfix(incrementor, ts.SyntaxKind.PlusPlusToken),
      ts.createBlock([destroyStatement]));

  return ts.createFunctionDeclaration(
      [], [], undefined, HelperFunction.destroyView, [],
      [renderer, allNodes].map(name => getAnyTypedParameter(name)), undefined,
      ts.createBlock([loop], true));
}

/** Creates a helper for `detachView`. */
function getDetachViewHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const rootNodes = ts.createIdentifier('rootNodes');
  const incrementor = ts.createIdentifier('i');
  const node = ts.createIdentifier('node');

  // for (let i = 0; i < rootNodes.length; i++) {
  //   const node = rootNodes[i];
  //   renderer.removeChild(renderer.parentNode(node), node);
  // }
  const loopInitializer = ts.createVariableDeclarationList(
      [ts.createVariableDeclaration(incrementor, undefined, ts.createNumericLiteral('0'))],
      ts.NodeFlags.Let);
  const loopCondition = ts.createBinary(
      incrementor, ts.SyntaxKind.LessThanToken,
      ts.createPropertyAccess(rootNodes, ts.createIdentifier('length')));

  // const node = rootNodes[i];
  const nodeVariableStatement = ts.createVariableStatement(
      undefined,
      ts.createVariableDeclarationList(
          [ts.createVariableDeclaration(
              node, undefined, ts.createElementAccess(rootNodes, incrementor))],
          ts.NodeFlags.Const));
  // renderer.removeChild(renderer.parentNode(node), node);
  const removeCall = ts.createCall(
      ts.createPropertyAccess(renderer, 'removeChild'), [],
      [ts.createCall(ts.createPropertyAccess(renderer, 'parentNode'), [], [node]), node]);

  const loop = ts.createFor(
      loopInitializer, loopCondition, ts.createPostfix(incrementor, ts.SyntaxKind.PlusPlusToken),
      ts.createBlock([nodeVariableStatement, ts.createExpressionStatement(removeCall)]));

  return ts.createFunctionDeclaration(
      [], [], undefined, HelperFunction.detachView, [],
      [renderer, rootNodes].map(name => getAnyTypedParameter(name)), undefined,
      ts.createBlock([loop], true));
}

/** Creates a helper for `attachViewAfter` */
function getAttachViewAfterHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const node = ts.createIdentifier('node');
  const rootNodes = ts.createIdentifier('rootNodes');
  const parent = ts.createIdentifier('parent');
  const nextSibling = ts.createIdentifier('nextSibling');
  const incrementor = ts.createIdentifier('i');
  const createConstWithMethodCallInitializer = (constName: ts.Identifier, methodToCall: string) => {
    return ts.createVariableStatement(
        undefined,
        ts.createVariableDeclarationList(
            [ts.createVariableDeclaration(
                constName, undefined,
                ts.createCall(ts.createPropertyAccess(renderer, methodToCall), [], [node]))],
            ts.NodeFlags.Const));
  };

  // const parent = renderer.parentNode(node);
  const parentVariableStatement = createConstWithMethodCallInitializer(parent, 'parentNode');

  // const nextSibling = renderer.nextSibling(node);
  const nextSiblingVariableStatement =
      createConstWithMethodCallInitializer(nextSibling, 'nextSibling');

  // for (let i = 0; i < rootNodes.length; i++) {
  //   renderer.insertBefore(parentElement, rootNodes[i], nextSibling);
  // }
  const loopInitializer = ts.createVariableDeclarationList(
      [ts.createVariableDeclaration(incrementor, undefined, ts.createNumericLiteral('0'))],
      ts.NodeFlags.Let);
  const loopCondition = ts.createBinary(
      incrementor, ts.SyntaxKind.LessThanToken,
      ts.createPropertyAccess(rootNodes, ts.createIdentifier('length')));
  const insertBeforeCall = ts.createCall(
      ts.createPropertyAccess(renderer, 'insertBefore'), [],
      [parent, ts.createElementAccess(rootNodes, incrementor), nextSibling]);
  const loop = ts.createFor(
      loopInitializer, loopCondition, ts.createPostfix(incrementor, ts.SyntaxKind.PlusPlusToken),
      ts.createBlock([ts.createExpressionStatement(insertBeforeCall)]));

  return ts.createFunctionDeclaration(
      [], [], undefined, HelperFunction.attachViewAfter, [],
      [renderer, node, rootNodes].map(name => getAnyTypedParameter(name)), undefined,
      ts.createBlock([parentVariableStatement, nextSiblingVariableStatement, loop], true));
}

/** Creates a helper for `setElementAttribute` */
function getSetElementAttributeHelper(): ts.FunctionDeclaration {
  const renderer = ts.createIdentifier('renderer');
  const element = ts.createIdentifier('element');
  const namespaceAndName = ts.createIdentifier('namespaceAndName');
  const value = ts.createIdentifier('value');
  const name = ts.createIdentifier('name');
  const namespace = ts.createIdentifier('namespace');

  // [namespace, name] = splitNamespace(namespaceAndName);
  const namespaceAndNameVariable = ts.createVariableDeclaration(
      ts.createArrayBindingPattern(
          [namespace, name].map(id => ts.createBindingElement(undefined, undefined, id))),
      undefined,
      ts.createCall(ts.createIdentifier(HelperFunction.splitNamespace), [], [namespaceAndName]));

  // renderer.setAttribute(element, name, value, namespace);
  const setCall = ts.createCall(
      ts.createPropertyAccess(renderer, 'setAttribute'), [], [element, name, value, namespace]);

  // renderer.removeAttribute(element, name, namespace);
  const removeCall = ts.createCall(
      ts.createPropertyAccess(renderer, 'removeAttribute'), [], [element, name, namespace]);

  // if (value != null) { setCall() } else { removeCall }
  const ifStatement = ts.createIf(
      ts.createBinary(value, ts.SyntaxKind.ExclamationEqualsToken, ts.createNull()),
      ts.createBlock([ts.createExpressionStatement(setCall)], true),
      ts.createBlock([ts.createExpressionStatement(removeCall)], true));

  const functionBody = ts.createBlock(
      [
        ts.createVariableStatement(
            undefined,
            ts.createVariableDeclarationList([namespaceAndNameVariable], ts.NodeFlags.Const)),
        ifStatement
      ],
      true);

  return ts.createFunctionDeclaration(
      [], [], undefined, HelperFunction.setElementAttribute, [],
      [
        getAnyTypedParameter(renderer), getAnyTypedParameter(element),
        getAnyTypedParameter(namespaceAndName), getAnyTypedParameter(value, false)
      ],
      undefined, functionBody);
}

/** Creates a helper for splitting a name that might contain a namespace. */
function getSplitNamespaceHelper(): ts.FunctionDeclaration {
  const name = ts.createIdentifier('name');
  const match = ts.createIdentifier('match');
  const regex = ts.createRegularExpressionLiteral('/^:([^:]+):(.+)$/');
  const matchCall = ts.createCall(ts.createPropertyAccess(name, 'match'), [], [regex]);

  // const match = name.split(regex);
  const matchVariable = ts.createVariableDeclarationList(
      [ts.createVariableDeclaration(match, undefined, matchCall)], ts.NodeFlags.Const);

  // return [match[1], match[2]];
  const matchReturn = ts.createReturn(
      ts.createArrayLiteral([ts.createElementAccess(match, 1), ts.createElementAccess(match, 2)]));

  // if (name[0] === ':') { const match = ...; return ...; }
  const ifStatement = ts.createIf(
      ts.createBinary(
          ts.createElementAccess(name, 0), ts.SyntaxKind.EqualsEqualsEqualsToken,
          ts.createStringLiteral(':')),
      ts.createBlock([ts.createVariableStatement([], matchVariable), matchReturn], true));

  // return ['', name];
  const elseReturn = ts.createReturn(ts.createArrayLiteral([ts.createStringLiteral(''), name]));

  return ts.createFunctionDeclaration(
      [], [], undefined, HelperFunction.splitNamespace, [], [getAnyTypedParameter(name)], undefined,
      ts.createBlock([ifStatement, elseReturn], true));
}
