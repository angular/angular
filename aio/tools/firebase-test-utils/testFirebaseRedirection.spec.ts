const { readFileSync } = require('fs');
const path = require('canonical-path');
const cjson = require('cjson');

import { FirebaseRedirector, FirebaseRedirectConfig } from './FirebaseRedirector';


describe('sitemap urls', () => {
  loadSitemapUrls().forEach(url => {
    it('should not redirect any urls in the sitemap', () => {
      expect(getRedirector().redirect(url)).toEqual(url);
    });
  });
});

describe('redirected urls', () => {
  loadLegacyUrls().forEach(urlPair => {
    it('should redirect the legacy urls', () => {
      const redirector = getRedirector();
      expect(redirector.redirect(urlPair[0])).not.toEqual(urlPair[0]);
      if (urlPair[1]) {
        expect(redirector.redirect(urlPair[0])).toEqual(urlPair[1]);
      }
    });
  });
});

function getRedirector() {
  return new FirebaseRedirector(loadRedirects());
}

function loadRedirects(): FirebaseRedirectConfig[] {
  const pathToFirebaseJSON = path.resolve(__dirname, '../../firebase.json');
  const contents = cjson.load(pathToFirebaseJSON);
  return contents.hosting.redirects;
}

function loadSitemapUrls() {
  const pathToSiteMap = path.resolve(__dirname, '../../src/generated/sitemap.xml');
  const xml = readFileSync(pathToSiteMap, 'utf8');
  const urls: string[] = [];
  xml.replace(/<loc>([^<]+)<\/loc>/g, (_, loc) => urls.push(loc.replace('%%DEPLOYMENT_HOST%%', '')));
  return urls;
}

function loadLegacyUrls() {
  const pathToLegacyUrls = path.resolve(__dirname, 'URLS_TO_REDIRECT.txt');
  const urls = readFileSync(pathToLegacyUrls, 'utf8').split('\n').map(line => line.split('\t'));
  return urls;
}
