import {DevInfraMergeConfig} from '@angular/dev-infra-private/pr/merge/config';
import {getDefaultTargetLabelConfiguration} from '@angular/dev-infra-private/pr/merge/defaults';
import {github} from './github';
import {release} from './release';

/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 */
export const merge: DevInfraMergeConfig['merge'] = async api => {
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
    caretakerNoteLabel: 'caretaker note',
    labels: await getDefaultTargetLabelConfiguration(api, github, release),
  };
};
