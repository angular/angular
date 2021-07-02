/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {COMMIT_TYPES, ReleaseNotesLevel} from '../../commit-message/config';
import {CommitFromGitLog} from '../../commit-message/parse';
import {GithubConfig} from '../../utils/config';
import {ReleaseNotesConfig} from '../config/index';


/** List of types to be included in the release notes. */
const typesToIncludeInReleaseNotes =
    Object.values(COMMIT_TYPES)
        .filter(type => type.releaseNotesLevel === ReleaseNotesLevel.Visible)
        .map(type => type.name);

/** Data used for context during rendering. */
export interface RenderContextData {
  title: string|false;
  groupOrder?: ReleaseNotesConfig['groupOrder'];
  hiddenScopes?: ReleaseNotesConfig['hiddenScopes'];
  date?: Date;
  commits: CommitFromGitLog[];
  version: string;
  github: GithubConfig;
}

/** Context class used for rendering release notes. */
export class RenderContext {
  /** An array of group names in sort order if defined. */
  private readonly groupOrder = this.data.groupOrder || [];
  /** An array of scopes to hide from the release entry output. */
  private readonly hiddenScopes = this.data.hiddenScopes || [];
  /** The title of the release, or `false` if no title should be used. */
  readonly title = this.data.title;
  /** An array of commits in the release period. */
  readonly commits = this.data.commits;
  /** The version of the release. */
  readonly version = this.data.version;
  /** The date stamp string for use in the release notes entry. */
  readonly dateStamp = buildDateStamp(this.data.date);

  constructor(private readonly data: RenderContextData) {}

  /**
   * Organizes and sorts the commits into groups of commits.
   *
   * Groups are sorted either by default `Array.sort` order, or using the provided group order from
   * the configuration. Commits are order in the same order within each groups commit list as they
   * appear in the provided list of commits.
   * */
  asCommitGroups(commits: CommitFromGitLog[]) {
    /** The discovered groups to organize into. */
    const groups = new Map<string, CommitFromGitLog[]>();

    // Place each commit in the list into its group.
    commits.forEach(commit => {
      const key = commit.npmScope ? `${commit.npmScope}/${commit.scope}` : commit.scope;
      const groupCommits = groups.get(key) || [];
      groups.set(key, groupCommits);
      groupCommits.push(commit);
    });

    /**
     * Array of CommitGroups containing the discovered commit groups. Sorted in alphanumeric order
     * of the group title.
     */
    const commitGroups = Array.from(groups.entries())
                             .map(([title, commits]) => ({title, commits}))
                             .sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);

    // If the configuration provides a sorting order, updated the sorted list of group keys to
    // satisfy the order of the groups provided in the list with any groups not found in the list at
    // the end of the sorted list.
    if (this.groupOrder.length) {
      for (const groupTitle of this.groupOrder.reverse()) {
        const currentIdx = commitGroups.findIndex(k => k.title === groupTitle);
        if (currentIdx !== -1) {
          const removedGroups = commitGroups.splice(currentIdx, 1);
          commitGroups.splice(0, 0, ...removedGroups);
        }
      }
    }
    return commitGroups;
  }

  /**
   * A filter function for filtering a list of commits to only include commits which should appear
   * in release notes.
   */
  includeInReleaseNotes() {
    return (commit: CommitFromGitLog) => {
      if (!typesToIncludeInReleaseNotes.includes(commit.type)) {
        return false;
      }

      if (this.hiddenScopes.includes(commit.scope)) {
        return false;
      }
      return true;
    };
  }

  /**
   * A filter function for filtering a list of commits to only include commits which contain a
   * truthy value, or for arrays an array with 1 or more elements, for the provided field.
   */
  contains(field: keyof CommitFromGitLog) {
    return (commit: CommitFromGitLog) => {
      const fieldValue = commit[field];
      if (!fieldValue) {
        return false;
      }

      if (Array.isArray(fieldValue) && fieldValue.length === 0) {
        return false;
      }
      return true;
    };
  }

  /**
   * A filter function for filtering a list of commits to only include commits which contain a
   * unique value for the provided field across all commits in the list.
   */
  unique(field: keyof CommitFromGitLog) {
    const set = new Set<CommitFromGitLog[typeof field]>();
    return (commit: CommitFromGitLog) => {
      const include = !set.has(commit[field]);
      set.add(commit[field]);
      return include;
    };
  }

  /**
   * Convert a commit object to a Markdown link.
   */
  commitToLink(commit: CommitFromGitLog): string {
    const url = `https://github.com/${this.data.github.owner}/${this.data.github.name}/commit/${
        commit.hash}`;
    return `[${commit.shortHash}](${url})`;
  }

  /**
   * Convert a pull request number to a Markdown link.
   */
  pullRequestToLink(prNumber: number): string {
    const url =
        `https://github.com/${this.data.github.owner}/${this.data.github.name}/pull/${prNumber}`;
    return `[#${prNumber}](${url})`;
  }

  /**
   * Transform a commit message header by replacing the parenthesized pull request reference at the
   * end of the line (which is added by merge tooling) to a Markdown link.
   */
  replaceCommitHeaderPullRequestNumber(header: string): string {
    return header.replace(/\(#(\d+)\)$/, (_, g) => `(${this.pullRequestToLink(+g)})`);
  }
}


/**
 * Builds a date stamp for stamping in release notes.
 *
 * Uses the current date, or a provided date in the format of YYYY-MM-DD, i.e. 1970-11-05.
 */
export function buildDateStamp(date = new Date()) {
  const year = `${date.getFullYear()}`;
  const month = `${(date.getMonth() + 1)}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return [year, month, day].join('-');
}
