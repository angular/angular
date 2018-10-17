import {ChoiceType, prompt, Separator} from 'inquirer';
import {createNewVersion, ReleaseType} from '../version-name/create-version';
import {parseVersionName, Version} from '../version-name/parse-version';

/** Answers that will be prompted for. */
type VersionPromptAnswers = {
  versionName: string;
  manualCustomVersion: string;
};

/**
 * Prompts the current user-input interface for a new version name. The new version will be
 * validated to be a proper increment of the specified current version.
 */
export async function promptForNewVersion(currentVersion: Version): Promise<Version> {
  const versionChoices: ChoiceType[] = [
    new Separator(),
    {value: 'custom-release', name: 'Release w/ custom version'}
  ];

  if (currentVersion.prereleaseLabel) {
    versionChoices.unshift(
      createVersionChoice(currentVersion, 'pre-release', 'Pre-release'),
      createVersionChoice(currentVersion, 'stable-release', 'Stable release'));
  } else {
    versionChoices.unshift(
      createVersionChoice(currentVersion, 'major', 'Major release'),
      createVersionChoice(currentVersion, 'minor', 'Minor release'),
      createVersionChoice(currentVersion, 'patch', 'Patch release'));
  }

  const answers = await prompt<VersionPromptAnswers>([{
    type: 'list',
    name: 'versionName',
    message: `What's the type of the new release?`,
    choices: versionChoices,
  }, {
    type: 'input',
    name: 'manualCustomVersion',
    message: 'Please provide a custom release name:',
    validate: enteredVersion =>
      !!parseVersionName(enteredVersion) || 'This is not a valid Semver version',
    when: ({versionName}) => versionName === 'custom-release'
  }]);

  return parseVersionName(answers.manualCustomVersion || answers.versionName);
}

/** Creates a new choice for selecting a version inside of an Inquirer list prompt. */
function createVersionChoice(currentVersion: Version, releaseType: ReleaseType, message: string) {
  const versionName = createNewVersion(currentVersion, releaseType).format();

  return {
    value: versionName,
    name: `${message} (${versionName})`
  };
}
