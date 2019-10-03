import {Version} from '../version-name/parse-version';


/** Inquirer choice for selecting an beta pre-release label. */
const NEXT_CHOICE = {value: 'next', name: '"Next"" pre-release'};

/** Inquirer choice for selecting a release candidate label. */
const RC_CHOICE = {value: 'rc', name: 'Release candidate'};

/**
 * Determines all allowed pre-release labels for a given version. For example, a
 * release-candidate version cannot be changed to an alpha or beta pre-release.
 */
export function determineAllowedPrereleaseLabels(version: Version) {
  const {prereleaseLabel} = version;

  if (!prereleaseLabel) {
    return [NEXT_CHOICE, RC_CHOICE];
  } else if (prereleaseLabel === 'next') {
    return [RC_CHOICE];
  }

  return null;
}
