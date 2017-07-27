import {readFileSync, writeFileSync} from 'fs';
import {buildConfig} from './build-config';
import {spawnSync} from 'child_process';

/** Variable that is set to the string for version placeholders. */
const versionPlaceholderText = '0.0.0-PLACEHOLDER';

/** RegExp that matches version placeholders inside of a file. */
const versionPlaceholderRegex = new RegExp(versionPlaceholderText);

/**
 * Walks through every file in a directory and replaces the version placeholders with the current
 * version of Material.
 */
export function replaceVersionPlaceholders(packageDir: string) {
  // Resolve files that contain version placeholders using Grep since it's super fast and also
  // does have a very simple usage.
  const files = spawnSync('grep', ['-ril', versionPlaceholderText, packageDir]).stdout
    .toString()
    .split('\n')
    .filter(String);

  // Walk through every file that contains version placeholders and replace those with the current
  // version of the root package.json file.
  files.forEach(filePath => {
    let fileContent = readFileSync(filePath, 'utf-8');

    fileContent = fileContent.replace(versionPlaceholderRegex, buildConfig.projectVersion);

    writeFileSync(filePath, fileContent);
  });
}
