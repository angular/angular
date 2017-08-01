/**
 * List of cdk entry-points in the order that they must be built. This is necessary because
 * some of the entry-points depend on each other. This is temporary until we switch to bazel.
 */
const CDK_ENTRY_POINTS = [
  'coercion',
  'rxjs',
  'keyboard',
  'platform',
  'bidi',
  'table',
  'portal',
  'observe-content',
  'a11y',
];

/**
 * Gets secondary entry-points for a given package.
 *
 * This currently assumes that every directory under a package should be an entry-point. This may
 * not always be desired, in which case we can add an extra build configuration for specifying the
 * entry-points.
 *
 * @param packageName The package name for which to get entry points, e.g., 'cdk'.
 * @returns An array of secondary entry-points names, e.g., ['a11y', 'bidi', ...]
 */
export function getSecondaryEntryPointsForPackage(packageName: string) {
  // For now, we hard-code the fact that only the CDK has secondary entry-points until we switch
  // to bazel.
  if (packageName === 'cdk') {
    return CDK_ENTRY_POINTS;
  }

  return [];
}
