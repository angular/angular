import {MergeConfig} from '@angular/dev-infra-private/pr/merge/config';
import {GithubConfig} from '@angular/dev-infra-private/utils/config';
import {determineMergeBranches} from './scripts/determine-merge-branches';

/**
 * Github configuration for the ng-dev command. This repository is
 * uses as remote for the merge script.
 */
const github: GithubConfig = {
  owner: 'angular',
  name: 'components'
};

/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 */
const merge = (): MergeConfig => {
  const {minor, patch} = determineMergeBranches(github.owner, github.name);
  return {
    // By default, the merge script merges locally with `git cherry-pick` and autosquash.
    // This has the downside of pull requests showing up as `Closed` instead of `Merged`.
    // In the components repository, since we don't use fixup or squash commits, we can
    // use the Github API merge strategy. That way we ensure that PRs show up as `Merged`.
    githubApiMerge: {
      default: 'squash',
      labels: [
        {pattern: 'preserve commits', method: 'rebase'}
      ]
    },
    claSignedLabel: 'cla: yes',
    mergeReadyLabel: 'merge ready',
    commitMessageFixupLabel: 'commit message fixup',
    labels: [
      {
        pattern: 'target: patch',
        branches: ['master', patch],
      },
      {
        pattern: 'target: minor',
        branches: ['master', minor],
      },
      {
        pattern: 'target: major',
        branches: ['master'],
      },
      {
        pattern: 'target: development-branch',
        // Merge PRs with the given label only into the target branch that has
        // been specified through the Github UI.
        branches: (target) => [target],
      }
    ],
  };
};

module.exports = {
  github,
  merge,
};
