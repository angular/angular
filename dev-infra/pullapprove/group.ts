/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {IMinimatch, Minimatch, match} from 'minimatch';

import {PullApproveGroupConfig} from './parse-yaml';

/** A condition for a group. */
interface GroupCondition {
  glob: string;
  matcher: IMinimatch;
  matchedFiles: Set<string>;
}

/** Result of testing files against the group. */
export interface PullApproveGroupResult {
  groupName: string;
  matchedIncludes: GroupCondition[];
  matchedExcludes: GroupCondition[];
  matchedCount: number;
  unmatchedIncludes: GroupCondition[];
  unmatchedExcludes: GroupCondition[];
  unmatchedCount: number;
}

// Regex Matcher for contains_any_globs conditions
const CONTAINS_ANY_GLOBS_REGEX = /^'([^']+)',?$/;

const CONDITION_TYPES = {
  INCLUDE_GLOBS: /^contains_any_globs/,
  EXCLUDE_GLOBS: /^not contains_any_globs/,
  ATTR_LENGTH: /^len\(.*\)/,
};

/** A PullApprove group to be able to test files against. */
export class PullApproveGroup {
  // Lines which were not able to be parsed as expected.
  private misconfiguredLines: string[] = [];
  // Conditions for the group for including files.
  private includeConditions: GroupCondition[] = [];
  // Conditions for the group for excluding files.
  private excludeConditions: GroupCondition[] = [];
  // Whether the group has file matchers.
  public hasMatchers = false;

  constructor(public groupName: string, group: PullApproveGroupConfig) {
    for (let condition of group.conditions) {
      condition = condition.trim();

      if (condition.match(CONDITION_TYPES.INCLUDE_GLOBS)) {
        const [conditions, misconfiguredLines] = getLinesForContainsAnyGlobs(condition);
        conditions.forEach(globString => this.includeConditions.push({
          glob: globString,
          matcher: new Minimatch(globString, {dot: true}),
          matchedFiles: new Set<string>(),
        }));
        this.misconfiguredLines.push(...misconfiguredLines);
        this.hasMatchers = true;
      } else if (condition.match(CONDITION_TYPES.EXCLUDE_GLOBS)) {
        const [conditions, misconfiguredLines] = getLinesForContainsAnyGlobs(condition);
        conditions.forEach(globString => this.excludeConditions.push({
          glob: globString,
          matcher: new Minimatch(globString, {dot: true}),
          matchedFiles: new Set<string>(),
        }));
        this.misconfiguredLines.push(...misconfiguredLines);
        this.hasMatchers = true;
      } else if (condition.match(CONDITION_TYPES.ATTR_LENGTH)) {
        // Currently a noop as we do not take any action on this condition type.
      } else {
        const errMessage =
            `Unrecognized condition found, unable to parse the following condition: \n\n` +
            `From the [${groupName}] group:\n` +
            ` - ${condition}` +
            `\n\n` +
            `Known condition regexs:\n` +
            `${Object.entries(CONDITION_TYPES).map(([k, v]) => ` ${k} - $ {
          v
        }
        `).join('\n')}` +
            `\n\n`;
        console.error(errMessage);
        process.exit(1);
      }
    }
  }

  /** Retrieve all of the lines which were not able to be parsed. */
  getBadLines(): string[] { return this.misconfiguredLines; }

  /** Retrieve the results for the Group, all matched and unmatched conditions. */
  getResults(): PullApproveGroupResult {
    const matchedIncludes = this.includeConditions.filter(c => !!c.matchedFiles.size);
    const matchedExcludes = this.excludeConditions.filter(c => !!c.matchedFiles.size);
    const unmatchedIncludes = this.includeConditions.filter(c => !c.matchedFiles.size);
    const unmatchedExcludes = this.excludeConditions.filter(c => !c.matchedFiles.size);
    const unmatchedCount = unmatchedIncludes.length + unmatchedExcludes.length;
    const matchedCount = matchedIncludes.length + matchedExcludes.length;
    return {
      matchedIncludes,
      matchedExcludes,
      matchedCount,
      unmatchedIncludes,
      unmatchedExcludes,
      unmatchedCount,
      groupName: this.groupName,
    };
  }

  /**
   * Tests a provided file path to determine if it would be considered matched by
   * the pull approve group's conditions.
   */
  testFile(file: string) {
    let matched = false;
    this.includeConditions.forEach((includeCondition: GroupCondition) => {
      if (includeCondition.matcher.match(file)) {
        let matchedExclude = false;
        this.excludeConditions.forEach((excludeCondition: GroupCondition) => {
          if (excludeCondition.matcher.match(file)) {
            // Add file as a discovered exclude as it is negating a matched
            // include condition.
            excludeCondition.matchedFiles.add(file);
            matchedExclude = true;
          }
        });
        // An include condition is only considered matched if no exclude
        // conditions are found to matched the file.
        if (!matchedExclude) {
          includeCondition.matchedFiles.add(file);
          matched = true;
        }
      }
    });
    return matched;
  }
}

/**
 * Extract all of the individual globs from a group condition,
 * providing both the valid and invalid lines.
 */
function getLinesForContainsAnyGlobs(lines: string) {
  const invalidLines: string[] = [];
  const validLines = lines.split('\n')
                         .slice(1, -1)
                         .map((glob: string) => {
                           const trimmedGlob = glob.trim();
                           const match = trimmedGlob.match(CONTAINS_ANY_GLOBS_REGEX);
                           if (!match) {
                             invalidLines.push(trimmedGlob);
                             return '';
                           }
                           return match[1];
                         })
                         .filter(globString => !!globString);
  return [validLines, invalidLines];
}
