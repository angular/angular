import {readFileSync} from 'fs';

/** Extracts the release notes for a specific release from a given changelog file. */
export function extractReleaseNotes(changelogPath: string, versionName: string) {
  const changelogContent = readFileSync(changelogPath, 'utf8');
  const escapedVersion = versionName.replace('.', '\\.');

  // Regular expression that matches the release notes for the given version. Note that we specify
  // the "s" RegExp flag so that the line breaks will be ignored within our regex. We determine the
  // section of a version by starting with the release header which can either use the markdown
  // "h1" or "h2" syntax. The end of the section will be matched by just looking for the first
  // subsequent release header.
  const releaseNotesRegex = new RegExp(
      `(##? ${escapedVersion} "(.*?)" \\(.*?)##? \\d+\\.\\d+`, 's');
  const matches = releaseNotesRegex.exec(changelogContent);

  return matches ? {
    releaseTitle: matches[2],
    releaseNotes: matches[1].trim(),
  } : null;
}
