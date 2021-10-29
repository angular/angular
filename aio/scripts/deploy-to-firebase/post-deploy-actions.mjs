import sh from 'shelljs';
import u from './utils.mjs';


// Exports
const exp = {
  testNoActiveRcDeployment,
  testPwaScore,
};
export default exp;

// Helpers
function testNoActiveRcDeployment({deployedUrl}) {
  u.logSectionHeader(
      'Verify deployed RC version redirects to stable (and disables old ServiceWorker).');

  const deployedOrigin = deployedUrl.replace(/\/$/, '');

  // Ensure a request for `ngsw.json` returns 404.
  const ngswJsonUrl = `${deployedOrigin}/ngsw.json`;
  const ngswJsonScript = `https.get('${ngswJsonUrl}', res => console.log(res.statusCode))`;
  const ngswJsonActualStatusCode =
      sh.exec(`node --eval "${ngswJsonScript}"`, {silent: true}).trim();
  const ngswJsonExpectedStatusCode = '404';

  if (ngswJsonActualStatusCode !== ngswJsonExpectedStatusCode) {
    throw new Error(
        `Expected '${ngswJsonUrl}' to return a status code of '${ngswJsonExpectedStatusCode}', ` +
        `but it returned '${ngswJsonActualStatusCode}'.`);
  }

  // Ensure a request for `foo/bar` is redirected to `https://angular.io/foo/bar`.
  const fooBarUrl = `${deployedOrigin}/foo/bar?baz=qux`;
  const fooBarScript =
      `https.get('${fooBarUrl}', res => console.log(res.statusCode, res.headers.location))`;
  const [fooBarActualStatusCode, fooBarActualRedirectUrl] =
      sh.exec(`node --eval "${fooBarScript}"`, {silent: true}).trim().split(' ');
  const fooBarExpectedStatusCode = '302';
  const fooBarExpectedRedirectUrl = 'https://angular.io/foo/bar?baz=qux';

  if (fooBarActualStatusCode !== fooBarExpectedStatusCode) {
    throw new Error(
        `Expected '${fooBarUrl}' to return a status code of '${fooBarExpectedStatusCode}', but ` +
        `it returned '${fooBarActualStatusCode}'.`);
  } else if (fooBarActualRedirectUrl !== fooBarExpectedRedirectUrl) {
    const actualBehavior = (fooBarActualRedirectUrl === 'undefined') ?
      'not redirected' : `redirected to '${fooBarActualRedirectUrl}'`;
    throw new Error(
        `Expected '${fooBarUrl}' to be redirected to '${fooBarExpectedRedirectUrl}', but it was ` +
        `${actualBehavior}.`);
  }
}

function testPwaScore({deployedUrl, minPwaScore}) {
  u.logSectionHeader('Run PWA-score tests.');
  u.yarn(`test-pwa-score "${deployedUrl}" "${minPwaScore}"`);
}
