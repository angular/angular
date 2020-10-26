import {DevInfraMergeConfig} from '../dev-infra/pr/merge/config';
import {getDefaultTargetLabelConfiguration} from '../dev-infra/pr/merge/defaults';
import {github} from './github';
import {release} from './release';

/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 */
export const merge: DevInfraMergeConfig['merge'] = async api => {
  return {
    githubApiMerge: false,
    claSignedLabel: 'cla: yes',
    mergeReadyLabel: /^action: merge(-assistance)?/,
    caretakerNoteLabel: /^(action: merge-assistance)|(PullApprove: disable)/,
    commitMessageFixupLabel: 'commit message fixup',
    // We can pick any of the NPM packages as we are in a monorepo where all packages are
    // published together with the same version and branching.
    labels: await getDefaultTargetLabelConfiguration(api, github, release),
    requiredBaseCommits: {
      // PRs that target either `master` or the patch branch, need to be rebased
      // on top of the latest commit message validation fix.
      // These SHAs are the commits that update the required license text in the header.
      'master': '5aeb9a4124922d8ac08eb73b8f322905a32b0b3a',
      '10.0.x': '27b95ba64a5d99757f4042073fd1860e20e3ed24',
    },
  };
};
