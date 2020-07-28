import {MergeConfig} from '../dev-infra/pr/merge/config';

/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 */
export const merge = (): MergeConfig => {
  // TODO: resume dynamically determining patch branch
  const patch = '10.0.x';
  return {
    githubApiMerge: false,
    claSignedLabel: 'cla: yes',
    mergeReadyLabel: /^PR action: merge(-assistance)?/,
    caretakerNoteLabel: 'PR action: merge-assistance',
    commitMessageFixupLabel: 'commit message fixup',
    labels: [
      {
        pattern: 'PR target: master-only',
        branches: ['master'],
      },
      {
        pattern: 'PR target: patch-only',
        branches: [patch],
      },
      {
        pattern: 'PR target: master & patch',
        branches: ['master', patch],
      },
    ],
    requiredBaseCommits: {
      // PRs that target either `master` or the patch branch, need to be rebased
      // on top of the latest commit message validation fix.
      // These SHAs are the commits that update the required license text in the header.
      'master': '5aeb9a4124922d8ac08eb73b8f322905a32b0b3a',
      [patch]: '27b95ba64a5d99757f4042073fd1860e20e3ed24'
    },
  };
};
