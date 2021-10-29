import sh from 'shelljs';
import u from './utils.mjs';


// Exports
const exp = {
  build,
  checkPayloadSize,
  disableServiceWorker,
  redirectToAngularIo,
};
export default exp;

// Helpers
function build({deployedUrl, deployEnv}) {
  u.logSectionHeader('Build the AIO app.');
  u.yarn(`build --configuration=${deployEnv} --progress=false`);

  u.logSectionHeader('Add any mode-specific files into the AIO distribution.');
  sh.cp('-rf', `src/extra-files/${deployEnv}/.`, 'dist/');

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
  sh.mv('dist/ngsw.json', 'dist/ngsw.json.bak');
}

function redirectToAngularIo() {
  u.logSectionHeader('Configure Firebase hosting to redirect to https://angular.io/.');

  // Update the Firebase hosting configuration to redirect all non-file requests (i.e. requests that
  // do not contain a dot in their last path segment) to `angular.io`.
  // See https://firebase.google.com/docs/hosting/full-config#redirects.
  const redirectRule =
      '{"type": 302, "regex": "^(.*/[^./]*)$", "destination": "https://angular.io:1"}';
  sh.sed('-i', /(\s*)"redirects": \[/, `$&\n$1  ${redirectRule},\n`, 'firebase.json');
}
