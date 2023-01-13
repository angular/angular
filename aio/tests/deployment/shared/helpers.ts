// tslint:disable-next-line: no-reference
/// <reference path="./cjson.d.ts" />

import canonicalPath from 'canonical-path';
import {load as loadJson} from 'cjson';
import {readFileSync} from 'fs';
import {get as httpGet} from 'http';
import {get as httpsGet} from 'https';
import {fileURLToPath} from 'url';

import {processNavigationUrls} from '../../../../packages/service-worker/config/src/generator';
import {FirebaseRedirectConfig, FirebaseRedirector} from '../../../tools/firebase-test-utils/FirebaseRedirector';


const AIO_DIR = canonicalPath.resolve('aio');
const containingDir = canonicalPath.dirname(fileURLToPath(import.meta.url));

export const PATH_TO_LEGACY_URLS = canonicalPath.resolve(containingDir, 'URLS_TO_REDIRECT.txt');

export function getRedirector() {
  return new FirebaseRedirector(loadRedirects());
}

export function getSwNavigationUrlChecker() {
  const config = loadJson(`${AIO_DIR}/src/generated/ngsw-config.json`);
  const navigationUrlSpecs = processNavigationUrls('', config.navigationUrls);

  const includePatterns =
      navigationUrlSpecs.filter(spec => spec.positive).map(spec => new RegExp(spec.regex));
  const excludePatterns =
      navigationUrlSpecs.filter(spec => !spec.positive).map(spec => new RegExp(spec.regex));

  return (url: string) => includePatterns.some(regex => regex.test(url)) &&
      !excludePatterns.some(regex => regex.test(url));
}

export function loadRedirects(): FirebaseRedirectConfig[] {
  const pathToFirebaseJSON = `${AIO_DIR}/firebase.json`;
  const contents = loadJson(pathToFirebaseJSON);
  return contents.hosting.redirects;
}

export function loadLegacyUrls() {
  const urls = readFileSync(PATH_TO_LEGACY_URLS, 'utf8')
                   .split('\n')
                   .filter(line => line.trim() !== '')
                   .map(line => line.split(/\s*-->\s*/));
  return urls;
}

export function loadLocalSitemapUrls() {
  const pathToSiteMap = `${AIO_DIR}/dgeni/generated/sitemap.xml`;
  const xml = readFileSync(pathToSiteMap, 'utf8');
  return extractSitemapUrls(xml);
}

export async function loadRemoteSitemapUrls(host: string) {
  host = host.replace(/\/$/, '');
  const urlToSiteMap = `${host}/generated/sitemap.xml`;
  const get = /^https:/.test(host) ? httpsGet : httpGet;

  const xml = await new Promise<string>((resolve, reject) => {
    let responseText = '';
    get(urlToSiteMap,
        res => res.on('data', chunk => responseText += chunk)
                   .on('end', () => resolve(responseText))
                   .on('error', reject));
  });

  return extractSitemapUrls(xml);
}

// Private functions
function extractSitemapUrls(xml: string) {
  // Currently, all sitemaps use `angular.io` as host in URLs (which is fine since we only use the
  // sitemap in `angular.io`). See also `aio/src/extra-files/*/robots.txt`.
  const host = 'https://angular.io';
  const urls: string[] = [];

  xml.replace(/<loc>([^<]+)<\/loc>/g, (_, loc) => urls.push(loc.replace(host, '')) as any);

  // Ensure none of the URLs contains the scheme/host.
  // (That would mean that the URL contains a different than expected host, which can in turn lead
  // to tests passing while they shouldn't).
  urls.forEach(url => {
    if (url.includes('://')) {
      throw new Error(`Sitemap URL (${url}) contains unexpected host. Expected: ${host}`);
    }
  });

  return urls;
}
