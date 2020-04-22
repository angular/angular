module.exports = () => {
  const {major, minor} = parseVersion(require('./package').version);
  const patchBranch = `${major}.${minor}.x`;
  const minorBranch = `${major}.x`;

  return {
    projectRoot: __dirname,
    repository: {
      user: 'angular',
      name: 'components',
    },
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
        branches: ['master', patchBranch],
      },
      {
        pattern: 'target: minor',
        branches: ['master', minorBranch],
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
  }
};

/** Converts a version string into an object. */
function parseVersion(version) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(segment => Number(segment));
  return {major, minor, patch};
}
