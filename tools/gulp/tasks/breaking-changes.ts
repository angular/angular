import {task} from 'gulp';
import {join, relative} from 'path';
import {readFileSync} from 'fs';
import {bold, red, green} from 'chalk';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';
import {buildConfig} from '../../package-tools/build-config';

// Current version from the package.json. Splits it on the dash to ignore `-beta.x` suffixes.
const packageVersion = require(join(buildConfig.projectDir, 'package.json')).version.split('-')[0];

// Regex used to extract versions from a string.
const versionRegex = /\d+\.\d+\.\d+/;

/**
 * Goes through all of the TypeScript files in the project and puts
 * together a summary of all of the pending and expired breaking changes.
 */
task('breaking-changes', () => {
  const projectDir = buildConfig.projectDir;
  const configFile = ts.readJsonConfigFile(join(projectDir, 'tsconfig.json'), ts.sys.readFile);
  const parsedConfig = ts.parseJsonSourceFileConfigFileContent(configFile, ts.sys, projectDir);
  const summary: {[version: string]: string[]} = {};

  // Go through all the TS files in the project.
  parsedConfig.fileNames.forEach(fileName => {
    const sourceFile = ts.createSourceFile(fileName, readFileSync(fileName, 'utf8'),
        configFile.languageVersion);
    const lineRanges = tsutils.getLineRanges(sourceFile);

    // Go through each of the comments of the file.
    tsutils.forEachComment(sourceFile, (file, range) => {
      const comment = file.substring(range.pos, range.end);
      const versionMatch = comment.match(versionRegex);

      // Don't do any extra work if the comment doesn't indicate a breaking change.
      if (!versionMatch || comment.indexOf('@breaking-change') === -1) {
        return;
      }

      // Use a path relative to the project root, in order to make the summary more tidy.
      // Also replace escaped Windows slashes with regular forward slashes.
      const pathInProject = relative(projectDir, sourceFile.fileName).replace(/\\/g, '/');
      const [version] = versionMatch;

      summary[version] = summary[version] || [];
      summary[version].push(`  ${pathInProject}: ${formatMessage(comment, range, lineRanges)}`);
    });
  });

  // Go through the summary and log out all of the breaking changes.
  Object.keys(summary).forEach(version => {
    const isExpired = hasExpired(packageVersion, version);
    const status = isExpired ? red('(expired)') : green('(not expired)');
    const header = bold(`Breaking changes for ${version} ${status}:`);
    const messages = summary[version].join('\n');

    console.log(isExpired ? red(header) : header);
    console.log(isExpired ? red(messages) : messages, '\n');
  });
});

/**
 * Formats a message to be logged out in the breaking changes summary.
 * @param comment Contents of the comment that contains the breaking change.
 * @param commentRange Object containing info on the position of the comment in the file.
 * @param lines Ranges of the lines of code in the file.
 */
function formatMessage(comment: string, commentRange: ts.CommentRange, lines: tsutils.LineRange[]) {
  const lineNumber = lines.findIndex(line => line.pos > commentRange.pos);
  const messageMatch = comment.match(/@deprecated(.*)|@breaking-change(.*)/);
  const message = messageMatch ? messageMatch[0] : '';
  const cleanMessage = message
    .replace(/[\*\/\r\n]|@[\w-]+/g, '')
    .replace(versionRegex, '')
    .trim();

  return `Line ${lineNumber}, ${cleanMessage || 'No message'}`;
}


/** Converts a version string into an object. */
function parseVersion(version: string) {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(segment => parseInt(segment));
  return {major, minor, patch};
}


/**
 * Checks whether a version has expired, based on the current version.
 * @param currentVersion Current version of the package.
 * @param breakingChange Version that is being checked.
 */
function hasExpired(currentVersion: string, breakingChange: string) {
  if (currentVersion === breakingChange) {
    return true;
  }

  const current = parseVersion(currentVersion);
  const target = parseVersion(breakingChange);

  return target.major < current.major ||
        (target.major === current.major && target.minor < current.minor) ||
        (
          target.major === current.major &&
          target.minor === current.minor &&
          target.patch < current.patch
        );
}
