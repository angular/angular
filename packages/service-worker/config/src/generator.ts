/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseDurationToMs} from './duration';
import {Filesystem} from './filesystem';
import {globToRegex} from './glob';
import {AssetGroup, Config} from './in';

const DEFAULT_NAVIGATION_URLS = [
  '/**', // Include all URLs.
  '!/**/*.*', // Exclude URLs to files (containing a file extension in the last segment).
  '!/**/*__*', // Exclude URLs containing `__` in the last segment.
  '!/**/*__*/**', // Exclude URLs containing `__` in any other segment.
];

/**
 * Consumes service worker configuration files and processes them into control files.
 *
 * @publicApi
 */
export class Generator {
  constructor(
    readonly fs: Filesystem,
    private baseHref: string,
  ) {}

  async process(config: Config): Promise<Object> {
    const unorderedHashTable = {};
    const assetGroups = await this.processAssetGroups(config, unorderedHashTable);

    return {
      configVersion: 1,
      timestamp: Date.now(),
      appData: config.appData,
      index: joinUrls(this.baseHref, config.index),
      assetGroups,
      dataGroups: this.processDataGroups(config),
      hashTable: withOrderedKeys(unorderedHashTable),
      navigationUrls: processNavigationUrls(this.baseHref, config.navigationUrls),
      navigationRequestStrategy: config.navigationRequestStrategy ?? 'performance',
      applicationMaxAge: config.applicationMaxAge
        ? parseDurationToMs(config.applicationMaxAge)
        : undefined,
    };
  }

  private async processAssetGroups(
    config: Config,
    hashTable: {[file: string]: string | undefined},
  ): Promise<Object[]> {
    // Retrieve all files of the build.
    const allFiles = await this.fs.list('/');
    const seenMap = new Set<string>();
    const filesPerGroup = new Map<AssetGroup, string[]>();

    // Computed which files belong to each asset-group.
    for (const group of config.assetGroups || []) {
      if ((group.resources as any).versionedFiles) {
        throw new Error(
          `Asset-group '${group.name}' in 'ngsw-config.json' uses the 'versionedFiles' option, ` +
            "which is no longer supported. Use 'files' instead.",
        );
      }

      const fileMatcher = globListToMatcher(group.resources.files || []);
      const matchedFiles = allFiles
        .filter(fileMatcher)
        .filter((file) => !seenMap.has(file))
        .sort();

      matchedFiles.forEach((file) => seenMap.add(file));
      filesPerGroup.set(group, matchedFiles);
    }

    // Compute hashes for all matched files and add them to the hash-table.
    const allMatchedFiles = ([] as string[]).concat(...Array.from(filesPerGroup.values())).sort();
    const allMatchedHashes = await processInBatches(allMatchedFiles, 500, (file) =>
      this.fs.hash(file),
    );
    allMatchedFiles.forEach((file, idx) => {
      hashTable[joinUrls(this.baseHref, file)] = allMatchedHashes[idx];
    });

    // Generate and return the processed asset-groups.
    return Array.from(filesPerGroup.entries()).map(([group, matchedFiles]) => ({
      name: group.name,
      installMode: group.installMode || 'prefetch',
      updateMode: group.updateMode || group.installMode || 'prefetch',
      cacheQueryOptions: buildCacheQueryOptions(group.cacheQueryOptions),
      urls: matchedFiles.map((url) => joinUrls(this.baseHref, url)),
      patterns: (group.resources.urls || []).map((url) => urlToRegex(url, this.baseHref, true)),
    }));
  }

  private processDataGroups(config: Config): Object[] {
    return (config.dataGroups || []).map((group) => {
      return {
        name: group.name,
        patterns: group.urls.map((url) => urlToRegex(url, this.baseHref, true)),
        strategy: group.cacheConfig.strategy || 'performance',
        maxSize: group.cacheConfig.maxSize,
        maxAge: parseDurationToMs(group.cacheConfig.maxAge),
        timeoutMs: group.cacheConfig.timeout && parseDurationToMs(group.cacheConfig.timeout),
        refreshAheadMs:
          group.cacheConfig.refreshAhead && parseDurationToMs(group.cacheConfig.refreshAhead),
        cacheOpaqueResponses: group.cacheConfig.cacheOpaqueResponses,
        cacheQueryOptions: buildCacheQueryOptions(group.cacheQueryOptions),
        version: group.version !== undefined ? group.version : 1,
      };
    });
  }
}

export function processNavigationUrls(
  baseHref: string,
  urls = DEFAULT_NAVIGATION_URLS,
): {positive: boolean; regex: string}[] {
  return urls.map((url) => {
    const positive = !url.startsWith('!');
    url = positive ? url : url.slice(1);
    return {positive, regex: `^${urlToRegex(url, baseHref)}$`};
  });
}

async function processInBatches<I, O>(
  items: I[],
  batchSize: number,
  processFn: (item: I) => O | Promise<O>,
): Promise<O[]> {
  const batches = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return batches.reduce(
    async (prev, batch) =>
      (await prev).concat(await Promise.all(batch.map((item) => processFn(item)))),
    Promise.resolve<O[]>([]),
  );
}

function globListToMatcher(globs: string[]): (file: string) => boolean {
  const patterns = globs.map((pattern) => {
    if (pattern.startsWith('!')) {
      return {
        positive: false,
        regex: new RegExp('^' + globToRegex(pattern.slice(1)) + '$'),
      };
    } else {
      return {
        positive: true,
        regex: new RegExp('^' + globToRegex(pattern) + '$'),
      };
    }
  });
  return (file: string) => matches(file, patterns);
}

function matches(file: string, patterns: {positive: boolean; regex: RegExp}[]): boolean {
  return patterns.reduce((isMatch, pattern) => {
    if (pattern.positive) {
      return isMatch || pattern.regex.test(file);
    } else {
      return isMatch && !pattern.regex.test(file);
    }
  }, false);
}

function urlToRegex(url: string, baseHref: string, literalQuestionMark?: boolean): string {
  if (!url.startsWith('/') && url.indexOf('://') === -1) {
    // Prefix relative URLs with `baseHref`.
    // Strip a leading `.` from a relative `baseHref` (e.g. `./foo/`), since it would result in an
    // incorrect regex (matching a literal `.`).
    url = joinUrls(baseHref.replace(/^\.(?=\/)/, ''), url);
  }

  return globToRegex(url, literalQuestionMark);
}

function joinUrls(a: string, b: string): string {
  if (a.endsWith('/') && b.startsWith('/')) {
    return a + b.slice(1);
  } else if (!a.endsWith('/') && !b.startsWith('/')) {
    return a + '/' + b;
  }
  return a + b;
}

function withOrderedKeys<T extends {[key: string]: any}>(unorderedObj: T): T {
  const orderedObj = {} as {[key: string]: any};
  Object.keys(unorderedObj)
    .sort()
    .forEach((key) => (orderedObj[key] = unorderedObj[key]));
  return orderedObj as T;
}

function buildCacheQueryOptions(
  inOptions?: Pick<CacheQueryOptions, 'ignoreSearch'>,
): CacheQueryOptions {
  return {
    ignoreVary: true,
    ...inOptions,
  };
}
