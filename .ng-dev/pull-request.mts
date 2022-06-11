import {PullRequestConfig} from '@angular/dev-infra-private/ng-dev';

/**
 * Configuration for the pull request commands in `ng-dev`. This includes the
 * setup for the merge command.
 */
export const pullRequest: PullRequestConfig = {
  // By default, the merge script merges locally with `git cherry-pick` and autosquash.
  // This has the downside of pull requests showing up as `Closed` instead of `Merged`.
  // In the components repository, since we don't use fixup or squash commits, we can
  // use the Github API merge strategy. That way we ensure that PRs show up as `Merged`.
  githubApiMerge: {
    default: 'squash',
    labels: [{pattern: 'preserve commits', method: 'rebase'}],
  },
  mergeReadyLabel: 'merge ready',
  commitMessageFixupLabel: 'commit message fixup',
  caretakerNoteLabel: 'caretaker note',
};
