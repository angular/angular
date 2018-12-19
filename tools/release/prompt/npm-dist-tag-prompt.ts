import {prompt} from 'inquirer';
import {Version} from '../version-name/parse-version';

/** Inquirer choice for selecting the "latest" npm dist-tag. */
const LATEST_TAG_CHOICE = {value: 'latest', name: 'Latest'};

/** Inquirer choice for selecting the "next" npm dist-tag. */
const NEXT_TAG_CHOICE = {value: 'next', name: 'Next'};

/**
 * Prompts the current user-input interface for a npm dist-tag. The provided npm-dist tag
 * will be validated against the specified version and prevents that any pre-releases
 * will be published under the "latest" npm dist tag. Read more about conventions for
 * NPM dist tags here: https://docs.npmjs.com/cli/dist-tag
 */
export async function promptForNpmDistTag(version: Version): Promise<string> {
  const {distTag} = await prompt<{distTag: string}>({
    type: 'list',
    name: 'distTag',
    message: 'What is the NPM dist-tag you want to publish to?',
    choices: getDistTagChoicesForVersion(version),
  });

  return distTag;
}

/**
 * Determines all allowed npm dist-tag choices for a specified version. For example,
 * a pre-release version should be never published to the "latest" tag.
 */
export function getDistTagChoicesForVersion(version: Version) {
  const {prereleaseLabel} = version;

  if (!prereleaseLabel) {
    return [LATEST_TAG_CHOICE, NEXT_TAG_CHOICE];
  }

  return [NEXT_TAG_CHOICE];
}

