/** Whether gulp currently runs inside of Travis as a push. */
export function isTravisMasterBuild() {
  return process.env['TRAVIS_PULL_REQUEST'] === 'false';
}

export function isTravisBuild() {
  return process.env['TRAVIS'] === 'true';
}
