import {writeFile} from 'fs/promises';
import {dirname, join} from 'path';
import {argv} from 'process';
import {fileURLToPath} from 'url';

// PATHS
const ASSETS = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/assets',
);
const VERSIONS_CONFIG = 'versions.json';
const VERSIONS_CONFIG_PATH = join(ASSETS, VERSIONS_CONFIG);

// ARGS
const MODE_ARG = 'mode=';
const VERSION_ARG = 'version=';

const VERSION_PATTERN_PLACEHOLDER = '{{version}}';

// Version Mode
const VERSION_MODE = {
  STABLE: 'stable',
  RC: 'rc',
  NEXT: 'next',
  DEPRECATED: 'deprecated'
};

// ADEV
const INITIAL_ADEV_DOCS_VERSION = 17;
const ADEV_VERSIONS_LINK_PATTERN = `https://${VERSION_PATTERN_PLACEHOLDER}.angular.dev`;

// AIO
const AIO_DOCS_VERSIONS = [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const AIO_VERSIONS_LINK_PATTERN = `https://${VERSION_PATTERN_PLACEHOLDER}.angular.io/docs`;

main();

/**
 * Script is responsible for generate list of all Angular docs versions.
 * ARGS:
 *  - mode - it could be 'stable', 'rc', 'next' or 'deprecated'
 *  - version - numeric number of current docs version
 */
async function main() {
  console.info('Updating version...');

  const currentVersionMode = getCurrentVersionMode() ?? 'stable';
  const currentVersion = getCurrentVersion() ?? -1;

  if (
    currentVersionMode !== VERSION_MODE.NEXT &&
    currentVersionMode !== VERSION_MODE.RC &&
    currentVersionMode !== VERSION_MODE.STABLE &&
    currentVersionMode !== VERSION_MODE.DEPRECATED
  ) {
    throw new Error('Invalid mode value provided!');
  }

  if (Number.isNaN(currentVersion)) {
    throw new Error('Invalid version provided!');
  }

  const versionsConfig = {
    currentVersion: currentVersion,
    currentVersionMode: currentVersionMode,
    versions: [...getCurrentVersions(currentVersion, currentVersionMode), ...getPreviousAdevVersions(currentVersion), ...getAioVersions()]
  };

  await updateConfig(versionsConfig);

  console.info('Updating version successfully done!');
}

async function updateConfig(config) {
  await writeFile(VERSIONS_CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}

function getCurrentVersionMode() {
  return argv.find((arg) => arg.startsWith(MODE_ARG))?.replaceAll(MODE_ARG, '');
}

function getCurrentVersion() {
  return Number(argv.find((arg) => arg.startsWith(VERSION_ARG))?.replaceAll(VERSION_ARG, ''));
}

function getAioVersions() {
  return AIO_DOCS_VERSIONS.map(version => createVersion(version, VERSION_MODE.DEPRECATED, AIO_VERSIONS_LINK_PATTERN)).reverse();
}

function getPreviousAdevVersions(currentVersion) {
  const adevVersions = [];

  for (let version = currentVersion - 1; version >= INITIAL_ADEV_DOCS_VERSION; version--) {
    adevVersions.push(
      createVersion(version, VERSION_MODE.DEPRECATED, ADEV_VERSIONS_LINK_PATTERN)
    );
  }
  return adevVersions;
}

function getCurrentVersions(currentVersion, currentVersionMode) {
  if (currentVersionMode === VERSION_MODE.DEPRECATED) {
    return [
      createVersion(currentVersion, VERSION_MODE.DEPRECATED, ADEV_VERSIONS_LINK_PATTERN)
    ];
  }
  return [
    createVersion(currentVersion, VERSION_MODE.RC, ADEV_VERSIONS_LINK_PATTERN),
    createVersion(currentVersion, VERSION_MODE.NEXT, ADEV_VERSIONS_LINK_PATTERN),
    createVersion(currentVersion, VERSION_MODE.STABLE, ADEV_VERSIONS_LINK_PATTERN)
  ];
}

function createVersion(version, versionMode, pattern) {
  const displayName = versionMode === VERSION_MODE.RC || versionMode === VERSION_MODE.NEXT
    ? versionMode
    : `v${version}`;
  return {
    url: getDocsUrl(version, versionMode, pattern),
    version: version,
    displayName: displayName
  }
}

function getDocsUrl(version, versionMode, pattern) {
  if (versionMode === VERSION_MODE.RC || versionMode === VERSION_MODE.NEXT) {
    return pattern.replace(
      VERSION_PATTERN_PLACEHOLDER,
      versionMode,
    );
  }

  return pattern.replace(
    VERSION_PATTERN_PLACEHOLDER,
    `v${version}`,
  );
}

