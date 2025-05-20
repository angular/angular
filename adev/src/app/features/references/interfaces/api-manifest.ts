/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApiItemType} from './api-item-type';

export interface ApiManifestEntry {
  name: string;
  type: ApiItemType;
  deprecated: {version: string | undefined} | undefined;
  developerPreview: {version: string | undefined} | undefined;
  experimental: {version: string | undefined} | undefined;
  stable: {version: string | undefined} | undefined;
}

export interface ApiManifestPackage {
  moduleName: string;
  normalizedModuleName: string;
  moduleLabel: string;
  entries: ApiManifestEntry[];
}

export type ApiManifest = ApiManifestPackage[];
