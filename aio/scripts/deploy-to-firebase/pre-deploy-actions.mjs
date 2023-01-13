import fs from 'fs';
import sh from 'shelljs';
import u from './utils.mjs';


// Constants
const BAZEL_DIST_DIR = '../dist/bin/aio/build';
const DIST_DIR = 'dist';
const FIREBASE_JSON_PATH = 'firebase.json';
const NGSW_JSON_PATH = `${DIST_DIR}/ngsw.json`;
const NGSW_JSON_BAK_PATH = `${NGSW_JSON_PATH}.bak`;

// Exports
const exp = {
  build,
  checkPayloadSize,
  disableServiceWorker,
  undo: {
    build: undoBuild,
    checkPayloadSize: undoCheckPayloadSize,
    disableServiceWorker: undoDisableServiceWorker,
  },
};
Object.keys(u.ORIGINS).forEach(originLabel => {
  [true, false].forEach(allRequests => {
    const redirectFn = generateFn_redirectTo(originLabel, allRequests);
    const undoRedirectFn = generateFn_undoRedirectTo(originLabel, allRequests);

    exp[redirectFn.name] = redirectFn;
    exp.undo[redirectFn.name] = undoRedirectFn;
  });
});
export default exp;

// Helpers
function build({deployedUrl, deployEnv}) {
  u.logSectionHeader('Build the AIO app.');
  u.yarn(`build-prod --aio_build_config=${deployEnv}`);

  u.logSectionHeader('Remove write protection on the Bazel AIO distribution.');
  sh.chmod('-R', 'u+w', BAZEL_DIST_DIR);

  u.logSectionHeader('Update opensearch descriptor for AIO with `deployedUrl`.');
  u.yarn(`set-opensearch-url ${deployedUrl.replace(/[^/]$/, '$&/')}`); // The URL must end with `/`.

  // Firebase requires that the distributable be in the same folder as firebase.json.
  u.logSectionHeader('Copy AIO distributable from Bazel output tree to aio/dist.');
  sh.cp('-rf', BAZEL_DIST_DIR, DIST_DIR);

  u.logSectionHeader('Add any mode-specific files into the AIO distribution.');
  sh.cp('-rf', `src/extra-files/${deployEnv}/.`, DIST_DIR);
}

function checkPayloadSize() {
  u.logSectionHeader('Check payload size and upload the numbers to Firebase DB.');
  u.yarn('payload-size');
}

function disableServiceWorker() {
  u.logSectionHeader('Disable the ServiceWorker.');

  // Rename the SW manifest (`ngsw.json`). This will cause the ServiceWorker to unregister itself.
  // See https://angular.io/guide/service-worker-devops#fail-safe.
  sh.mv(NGSW_JSON_PATH, NGSW_JSON_BAK_PATH);
}

function escapeForRegex(str) {
  return str.replace(/[.?*+\\|^$()[\]{}]/g, '\\$&');
}

function generateFn_redirectTo(originLabel, allRequests) {
  const destinationOrigin = u.ORIGINS[originLabel];
  const functionName = `redirect${allRequests ? 'All' : 'NonFiles'}To${originLabel}`;

  return u.nameFunction(functionName, function () {
    u.logSectionHeader(
        `Configure Firebase hosting to redirect ${allRequests ? 'all' : 'non-file'} requests ` +
        `to '${destinationOrigin}'.`);

    // Update the Firebase hosting configuration to redirect requests to the specific origin.
    // If `excludeFileRequests` is `true`, only redirect non-file requests, i.e. requests that
    // do not contain a dot in their last path segment.
    // See also https://firebase.google.com/docs/hosting/full-config#redirects.
    const redirectRule = getFirebaseRedirectRuleTo(destinationOrigin, allRequests);
    const oldContent = fs.readFileSync(FIREBASE_JSON_PATH, 'utf8');
    const newContent = oldContent.replace(/( *)"redirects": \[/, `$&\n$1  ${redirectRule},\n`);

    fs.writeFileSync(FIREBASE_JSON_PATH, newContent);
  });
}

function generateFn_undoRedirectTo(originLabel, allRequests) {
  const destinationOrigin = u.ORIGINS[originLabel];
  const functionName = `undoRedirect${allRequests ? 'All' : 'NonFiles'}To${originLabel}`;

  return u.nameFunction(functionName, function () {
    u.logSectionHeader(
        `Remove Firebase hosting redirect for ${allRequests ? 'all' : 'non-file'} requests to ` +
        `'${destinationOrigin}'.`);

    const redirectRule = getFirebaseRedirectRuleTo(destinationOrigin, allRequests);
    const oldContent = fs.readFileSync(FIREBASE_JSON_PATH, 'utf8');
    const newContent = oldContent.replace(
        new RegExp(`(( *)"redirects": \\[)\\n\\2  ${escapeForRegex(redirectRule)},\\n`),
        '$1');

    fs.writeFileSync(FIREBASE_JSON_PATH, newContent);
  });
}

function getFirebaseRedirectRuleTo(origin, allRequests) {
  const re = allRequests ? '^(.*)$' : '^(.*/[^./]*)$';
  return `{"type": 302, "regex": "${re}", "destination": "${origin}:1"}`;
}

function undoBuild() {
  u.logSectionHeader('Remove the build artifacts.');
  sh.rm('-rf', DIST_DIR);
}

function undoCheckPayloadSize() {
  // Nothing to undo.
}

function undoDisableServiceWorker() {
  u.logSectionHeader('Re-enable the ServiceWorker.');
  sh.mv(NGSW_JSON_BAK_PATH, NGSW_JSON_PATH);
}
