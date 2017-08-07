import {readFileSync, writeFileSync} from 'fs';
import {platform} from 'os';
import {buildConfig} from './build-config';
import {spawnSync} from 'child_process';

/** Variable that is set to the string for version placeholders. */
const versionPlaceholderText = '0.0.0-PLACEHOLDER';

/** RegExp that matches version placeholders inside of a file. */
const versionPlaceholderRegex = new RegExp(versionPlaceholderText, 'g');

/**
 * Walks through every file in a directory and replaces the version placeholders with the current
 * version of Material.
 */
export function replaceVersionPlaceholders(packageDir: string) {
  // Resolve files that contain version placeholders using Grep or Findstr since those are
  // extremely fast and also have a very simple usage.
  const files = findFilesWithPlaceholders(packageDir);

  // Walk through every file that contains version placeholders and replace those with the current
  // version of the root package.json file.
  files.forEach(filePath => {
    let fileContent = readFileSync(filePath, 'utf-8');

    fileContent = fileContent.replace(versionPlaceholderRegex, buildConfig.projectVersion);

    writeFileSync(filePath, fileContent);
  });
}

/** Finds all files in the specified package dir where version placeholders are included. */
function findFilesWithPlaceholders(packageDir: string): string[] {
  const findCommand = buildPlaceholderFindCommand(packageDir);
  return spawnSync(findCommand.binary, findCommand.args).stdout
    .toString()
    .split(/[\n\r]/)
    .filter(String);
}

/** Builds the command that will be executed to find all files containing version placeholders. */
function buildPlaceholderFindCommand(packageDir: string) {
  if (platform() === 'win32') {
    return {
      binary: 'findstr',
      args: ['/msi', `/c:${versionPlaceholderText}`, `${packageDir}\\*`]
    };
  } else {
    return {
      binary: 'grep',
      args: ['-ril', versionPlaceholderText, packageDir]
    };
  }
}
