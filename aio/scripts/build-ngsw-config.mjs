// Imports
import cpath from 'canonical-path';
import {mkdirSync, readFileSync, writeFileSync} from 'fs';
import json5 from 'json5';
import url from 'url';

// Constants
const currentDir = cpath.dirname(url.fileURLToPath(import.meta.url));
const FIREBASE_CONFIG_PATH = cpath.resolve(currentDir, '../firebase.json');
const NGSW_CONFIG_TEMPLATE_PATH = cpath.resolve(currentDir, '../ngsw-config.template.json');
const NGSW_CONFIG_OUTPUT_PATH = cpath.resolve(currentDir, '../ngsw-config.json');

// Run
_main();

// Helpers
function _main() {
  // Allow an alternative output path (used by bazel to output to output dir)
  const ngswConfigOutputPath = process.argv.length > 2 ? process.argv[2] : NGSW_CONFIG_OUTPUT_PATH;

  const firebaseConfig = readJson(FIREBASE_CONFIG_PATH);
  const ngswConfig = readJson(NGSW_CONFIG_TEMPLATE_PATH);

  const firebaseRedirects = firebaseConfig.hosting.redirects;

  // Check that there are no regex-based redirects.
  const regexBasedRedirects = firebaseRedirects.filter(({regex}) => regex !== undefined);
  if (regexBasedRedirects.length > 0) {
    throw new Error(
      'The following redirects use `regex`, which is currently not supported by ' +
        `${basename(__filename)}:` +
        regexBasedRedirects.map((x) => `\n  - ${JSON.stringify(x)}`).join('')
    );
  }

  // Check that there are no unsupported glob characters/patterns.
  const redirectsWithUnsupportedGlobs = firebaseRedirects.filter(
    ({source}) => !/^(?:[/\w\-.*]|:\w+|@\([\w\-.|]+\))+$/.test(source)
  );
  if (redirectsWithUnsupportedGlobs.length > 0) {
    throw new Error(
      'The following redirects use glob characters/patterns that are currently not supported by ' +
        `${basename(__filename)}:` +
        redirectsWithUnsupportedGlobs.map((x) => `\n  - ${JSON.stringify(x)}`).join('')
    );
  }

  // Compute additional ignore glob patterns to be added to `navigationUrls`.
  const additionalNavigationUrls = firebaseRedirects
    // Grab the redirect source glob.
    .map(({source}) => source)
    // Ignore redirects for files (since these are already ignored by the SW).
    .filter((glob) => /\/[^/.]*$/.test(glob))
    // Convert each Firebase-specific glob to a SW-compatible glob.
    .map((glob) => `!${glob.replace(/:\w+/g, '*').replace(/@(\([\w\-.|]+\))/g, '$1')}`)
    // Add optional trailing `/` for globs that don't end with `*`.
    .map((glob) => (/\w$/.test(glob) ? `${glob}\/{0,1}` : glob))
    // Remove more specific globs that are covered by more generic ones.
    .filter((glob, _i, globs) => !isGlobRedundant(glob, globs))
    // Sort the generated globs alphabetically.
    .sort();

  // Add the additional `navigationUrls` globs and save the config.
  ngswConfig.navigationUrls.push(...additionalNavigationUrls);

  mkdirSync(cpath.dirname(ngswConfigOutputPath), {recursive: true});
  writeJson(ngswConfigOutputPath, ngswConfig);
}

function isGlobRedundant(glob, globs) {
  // Find all globs that could cover other globs.
  // For simplicity, we only consider globs ending with `/**`.
  const genericGlobs = globs.filter((g) => g.endsWith('/**'));

  // A glob is redundant if it starts with the path of a potentially generic glob (excluding the
  // trailing `**`) followed by a word character or a `*`.
  // For example, `/foo/bar/baz` is covered (and thus made redundant) by `/foo/**`, but `/foo/{0,1}`
  // is not.
  return genericGlobs.some((g) => {
    const pathPrefix = g.slice(0, -2);
    return (
      glob !== g && glob.startsWith(pathPrefix) && /^[\w*]/.test(glob.slice(pathPrefix.length))
    );
  });
}

function readJson(filePath) {
  return json5.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, obj) {
  return writeFileSync(filePath, `${JSON.stringify(obj, null, 2)}\n`);
}
