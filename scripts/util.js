const path = require('path');
const shelljs = require('shelljs');

/** Map of common typos in target names. The key is the typo, the value is the correct form. */
const commonTypos = new Map([['snackbar', 'snack-bar']]);

// List of packages where the specified component could be defined in. The script uses the
// first package that contains the component (if no package is specified explicitly).
// e.g. "button" will become "material/button", and "overlay" becomes "cdk/overlay".
const orderedGuessPackages = ['material', 'cdk', 'material-experimental', 'cdk-experimental'];

/**
 * Tries to guess the full name of a package, based on a shorthand name.
 * Returns an object with the result of the guess and the names that were attempted.
 */
function guessPackageName(name, packagesDir) {
  name = correctTypos(name);

  // Build up a list of packages that we're going to try.
  const attempts = [name, ...orderedGuessPackages.map(package => path.join(package, name))];
  const result = attempts.find(guessName => shelljs.test('-d', path.join(packagesDir, guessName)));

  return {
    result: result ? convertPathToPosix(result) : null,
    attempts,
  };
}

/** Converts an arbitrary path to a Posix path. */
function convertPathToPosix(pathName) {
  return pathName.replace(/\\/g, '/');
}

/** Correct common typos in a target name */
function correctTypos(target) {
  let correctedTarget = target;
  for (const [typo, correction] of commonTypos) {
    correctedTarget = correctedTarget.replace(typo, correction);
  }

  return correctedTarget;
}

module.exports = {
  guessPackageName,
  convertPathToPosix,
};
