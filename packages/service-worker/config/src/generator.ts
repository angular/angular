/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseDurationToMs} from './duration';
import {Filesystem} from './filesystem';
import {globToRegex} from './glob';
import {Config} from './in';
import {sha1} from './sha1';

/**
 * Consumes service worker configuration files and processes them into control files.
 *
 * @experimental
 */
export class Generator {
  constructor(readonly fs: Filesystem, private baseHref: string) {}

  async process(config: Config): Promise<Object> {
    const hashTable = {};
    return {
      configVersion: 1,
      index: joinUrls(this.baseHref, config.index),
      appData: config.appData,
      assetGroups: await this.processAssetGroups(config, hashTable),
      dataGroups: this.processDataGroups(config), hashTable,
    };
  }

  private async processAssetGroups(config: Config, hashTable: {[file: string]: string | undefined}):
      Promise<Object[]> {
    const seenMap = new Set<string>();
    return Promise.all((config.assetGroups || []).map(async(group) => {
      const fileMatcher = globListToMatcher(group.resources.files || []);
      const versionedMatcher = globListToMatcher(group.resources.versionedFiles || []);

      const allFiles = (await this.fs.list('/'));

      const versionedFiles = allFiles.filter(versionedMatcher).filter(file => !seenMap.has(file));
      versionedFiles.forEach(file => seenMap.add(file));

      const plainFiles = allFiles.filter(fileMatcher).filter(file => !seenMap.has(file));
      plainFiles.forEach(file => seenMap.add(file));

      // Add the hashes.
      await plainFiles.reduce(async(previous, file) => {
        await previous;
        const hash = sha1(await this.fs.read(file));
        hashTable[joinUrls(this.baseHref, file)] = hash;
      }, Promise.resolve());


      // Figure out the patterns.
      const patterns = (group.resources.urls || [])
                           .map(
                               glob => glob.startsWith('/') || glob.indexOf('://') !== -1 ?
                                   glob :
                                   joinUrls(this.baseHref, glob))
                           .map(glob => globToRegex(glob));

      return {
        name: group.name,
        installMode: group.installMode || 'prefetch',
        updateMode: group.updateMode || group.installMode || 'prefetch',
        urls: ([] as string[])
                  .concat(plainFiles)
                  .concat(versionedFiles)
                  .map(url => joinUrls(this.baseHref, url)),
        patterns,
      };
    }));
  }

  private processDataGroups(config: Config): Object[] {
    return (config.dataGroups || []).map(group => {
      const patterns = group.urls
                           .map(
                               glob => glob.startsWith('/') || glob.indexOf('://') !== -1 ?
                                   glob :
                                   joinUrls(this.baseHref, glob))
                           .map(glob => globToRegex(glob));
      return {
        name: group.name,
        patterns,
        strategy: group.cacheConfig.strategy || 'performance',
        maxSize: group.cacheConfig.maxSize,
        maxAge: parseDurationToMs(group.cacheConfig.maxAge),
        timeoutMs: group.cacheConfig.timeout && parseDurationToMs(group.cacheConfig.timeout),
        version: group.version !== undefined ? group.version : 1,
      };
    });
  }
}

function globListToMatcher(globs: string[]): (file: string) => boolean {
  const patterns = globs.map(pattern => {
    if (pattern.startsWith('!')) {
      return {
        positive: false,
        regex: new RegExp('^' + globToRegex(pattern.substr(1)) + '$'),
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

function matches(file: string, patterns: {positive: boolean, regex: RegExp}[]): boolean {
  const res = patterns.reduce((isMatch, pattern) => {
    if (pattern.positive) {
      return isMatch || pattern.regex.test(file);
    } else {
      return isMatch && !pattern.regex.test(file);
    }
  }, false);
  return res;
}

function joinUrls(a: string, b: string): string {
  if (a.endsWith('/') && b.startsWith('/')) {
    return a + b.substr(1);
  } else if (!a.endsWith('/') && !b.startsWith('/')) {
    return a + '/' + b;
  }
  return a + b;
}