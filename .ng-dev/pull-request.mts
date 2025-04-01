import {PullRequestConfig} from '@angular/ng-dev';

/**
 * Configuration for the merge tool in `ng-dev`. This sets up the labels which
 * are respected by the merge script (e.g. the target labels).
 */
export const pullRequest: PullRequestConfig = {
  githubApiMerge: false,
  requiredBaseCommits: {
    // PRs that target either `main` or the patch branch, need to be rebased
    // on top of the latest commit message validation fix.
    // These SHAs are the commits that update the required license text in the header.
    'main': '5aeb9a4124922d8ac08eb73b8f322905a32b0b3a',
    '10.0.x': '27b95ba64a5d99757f4042073fd1860e20e3ed24',
  },
  // `dev-infra` and `docs-infra` are not affecting the public NPM packages. Similarly,
  // the `bazel` package is not considered part of the public API so that features
  // can land in patch branches.
  targetLabelExemptScopes: ['dev-infra', 'docs-infra', 'bazel'],
  // enables specific validations during the pull request merge process
  validators: {
    assertEnforceTested: true,
    assertIsolatedSeparateFiles: true,
  },

  requiredStatuses: [
    {type: 'check', name: 'test'},
    {type: 'check', name: 'lint'},
    {type: 'check', name: 'adev'},
    {type: 'check', name: 'zone-js'},
    {type: 'status', name: 'google-internal-tests'},
  ],
};
