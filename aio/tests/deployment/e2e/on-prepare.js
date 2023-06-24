/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

module.exports = async function () {
  const targetUrl = process.env.TARGET_URL;
  if (!targetUrl) {
    throw new Error('No target URL via `TARGET_URL` environment variable set.');
  }

  protractor.browser.baseUrl = targetUrl;

  const {loadLegacyUrls, loadRemoteSitemapUrls} = await import('../shared/helpers.mjs');
  const [sitemapUrls, legacyUrls] = await Promise.all([
    loadRemoteSitemapUrls(browser.baseUrl),
    loadLegacyUrls(),
  ]);

  console.info('Determined testing URLs', {sitemapUrls, legacyUrls});

  if (sitemapUrls.length <= 100) {
    throw new Error(`Too few sitemap URLs. (Expected: >100 | Found: ${sitemapUrls.length})`);
  } else if (legacyUrls.length <= 100) {
    throw new Error(`Too few legacy URLs. (Expected: >100 | Found: ${legacyUrls.length})`);
  }

  protractor.browser.params = {
    sitemapUrls: sitemapUrls,
    legacyUrls: legacyUrls,
  };
};
