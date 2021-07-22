/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview
 * Script that fetches the latest revision currently in the "stable" channel of Chromium.
 * It then checks if build artifacts on the CDN exist for that revision. If there are missing
 * build artifacts, it looks for more recent revisions, starting from the determined revision
 * in the stable channel, and checks if those have build artifacts. This allows us to determine
 * a Chromium revision that is as close as possible to the "stable" channel and we have CDN
 * artifacts available for each supported platform.
 *
 * This is needed because Chromium does not build artifacts for every revision. See:
 * https://github.com/puppeteer/puppeteer/issues/2567#issuecomment-393436282
 *
 * Note: An explicit revision can be specified as command line argument. This allows
 * for finding snapshot builds if a revision is already known. e.g. consider a case
 * where a specific Chromium bug (needed for the Angular org) is fixed but is ahead
 * of the current revision in the stable channel. We still may want to update Chromium
 * to a revision ahead of the specified revision for which snapshot builds exist.
 */

import {createHash} from 'crypto';
import fetch from 'node-fetch';
import * as Ora from 'ora';

/**
 * Enum describing browser platforms this script considers. The
 * value for each browser maps to the key being used by the Chromium buildbot.
 * See: https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html.
 */
enum BrowserPlatform {
  LINUX = 'Linux_x64',
  MAC = 'Mac',
  WINDOWS = 'Win',
}

/** Maps a browser platform to the archive file containing the browser binary. */
const PlatformBrowserArchiveMap = {
  [BrowserPlatform.LINUX]: 'chrome-linux.zip',
  [BrowserPlatform.MAC]: 'chrome-mac.zip',
  [BrowserPlatform.WINDOWS]: 'chrome-win.zip',
};

/** Maps a browser platform to the archive file containing the driver. */
const PlatformDriverArchiveMap = {
  [BrowserPlatform.LINUX]: 'chromedriver_linux64.zip',
  [BrowserPlatform.MAC]: 'chromedriver_mac64.zip',
  [BrowserPlatform.WINDOWS]: 'chromedriver_win32.zip',
};

const cloudStorageHeadRevisionUrl =
    `https://storage.googleapis.com/chromium-browser-snapshots/{platform}/LAST_CHANGE`;
const cloudStorageArchiveUrl =
    'https://storage.googleapis.com/chromium-browser-snapshots/{platform}/{revision}/{file}';

