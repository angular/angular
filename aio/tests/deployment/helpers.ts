const { readFileSync } = require('fs');
const path = require('canonical-path');
const cjson = require('cjson');

import { FirebaseRedirector, FirebaseRedirectConfig } from '../../tools/firebase-test-utils/FirebaseRedirector';

export function getRedirector() {
  return new FirebaseRedirector(loadRedirects());
}

export function loadRedirects(): FirebaseRedirectConfig[] {
  const pathToFirebaseJSON = path.resolve(__dirname, '../../firebase.json');
  const contents = cjson.load(pathToFirebaseJSON);
  return contents.hosting.redirects;
}

export function loadSitemapUrls() {
  const pathToSiteMap = path.resolve(__dirname, '../../src/generated/sitemap.xml');
  const xml = readFileSync(pathToSiteMap, 'utf8');
  const urls: string[] = [];
  xml.replace(/<loc>([^<]+)<\/loc>/g, (_, loc) => urls.push(loc.replace('%%DEPLOYMENT_HOST%%', '')));
  return urls;
}

export function loadLegacyUrls() {
  const pathToLegacyUrls = path.resolve(__dirname, 'URLS_TO_REDIRECT.txt');
  const urls = readFileSync(pathToLegacyUrls, 'utf8').split('\n').map(line => line.split('\t'));
  return urls;
}

export function loadSWRoutes() {
  const pathToSWManifest = path.resolve(__dirname, '../../ngsw-manifest.json');
  const contents = cjson.load(pathToSWManifest);
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
