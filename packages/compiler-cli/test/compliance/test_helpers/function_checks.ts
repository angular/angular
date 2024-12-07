/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Verify that all functions in the output have a unique name.
 * @param output Compiler output.
 * @param functionNamePattern Only match function whose names match this pattern.
 *    Will be converted into a regular expression.
 * @param expectedCount Expected number of functions.
 */
export function verifyUniqueFunctions(
  output: string,
  functionNamePattern?: string,
  expectedCount?: number,
): boolean {
  const pattern = functionNamePattern ? new RegExp(functionNamePattern) : null;
  const allTemplateFunctionsNames = (output.match(/function ([^\s(]+)/g) || [])
    .map((match) => match.slice(9))
    .filter((name) => !pattern || pattern.test(name));
  const uniqueTemplateFunctionNames = new Set(allTemplateFunctionsNames);
  const lengthMatches = allTemplateFunctionsNames.length === uniqueTemplateFunctionNames.size;
  const expectedCountMatches =
    expectedCount == null
      ? allTemplateFunctionsNames.length > 0
      : allTemplateFunctionsNames.length === expectedCount;
  return (
    lengthMatches &&
    expectedCountMatches &&
    allTemplateFunctionsNames.every((name) => uniqueTemplateFunctionNames.has(name))
  );
}
