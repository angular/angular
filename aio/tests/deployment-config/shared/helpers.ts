import { resolve } from 'canonical-path';
import { load as loadJson } from 'cjson';
import { readFileSync } from 'fs';

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

export function loadSitemapUrls() {
  const pathToSiteMap = `${AIO_DIR}/src/generated/sitemap.xml`;
  const xml = readFileSync(pathToSiteMap, 'utf8');
  const urls: string[] = [];
  xml.replace(/<loc>([^<]+)<\/loc>/g, (_, loc) => urls.push(loc.replace('%%DEPLOYMENT_HOST%%', '')));
  return urls;
}

export function loadLegacyUrls() {
  const pathToLegacyUrls = `${__dirname}/URLS_TO_REDIRECT.txt`;
  const urls = readFileSync(pathToLegacyUrls, 'utf8').split('\n').map(line => line.split('\t'));
  return urls;
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
