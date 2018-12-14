import {ChoiceType, prompt} from 'inquirer';
import {createNewVersion, ReleaseType} from '../version-name/create-version';
import {parseVersionName, Version} from '../version-name/parse-version';
import {determineAllowedPrereleaseLabels} from './prerelease-labels';

/** Answers that will be prompted for. */
type VersionPromptAnswers = {
  proposedVersion: string;
  isPrerelease: boolean;
  prereleaseLabel: string;
};

/**
 * Prompts the current user-input interface for a new version name. The new version will be
 * validated to be a proper increment of the specified current version.
 */
export async function promptForNewVersion(currentVersion: Version): Promise<Version> {
  const allowedPrereleaseChoices = determineAllowedPrereleaseLabels(currentVersion);
  const versionChoices: ChoiceType[] = [];

  if (currentVersion.prereleaseLabel) {
    versionChoices.push(
      createVersionChoice(currentVersion, 'stable-release', 'Stable release'),
      createVersionChoice(currentVersion, 'bump-prerelease', 'Bump pre-release number'));

    // Only add the option to change the prerelease label if the current version can be
    // changed to a new label. e.g. a version that is already marked as release candidate
    // shouldn't be changed to a beta or alpha version.
    if (allowedPrereleaseChoices) {
      versionChoices.push({
        value: 'new-prerelease-label',
        name: `New pre-release (${allowedPrereleaseChoices.map(c => c.value).join(', ')})`
      });
    }
  } else {
    versionChoices.push(
      createVersionChoice(currentVersion, 'major', 'Major release'),
      createVersionChoice(currentVersion, 'minor', 'Minor release'),
      createVersionChoice(currentVersion, 'patch', 'Patch release'));
  }

  const answers = await prompt<VersionPromptAnswers>([{
    type: 'list',
    name: 'proposedVersion',
    message: `What's the type of the new release?`,
    choices: versionChoices,
  }, {
    type: 'confirm',
    name: 'isPrerelease',
    message: 'Should this be a pre-release?',
    // Prompt whether this should a pre-release if the current release is not a pre-release
    when: !currentVersion.prereleaseLabel,
    default: false,
  }, {
    type: 'list',
    name: 'prereleaseLabel',
    message: 'Please select a pre-release label:',
    choices: allowedPrereleaseChoices,
    when: ({isPrerelease, proposedVersion}) =>
      // Only prompt for selecting a pre-release label if the current release is a pre-release,
      // or the existing pre-release label should be changed.
      isPrerelease || proposedVersion === 'new-prerelease-label',
  }]);

  // In case the new version just changes the pre-release label, we base the new version
  // on top of the current version. Otherwise, we use the proposed version from the
  // prompt answers.
  const newVersion = answers.proposedVersion === 'new-prerelease-label' ?
      currentVersion.clone() :
      parseVersionName(answers.proposedVersion);

  if (answers.prereleaseLabel) {
    newVersion.prereleaseLabel = answers.prereleaseLabel;
    newVersion.prereleaseNumber = 0;
  }

  return newVersion;
}

/** Creates a new choice for selecting a version inside of an Inquirer list prompt. */
function createVersionChoice(currentVersion: Version, releaseType: ReleaseType, message: string) {
  const versionName = createNewVersion(currentVersion, releaseType).format();

  return {
    value: versionName,
    name: `${message} (${versionName})`
  };
}
