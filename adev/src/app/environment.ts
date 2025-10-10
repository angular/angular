/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export default {
  production: true,
  // Those values are publicly visible in the search request headers, and presents search-only keys.
  // https://www.algolia.com/doc/guides/security/api-keys/#search-only-api-key
  algolia: {
    appId: 'L1XWT2UJ7F',
    apiKey: 'dfca7ed184db27927a512e5c6668b968',
    // The indexName value must match the branch it's on.
    // So it needs to be updated on release of the new major on the patch branch.
    indexName: 'angular_next_dev',
  },
  googleAnalyticsId: 'G-XB6NEVW32B',
};
