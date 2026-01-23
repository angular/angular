/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VERSION} from '@angular/core';
const major = VERSION.major;

const isPreRelease =
  VERSION.full.includes('-next') || VERSION.full.includes('-rc') || VERSION.full === '0.0.0';

// NOTE: Although the index name is determined automatically here, the actual index
// must be MANUALLY created on the Algolia dashboard for every new major version.
const indexName = isPreRelease ? 'angular_next_dev' : `angular_v${major}`;

export default {
  production: true,
  // Those values are publicly visible in the search request headers, and presents search-only keys.
  // https://www.algolia.com/doc/guides/security/api-keys/#search-only-api-key
  algolia: {
    appId: 'L1XWT2UJ7F',
    apiKey: 'dfca7ed184db27927a512e5c6668b968',
    indexName: indexName,
  },
  googleAnalyticsId: 'G-XB6NEVW32B',
};
