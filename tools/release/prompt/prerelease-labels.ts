import {Version} from '../version-name/parse-version';

/** Inquirer choice for selecting an alpha pre-release label. */
const ALPHA_CHOICE = {value: 'alpha', name: 'Alpha pre-release'};

/** Inquirer choice for selecting an beta pre-release label. */
const BETA_CHOICE = {value: 'beta', name: 'Beta pre-release'};

/** Inquirer choice for selecting a release candidate label. */
const RC_CHOICE = {value: 'rc', name: 'Release candidate'};

/**
 * Determines all allowed pre-release labels for a given version. For example, a
 * release-candidate version cannot be changed to an alpha or beta pre-release.
 */
export function determineAllowedPrereleaseLabels(version: Version) {
  const {prereleaseLabel} = version;

  if (!prereleaseLabel) {
    return [ALPHA_CHOICE, BETA_CHOICE, RC_CHOICE];
  } else if (prereleaseLabel === 'alpha') {
    return [BETA_CHOICE, RC_CHOICE];
  } else if (prereleaseLabel === 'beta') {
    return [RC_CHOICE];
  }

  return null;
}
