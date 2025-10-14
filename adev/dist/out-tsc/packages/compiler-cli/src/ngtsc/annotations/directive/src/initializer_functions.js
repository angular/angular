/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
/**
 * Attempts to identify an Angular initializer function call.
 *
 * Note that multiple possible initializer API function names can be specified,
 * allowing for checking multiple types in one pass.
 *
 * @returns The parsed initializer API, or null if none was found.
 */
export function tryParseInitializerApi(functions, expression, reflector, importTracker) {
  if (ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression)) {
    return tryParseInitializerApi(functions, expression.expression, reflector, importTracker);
  }
  if (!ts.isCallExpression(expression)) {
    return null;
  }
  const staticResult =
    parseTopLevelCall(expression, functions, importTracker) ||
    parseTopLevelRequiredCall(expression, functions, importTracker) ||
    parseTopLevelCallFromNamespace(expression, functions, importTracker);
  if (staticResult === null) {
    return null;
  }
  const {api, apiReference, isRequired} = staticResult;
  // Once we've statically determined that the initializer is one of the APIs we're looking for, we
  // need to verify it using the type checker which accounts for things like shadowed variables.
  // This should be done as the absolute last step since using the type check can be expensive.
  const resolvedImport = reflector.getImportOfIdentifier(apiReference);
  if (
    resolvedImport === null ||
    api.functionName !== resolvedImport.name ||
    api.owningModule !== resolvedImport.from
  ) {
    return null;
  }
  return {
    api,
    call: expression,
    isRequired,
  };
}
/**
 * Attempts to parse a top-level call to an initializer function,
 * e.g. `prop = input()`. Returns null if it can't be parsed.
 */
function parseTopLevelCall(call, functions, importTracker) {
  const node = call.expression;
  if (!ts.isIdentifier(node)) {
    return null;
  }
  const matchingApi = functions.find((fn) =>
    importTracker.isPotentialReferenceToNamedImport(node, fn.functionName, fn.owningModule),
  );
  if (matchingApi === undefined) {
    return null;
  }
  return {api: matchingApi, apiReference: node, isRequired: false};
}
/**
 * Attempts to parse a top-level call to a required initializer,
 * e.g. `prop = input.required()`. Returns null if it can't be parsed.
 */
function parseTopLevelRequiredCall(call, functions, importTracker) {
  const node = call.expression;
  if (
    !ts.isPropertyAccessExpression(node) ||
    !ts.isIdentifier(node.expression) ||
    node.name.text !== 'required'
  ) {
    return null;
  }
  const expression = node.expression;
  const matchingApi = functions.find((fn) =>
    importTracker.isPotentialReferenceToNamedImport(expression, fn.functionName, fn.owningModule),
  );
  if (matchingApi === undefined) {
    return null;
  }
  return {api: matchingApi, apiReference: expression, isRequired: true};
}
/**
 * Attempts to parse a top-level call to a function referenced via a namespace import,
 * e.g. `prop = core.input.required()`. Returns null if it can't be parsed.
 */
function parseTopLevelCallFromNamespace(call, functions, importTracker) {
  const node = call.expression;
  if (!ts.isPropertyAccessExpression(node)) {
    return null;
  }
  let apiReference = null;
  let matchingApi = undefined;
  let isRequired = false;
  // `prop = core.input()`
  if (ts.isIdentifier(node.expression) && ts.isIdentifier(node.name)) {
    const namespaceRef = node.expression;
    apiReference = node.name;
    matchingApi = functions.find(
      (fn) =>
        node.name.text === fn.functionName &&
        importTracker.isPotentialReferenceToNamespaceImport(namespaceRef, fn.owningModule),
    );
  } else if (
    // `prop = core.input.required()`
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    ts.isIdentifier(node.expression.name) &&
    node.name.text === 'required'
  ) {
    const potentialName = node.expression.name.text;
    const namespaceRef = node.expression.expression;
    apiReference = node.expression.name;
    matchingApi = functions.find(
      (fn) =>
        fn.functionName === potentialName &&
        importTracker.isPotentialReferenceToNamespaceImport(namespaceRef, fn.owningModule),
    );
    isRequired = true;
  }
  if (matchingApi === undefined || apiReference === null) {
    return null;
  }
  return {api: matchingApi, apiReference, isRequired};
}
//# sourceMappingURL=initializer_functions.js.map
