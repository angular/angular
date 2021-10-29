import fs from 'fs';
import sh from 'shelljs';
import u from './utils.mjs';


// Constants
const DIST_DIR = 'dist';
const FIREBASE_JSON_PATH = 'firebase.json';
const NGSW_JSON_PATH = `${DIST_DIR}/ngsw.json`;
const NGSW_JSON_BAK_PATH = `${NGSW_JSON_PATH}.bak`;

// Exports
const exp = {
  build,
  checkPayloadSize,
  disableServiceWorker,
  redirectToAngularIo,
  undo: {
    build: undoBuild,
    checkPayloadSize: undoCheckPayloadSize,
    disableServiceWorker: undoDisableServiceWorker,
    redirectToAngularIo: undoRedirectToAngularIo,
  },
};
export default exp;

// Helpers
function build({deployedUrl, deployEnv}) {
  u.logSectionHeader('Build the AIO app.');
  u.yarn(`build --configuration=${deployEnv} --progress=false`);

  u.logSectionHeader('Add any mode-specific files into the AIO distribution.');
  sh.cp('-rf', `src/extra-files/${deployEnv}/.`, DIST_DIR);

  u.logSectionHeader('Update opensearch descriptor for AIO with `deployedUrl`.');
  u.yarn(`set-opensearch-url ${deployedUrl.replace(/[^/]$/, '$&/')}`); // The URL must end with `/`.
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

function getFirebaseRedirectRuleTo(origin) {
  return `{"type": 302, "regex": "^(.*/[^./]*)$", "destination": "${origin}:1"}`;
}

function redirectToAngularIo() {
  u.logSectionHeader('Configure Firebase hosting to redirect to https://angular.io/.');

  // Update the Firebase hosting configuration to redirect all non-file requests (i.e. requests that
  // do not contain a dot in their last path segment) to `angular.io`.
  // See https://firebase.google.com/docs/hosting/full-config#redirects.
  const redirectRule = getFirebaseRedirectRuleTo('https://angular.io');
  const oldContent = fs.readFileSync(FIREBASE_JSON_PATH, 'utf8');
  const newContent = oldContent.replace(/( *)"redirects": \[/, `$&\n$1  ${redirectRule},\n`);

  fs.writeFileSync(FIREBASE_JSON_PATH, newContent);
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

function undoRedirectToAngularIo() {
  u.logSectionHeader('Remove Firebase hosting redirect to https://angular.io/.');

  const redirectRule = getFirebaseRedirectRuleTo('https://angular.io');
  const oldContent = fs.readFileSync(FIREBASE_JSON_PATH, 'utf8');
  const newContent = oldContent.replace(
      new RegExp(`(( *)"redirects": \\[)\\n\\2  ${escapeForRegex(redirectRule)},\\n`),
      '$1');

  fs.writeFileSync(FIREBASE_JSON_PATH, newContent);
}
