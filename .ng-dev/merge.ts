import {MergeConfig} from '@angular/dev-infra-private/ng-dev/pr/merge/config';

/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 */
export const merge: MergeConfig = {
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
  caretakerNoteLabel: 'caretaker note',
};
