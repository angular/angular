/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {sha1} from './sha1';

export type ManifestHash = string;

export interface Manifest {
  configVersion: number;
  appData?: {[key: string]: string};
  index: string;
  assetGroups?: AssetGroupConfig[];
  dataGroups?: DataGroupConfig[];
  navigationUrls: {positive: boolean, regex: string}[];
  hashTable: {[url: string]: string};
}

export interface AssetGroupConfig {
  name: string;
  installMode: 'prefetch'|'lazy';
  updateMode: 'prefetch'|'lazy';
  urls: string[];
  patterns: string[];
}

export interface DataGroupConfig {
  name: string;
  version: number;
  strategy: 'freshness'|'performance';
  patterns: string[];
  maxSize: number;
  timeoutMs?: number;
  refreshAheadMs?: number;
  maxAge: number;
}

export function hashManifest(manifest: Manifest): ManifestHash {
  return sha1(JSON.stringify(manifest));
}
