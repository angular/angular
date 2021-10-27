import sh from 'shelljs';
import u from './utils.mjs';


// Exports
const exp = {
  testNoActiveRcDeployment,
  testPwaScore,
};
Object.keys(u.ORIGINS).forEach(originLabel => {
  const testRedirectFn = generateFn_testRedirectTo(originLabel);
  exp[testRedirectFn.name] = testRedirectFn;
});
export default exp;

// Helpers
function generateFn_testRedirectTo(originLabel) {
  const destinationOrigin = u.ORIGINS[originLabel];
  const functionName = `testRedirectTo${originLabel}`;

  return u.nameFunction(functionName, function ({deployedUrl}) {
    u.logSectionHeader(`Verify deployed version redirects to '${destinationOrigin}'.`);

    // Ensure a request for `ngsw.json` is redirected to `<destinationOrigin>/ngsw.json`.
    testUrlRedirect('ngsw.json', deployedUrl, destinationOrigin);

    // Ensure a request for `foo/bar` is redirected to `<destinationOrigin>/foo/bar`.
    testUrlRedirect('foo/bar?baz=qux', deployedUrl, destinationOrigin);
  });
}

function testNoActiveRcDeployment({deployedUrl}) {
  const destinationOrigin = u.ORIGINS.Stable;

  u.logSectionHeader(
      `Verify deployed RC version redirects to '${destinationOrigin}' (and disables old ` +
      'ServiceWorker).');

  // Ensure a request for `ngsw.json` returns 404.
  testUrlNotFound('ngsw.json', deployedUrl);

  // Ensure a request for `foo/bar` is redirected to `https://angular.io/foo/bar`.
  testUrlRedirect('foo/bar?baz=qux', deployedUrl, destinationOrigin);
}

function testPwaScore({deployedUrl, minPwaScore}) {
  u.logSectionHeader('Run PWA-score tests.');
  u.yarn(`test-pwa-score "${deployedUrl}" "${minPwaScore}"`);
}

function testUrlNotFound(relativeUrl, sourceOrigin) {
  // Strip leading/trailing slashes.
  relativeUrl = relativeUrl.replace(/^\//, '');
  sourceOrigin = sourceOrigin.replace(/\/$/, '');

  const sourceUrl = `${sourceOrigin}/${relativeUrl}`;
  const expectedStatusCode = '404';

  const testScript = `https.get('${sourceUrl}', res => console.log(res.statusCode))`;
  const actualStatusCode = sh.exec(`node --eval "${testScript}"`, {silent: true}).trim();

  if (actualStatusCode !== expectedStatusCode) {
    throw new Error(
        `Expected '${sourceUrl}' to return a status code of '${expectedStatusCode}', but it ` +
        `returned '${actualStatusCode}'.`);
  }
}

function testUrlRedirect(relativeUrl, sourceOrigin, destinationOrigin) {
  // Strip leading/trailing slashes.
  relativeUrl = relativeUrl.replace(/^\//, '');
  sourceOrigin = sourceOrigin.replace(/\/$/, '');
  destinationOrigin = destinationOrigin.replace(/\/$/, '');

  const sourceUrl = `${sourceOrigin}/${relativeUrl}`;
  const expectedStatusCode = '302';
  const expectedDestinationUrl = `${destinationOrigin}/${relativeUrl}`;

  const testScript =
      `https.get('${sourceUrl}', res => console.log(res.statusCode, res.headers.location))`;
  const [actualStatusCode, actualDestinationUrl] =
      sh.exec(`node --eval "${testScript}"`, {silent: true}).trim().split(' ');

  if (actualStatusCode !== expectedStatusCode) {
    throw new Error(
        `Expected '${sourceUrl}' to return a status code of '${expectedStatusCode}', but it ` +
        `returned '${actualStatusCode}'.`);
  } else if (actualDestinationUrl !== expectedDestinationUrl) {
    const actualBehavior = (actualDestinationUrl === 'undefined') ?
      'not redirected' : `redirected to '${actualDestinationUrl}'`;
    throw new Error(
        `Expected '${sourceUrl}' to be redirected to '${expectedDestinationUrl}', but it was ` +
        `${actualBehavior}.`);
  }
}
