import { resolve } from 'canonical-path';
import { load as loadJson } from 'cjson';
import { readFileSync } from 'fs';
import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';

import { FirebaseRedirector, FirebaseRedirectConfig } from '../../../tools/firebase-test-utils/FirebaseRedirector';


const AIO_DIR = resolve(__dirname, '../../..');

export function getRedirector() {
  return new FirebaseRedirector(loadRedirects());
}

export function loadRedirects(): FirebaseRedirectConfig[] {
  const pathToFirebaseJSON = `${AIO_DIR}/firebase.json`;
  const contents = loadJson(pathToFirebaseJSON);
  return contents.hosting.redirects;
}

export function loadLegacyUrls() {
  const pathToLegacyUrls = `${__dirname}/URLS_TO_REDIRECT.txt`;
  const urls = readFileSync(pathToLegacyUrls, 'utf8').split('\n').map(line => line.split('\t'));
  return urls;
}

export function loadLocalSitemapUrls() {
  const pathToSiteMap = `${AIO_DIR}/src/generated/sitemap.xml`;
  const xml = readFileSync(pathToSiteMap, 'utf8');
  return extractSitemapUrls(xml);
}

export async function loadRemoteSitemapUrls(host: string) {
  const urlToSiteMap = `${host}/generated/sitemap.xml`;
  const get = /^https:/.test(host) ? httpsGet : httpGet;

  const xml = await new Promise<string>((resolve, reject) => {
    let responseText = '';
    get(urlToSiteMap, res => res
        .on('data', chunk => responseText += chunk)
        .on('end', () => resolve(responseText))
        .on('error', reject));
  });

  return extractSitemapUrls(xml);
}

export function loadSWRoutes() {
  const pathToSWManifest = `${AIO_DIR}/ngsw-manifest.json`;
  const contents = loadJson(pathToSWManifest);
  const routes = contents.routing.routes;
  return Object.keys(routes).map(route => {
    const routeConfig = routes[route];
    switch (routeConfig.match) {
      case 'exact':
        return (url) => url === route;
      case 'prefix':
        return (url) => url.startsWith(route);
      case 'regex':
        const regex = new RegExp(route);
        return (url) => regex.test(url);
      default:
        throw new Error(`unknown route config: ${route} - ${routeConfig.match}`);
    }
  });
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
