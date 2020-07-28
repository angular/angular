/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullApproveGroup} from './group';
import {PullApproveGroupArray, PullApproveStringArray} from './pullapprove_arrays';
import {getOrCreateGlob} from './utils';

/**
 * Context that is provided to conditions. Conditions can use various helpers
 * that PullApprove provides. We try to mock them here. Consult the official
 * docs for more details: https://docs.pullapprove.com/config/conditions.
 */
const conditionContext = {
  'len': (value: any[]) => value.length,
  'contains_any_globs': (files: PullApproveStringArray, patterns: string[]) => {
    // Note: Do not always create globs for the same pattern again. This method
    // could be called for each source file. Creating glob's is expensive.
    return files.some(f => patterns.some(pattern => getOrCreateGlob(pattern).match(f)));
  },
};

/**
 * Converts a given condition to a function that accepts a set of files. The returned
 * function can be called to check if the set of files matches the condition.
 */
export function convertConditionToFunction(expr: string): (
    files: string[], groups: PullApproveGroup[]) => boolean {
  // Creates a dynamic function with the specified expression.
  // The first parameter will be `files` as that corresponds to the supported `files` variable that
  // can be accessed in PullApprove condition expressions. The second parameter is the list of
  // PullApproveGroups that are accessible in the condition expressions. The followed parameters
  // correspond to other context variables provided by PullApprove for conditions.
  const evaluateFn = new Function('files', 'groups', ...Object.keys(conditionContext), `
    return (${transformExpressionToJs(expr)});
  `);

  // Create a function that calls the dynamically constructed function which mimics
  // the condition expression that is usually evaluated with Python in PullApprove.
  return (files, groups) => {
    const result = evaluateFn(
        new PullApproveStringArray(...files), new PullApproveGroupArray(...groups),
        ...Object.values(conditionContext));
    // If an array is returned, we consider the condition as active if the array is not
    // empty. This matches PullApprove's condition evaluation that is based on Python.
    if (Array.isArray(result)) {
      return result.length !== 0;
    }
    return !!result;
  };
}

/**
 * Transforms a condition expression from PullApprove that is based on python
 * so that it can be run inside JavaScript. Current transformations:
 *   1. `not <..>` -> `!<..>`
 */
function transformExpressionToJs(expression: string): string {
  return expression.replace(/not\s+/g, '!');
}