if (require.main === module) {
  const explicitStartRevision = Number(process.argv[2]) || null;
  main(explicitStartRevision).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

/**
 * Entry-point for the script, finding a revision which has snapshot builds for all platforms.
 * If an explicit start revision has been specified, this function looks for a closest
 * revision that is available for all platforms. If none has been specified, we look for
 * a revision that is as close as possible to the revision in the stable release channel.
 */
async function main(explicitStartRevision: number|null): Promise<void> {
  const availableRevision =
      explicitStartRevision !== null ? await findClosestAscendingRevisionForAllPlatforms(explicitStartRevision) :
                                       await findClosestStableRevisionForAllPlatforms();

  if (availableRevision === null) {
    console.error('Could not find a revision for which builds are available for all platforms.');
    process.exit(1);
  }

  console.info('Found a revision for which builds are available for all platforms.');
  console.info('Printing the URLs and archive checksums:');
  console.info();
  // Note: We cannot extract the Chromium version and commit automatically because
  // this requires an actual browser resolving a manual `window.open` redirect.
  console.info('Release Info:', await getReleaseInfoUrlForRevision(availableRevision));
  console.info('Click on the link above to determine the Chromium version number.');
  console.info();

  for (const platformName of Object.keys(BrowserPlatform)) {
    const platform = BrowserPlatform[platformName as keyof typeof BrowserPlatform];

    console.info(
        `${platformName}: `.padEnd(10),
        getRevisionArchiveUrl(availableRevision, platform, 'browser'));
    console.info(
        ' '.repeat(15), await getSha256ChecksumForPlatform(availableRevision, platform, 'browser'));
    console.info(
        ' '.repeat(10), await getRevisionArchiveUrl(availableRevision, platform, 'driver'));
    console.info(
        ' '.repeat(15), await getSha256ChecksumForPlatform(availableRevision, platform, 'driver'));
    console.info();
  }
}

/**
 * Finds a Chromium revision which is as close as possible to the revision currently
 * in the stable release channel, and for which snapshot builds exist for all platforms.
 */
async function findClosestStableRevisionForAllPlatforms(): Promise<number|null> {
  const stableBaseRevision = await getStableChromiumRevision();

  // Note: We look for revisions with snapshot builds for every platform by searching in
  // ascending order because going back to older revisions would mean that we use a revision
  // which might miss fixes that have landed before the determined "stable" revision has been
  // released. Note that searching for a revision is ascending order is technically also not
  // ideal because it may contain new regressions, or new APIs, but either way is not ideal here.
  // It seems better to use a more up-to-date revision, rather than relying on code that has
  // already been fixed, but we'd accidentally use it then.
  return findClosestAscendingRevisionForAllPlatforms(stableBaseRevision);
}

/**
 * Finds a Chromium revision in ascending order which is as close as possible to
 * the specified revision and has snapshot builds for all platforms.
 */
async function findClosestAscendingRevisionForAllPlatforms(startRevision: number):
    Promise<number|null> {
  return lookForRevisionWithBuildsForAllPlatforms(startRevision, await getHeadChromiumRevision());
}

/**
 * Looks for revision within the specified revision range for which builds exist for
 * every platform. This is needed because there are no builds available for every
 * revision that lands within Chromium. More details can be found here:
 * https://github.com/puppeteer/puppeteer/issues/2567#issuecomment-393436282.
 */
async function lookForRevisionWithBuildsForAllPlatforms(
    startRevision: number, toRevision: number): Promise<number|null> {
  const spinner = Ora({}).start('Looking for revision build.');
  const increment = toRevision >= startRevision ? 1 : -1;

  for (let i = startRevision; i !== toRevision; i += increment) {
    spinner.text = `Checking: r${i}`;

    const checks = await Promise.all(
        Object.values(BrowserPlatform).map(p => isRevisionAvailableForPlatform(i, p)));

    // If the current revision is available for all platforms, stop
    // searching and return the current revision.
    if (checks.every(isAvailable => isAvailable === true)) {
      spinner.succeed(`Found revision: r${i}`);
      return i;
    }
  }
  spinner.fail('No revision found.');
  return null;
}

/** Checks if the specified revision is available for the given platform. */
async function isRevisionAvailableForPlatform(
    revision: number, platform: BrowserPlatform): Promise<boolean> {
  // Look for the `driver` archive as this is smaller and faster to check.
  const response = await fetch(getRevisionArchiveUrl(revision, platform, 'driver'));
  return response.ok && response.status === 200;
}

/** Gets the latest revision currently in the `stable` release channel of Chromium. */
async function getStableChromiumRevision(): Promise<number> {
  // Omahaproxy is maintained by the Chromium team and can be consulted for determining
  // the current latest revision in stable channel.
  // https://chromium.googlesource.com/chromium/chromium/+/refs/heads/trunk/tools/omahaproxy.py.
  const response = await fetch(`https://omahaproxy.appspot.com/all.json?channel=stable&os=linux`);
  const revisionStr = (await response.json())[0].versions[0].branch_base_position;
  return Number(revisionStr);
}

/** Gets the Chromium release information page URL for a given revision. */
async function getReleaseInfoUrlForRevision(revision: number): Promise<string|null> {
  // This is a site used and maintained by Omahaproxy which is owned by the Chromium team.
  // https://chromium.googlesource.com/chromium/chromium/+/refs/heads/trunk/tools/omahaproxy.py.
  return `https://storage.googleapis.com/chromium-find-releases-static/index.html#r${revision}`;
}

/** Determines the latest Chromium revision available in the CDN. */
async function getHeadChromiumRevision(): Promise<number> {
  const responses = await Promise.all(
      Object.values(BrowserPlatform).map(p => fetch(getPlatformLastChangeFileUrl(p))));
  const revisions = await Promise.all(responses.map(async r => Number(await r.text())));
  return Math.max(...revisions);
}

/** Gets the SHA256 checksum for the platform archive of a specified revision. */
async function getSha256ChecksumForPlatform(
    revision: number, platform: BrowserPlatform, archive: 'driver'|'browser'): Promise<string> {
  const response = await fetch(getRevisionArchiveUrl(revision, platform, archive));
  const binaryContent = await response.buffer();
  return createHash('sha256').update(binaryContent).digest('hex');
}

/** Gets an URL to the `LAST_CHANGE` file for a given platform. */
function getPlatformLastChangeFileUrl(platform: BrowserPlatform) {
  return cloudStorageHeadRevisionUrl.replace('{platform}', platform);
}

/** Gets the CDN archive URL for the given revision and platform. */
function getRevisionArchiveUrl(
    revision: number, platform: BrowserPlatform, archive: 'driver'|'browser'): string {
  const archiveMap = archive === 'driver' ? PlatformDriverArchiveMap : PlatformBrowserArchiveMap;
  return cloudStorageArchiveUrl.replace('{platform}', platform)
      .replace('{revision}', `${revision}`)
      .replace('{file}', archiveMap[platform]);
}
