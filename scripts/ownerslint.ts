import * as chalk from 'chalk';
import {readdirSync, readFileSync, statSync} from 'fs';
import {IMinimatch, Minimatch} from 'minimatch';
import {join} from 'path';

/**
 * Script that lints the CODEOWNERS file and makes sure that all files have an owner.
 */

/** Path for the Github owners file. */
const ownersFilePath = '.github/CODEOWNERS';

/** Path for the .gitignore file. */
const gitIgnorePath = '.gitignore';

let errors = 0;
const ownedPaths = readFileSync(ownersFilePath, 'utf8').split('\n')
    // Trim lines.
    .map(line => line.trim())
    // Remove empty lines and comments.
    .filter(line => line && !line.startsWith('#'))
    // Split off just the path glob.
    .map(line => line.split(/\s+/)[0])
    // Turn paths into Minimatch objects.
    .map(path => new Minimatch(path, {dot: true, matchBase: true}));

const ignoredPaths = readFileSync(gitIgnorePath, 'utf8').split('\n')
    // Trim lines.
    .map(line => line.trim())
    // Remove empty lines and comments.
    .filter(line => line && !line.startsWith('#'))
    // Turn paths into Minimatch objects.
    .map(path => new Minimatch(path, {dot: true, matchBase: true}));

for (let paths = getChildPaths('.'); paths.length;) {
  paths = Array.prototype.concat(...paths
      // Remove ignored paths
      .filter(path => !ignoredPaths.reduce(
          (isIgnored, ignoredPath) => isIgnored || ignoredPath.match('/' + path), false))
      // Remove paths that match an owned path.
      .filter(path => !ownedPaths.reduce(
          (isOwned, ownedPath) => isOwned || isOwnedBy(path, ownedPath), false))
      // Report an error for any files that didn't match any owned paths.
      .filter(path => {
        if (statSync(path).isFile()) {
          console.log(chalk.red(`No code owner found for "${path}".`));
          errors++;
          return false;
        }
        return true;
      })
      // Get the next level of children for any directories.
      .map(path => getChildPaths(path)));
}

if (errors) {
  throw Error(`Found ${errors} files with no owner. Code owners for the files ` +
              `should be added in the CODEOWNERS file.`);
}

/** Check if the given path is owned by the given owned path matcher. */
function isOwnedBy(path: string, ownedPath: IMinimatch) {
  // If the owned path ends with `**` its safe to eliminate whole directories.
  if (ownedPath.pattern.endsWith('**') || statSync(path).isFile()) {
    return ownedPath.match('/' + path);
  }
  return false;
}

/** Get the immediate child paths of the given path. */
function getChildPaths(path: string) {
  return readdirSync(path).map(child => join(path, child));
}
