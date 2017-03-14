/** Whether gulp currently runs inside of Travis as a push. */
export function isTravisPushBuild() {
  return process.env['TRAVIS_PULL_REQUEST'] === 'false';
}
