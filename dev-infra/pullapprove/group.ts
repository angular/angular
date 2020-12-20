/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {error} from '../utils/console';
import {convertConditionToFunction} from './condition_evaluator';
import {PullApproveGroupConfig} from './parse-yaml';
import {PullApproveGroupStateDependencyError} from './pullapprove_arrays';

/** A condition for a group. */
interface GroupCondition {
  expression: string;
  checkFn: (files: string[], groups: PullApproveGroup[]) => boolean;
  matchedFiles: Set<string>;
  unverifiable: boolean;
}

/** Result of testing files against the group. */
export interface PullApproveGroupResult {
  groupName: string;
  matchedConditions: GroupCondition[];
  matchedCount: number;
  unmatchedConditions: GroupCondition[];
  unmatchedCount: number;
  unverifiableConditions: GroupCondition[];
}

// Regular expression that matches conditions for the global approval.
const GLOBAL_APPROVAL_CONDITION_REGEX = /^"global-(docs-)?approvers" not in groups.approved$/;

// Name of the PullApprove group that serves as fallback. This group should never capture
// any conditions as it would always match specified files. This is not desired as we want
// to figure out as part of this tool, whether there actually are unmatched files.
const FALLBACK_GROUP_NAME = 'fallback';

/** A PullApprove group to be able to test files against. */
export class PullApproveGroup {
  /** List of conditions for the group. */
  conditions: GroupCondition[] = [];

  constructor(
      public groupName: string, config: PullApproveGroupConfig,
      readonly precedingGroups: PullApproveGroup[] = []) {
    this._captureConditions(config);
  }

  private _captureConditions(config: PullApproveGroupConfig) {
    if (config.conditions && this.groupName !== FALLBACK_GROUP_NAME) {
      return config.conditions.forEach(condition => {
        const expression = condition.trim();

        if (expression.match(GLOBAL_APPROVAL_CONDITION_REGEX)) {
          // Currently a noop as we don't take any action for global approval conditions.
          return;
        }

        try {
          this.conditions.push({
            expression,
            checkFn: convertConditionToFunction(expression),
            matchedFiles: new Set(),
            unverifiable: false,
          });
        } catch (e) {
          error(`Could not parse condition in group: ${this.groupName}`);
          error(` - ${expression}`);
          error(`Error:`);
          error(e.message);
          error(e.stack);
          process.exit(1);
        }
      });
    }
  }

  /**
   * Tests a provided file path to determine if it would be considered matched by
   * the pull approve group's conditions.
   */
  testFile(filePath: string): boolean {
    return this.conditions.every((condition) => {
      const {matchedFiles, checkFn, expression} = condition;
      try {
        const matchesFile = checkFn([filePath], this.precedingGroups);
        if (matchesFile) {
          matchedFiles.add(filePath);
        }
        return matchesFile;
      } catch (e) {
        // In the case of a condition that depends on the state of groups we want to
        // ignore that the verification can't accurately evaluate the condition and then
        // continue processing. Other types of errors fail the verification, as conditions
        // should otherwise be able to execute without throwing.
        if (e instanceof PullApproveGroupStateDependencyError) {
          condition.unverifiable = true;
          // Return true so that `this.conditions.every` can continue evaluating.
          return true;
        } else {
          const errMessage = `Condition could not be evaluated: \n\n` +
              `From the [${this.groupName}] group:\n` +
              ` - ${expression}` +
              `\n\n${e.message} ${e.stack}\n\n`;
          error(errMessage);
          process.exit(1);
        }
      }
    });
  }

  /** Retrieve the results for the Group, all matched and unmatched conditions. */
  getResults(): PullApproveGroupResult {
    const matchedConditions = this.conditions.filter(c => c.matchedFiles.size > 0);
    const unmatchedConditions =
        this.conditions.filter(c => c.matchedFiles.size === 0 && !c.unverifiable);
    const unverifiableConditions = this.conditions.filter(c => c.unverifiable);
    return {
      matchedConditions,
      matchedCount: matchedConditions.length,
      unmatchedConditions,
      unmatchedCount: unmatchedConditions.length,
      unverifiableConditions,
      groupName: this.groupName,
    };
  }
}
