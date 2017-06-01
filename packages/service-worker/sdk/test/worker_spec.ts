import 'reflect-metadata';

import {SHA1} from 'jshashes';
import {Observable} from 'rxjs/Rx';

import {ConsoleHandler, Driver, LOG, LOGGER, Manifest} from '../';
import {RouteRedirection, StaticContentCache} from '../plugins';
import {MockCache, MockRequest, MockResponse, TestWorkerDriver} from '../testing';

const MANIFEST_URL = '/ngsw-manifest.json';
const CACHE_ACTIVE = 'ngsw:active';
const CACHE_STAGED = 'ngsw:staged';

const SIMPLE_MANIFEST = JSON.stringify({
  static: {
    urls: {
      '/hello.txt': 'test',
      '/goodbye.txt': 'other',
      '/solong.txt': 'other',
      '/versioned.txt': 'versioned'
    },
    versioned: [
      '.*versioned.*',
    ],
  },
});
const SIMPLE_MANIFEST_HASH = new SHA1().hex(SIMPLE_MANIFEST);

const ROUTING_MANIFEST = JSON.stringify({
  static: {urls: {'/hello.txt': 'test'}},
  routing: {
    index: '/hello.txt',
    routes: {
      '/': {
        prefix: false,
      },
      '/goodbye.txt': {prefix: false},
      '/prefix': {
        prefix: true,
        onlyWithoutExtension: true,
      },
      '^/regex/.*/route$': {
        match: 'regex',
      },
    }
  }
});

const HASHED_MANIFEST_1 =
    JSON.stringify({static: {urls: {'/hello.txt': '12345', '/goodbye.txt': '67890'}}});

const HASHED_MANIFEST_2 =
    JSON.stringify({static: {urls: {'/hello.txt': 'abcde', '/goodbye.txt': '67890'}}});

const consoleLogger = new ConsoleHandler();
LOGGER.messages = ((entry: any) => consoleLogger.handle(entry));
LOGGER.release();

function errored(err: any, done: any) {
  fail(`error: ${err}`);
  done();
}

function expectOkResponse(value: Response): Response {
  expect(value).not.toBeUndefined();
  expect(value.ok).toBeTruthy();
  expect((value as any)['redirected']).toBeTruthy();
  return value;
}

function expectCached(
    driver: TestWorkerDriver, cache: string, url: string, text: string): Promise<void> {
  return driver.caches.open(cache)
      .then(cache => cache.match(new MockRequest(url)))
      .then(expectOkResponse)
      .then(resp => resp.text())
      .then(body => expect(body).toBe(text))
      .then(() => null !);
}

function expectServed(
    driver: TestWorkerDriver, url: string, contents: string, id?: string): Promise<void> {
  return driver.triggerFetch(new MockRequest(url), false, id)
      .then(expectOkResponse)
      .then(resp => resp.text())
      .then(body => expect(body).toBe(contents))
      .then(() => null !);
}

function then(desc: any, fn: any) {
  return it(`then, ${desc}`, fn);
}

let sequence = describe;
let fsequence = fdescribe;

function createServiceWorker(
    scope: any, adapter: any, cache: any, fetch: any, events: any, clock: any) {
  const plugins = [
    StaticContentCache(),
    RouteRedirection(),
  ];
  return new Driver(MANIFEST_URL, plugins, scope, adapter, cache, events, fetch, clock);
}

export function main() {
  describe('ngsw', () => {
    const simpleManifestCache = `ngsw:manifest:${SIMPLE_MANIFEST_HASH}:static`;
    describe('initial load', () => {
      let driver: TestWorkerDriver = new TestWorkerDriver(createServiceWorker);
      beforeAll((done: DoneFn) => {
        driver.emptyCaches();
        driver.refresh();
        driver.mockUrl(MANIFEST_URL, SIMPLE_MANIFEST);
        driver.mockUrl('/hello.txt', 'Hello world!');
        driver.mockUrl('/goodbye.txt', 'Goodbye world!');
        driver.mockUrl('/solong.txt', 'So long world!');
        driver.mockUrl('/versioned.txt', 'Not cache busted', true);
        done();
      })
      it('activates', (done: DoneFn) => driver.triggerInstall()
                                            .then(() => driver.triggerActivate())
                                            .then(() => driver.waitForReady())
                                            .then(() => driver.unmockAll())
                                            .then(done, err => errored(err, done)));
      then(
          'caches a single file',
          (done: DoneFn) =>
              Promise.resolve()
                  .then(
                      () => expectCached(driver, simpleManifestCache, '/hello.txt', 'Hello world!'))
                  .then(done, err => errored(err, done)));
      then(
          'caches multiple files',
          (done: DoneFn) =>
              Promise.resolve()
                  .then(
                      () => expectCached(
                          driver, simpleManifestCache, '/goodbye.txt', 'Goodbye world!'))
                  .then(
                      () => expectCached(
                          driver, simpleManifestCache, '/solong.txt', 'So long world!'))
                  .then(done, err => errored(err, done)))
      then(
          'saves the manifest as activated',
          (done: DoneFn) =>
              Promise.resolve()
                  .then(() => expectCached(driver, CACHE_ACTIVE, MANIFEST_URL, SIMPLE_MANIFEST))
                  .then(done, err => errored(err, done)));
      then(
          'serves cached files',
          (done: DoneFn) => Promise.resolve()
                                .then(() => expectServed(driver, '/hello.txt', 'Hello world!'))
                                .then(() => expectServed(driver, '/goodbye.txt', 'Goodbye world!'))
                                .then(() => expectServed(driver, '/solong.txt', 'So long world!'))
                                .then(done, err => errored(err, done)));
      then(
          'serves cached files that were versioned',
          (done: DoneFn) =>
              Promise.resolve()
                  .then(() => expectServed(driver, '/versioned.txt', 'Not cache busted'))
                  .then(done, err => errored(err, done)));
    });
    sequence('upgrade load', () => {
      let driver: TestWorkerDriver = new TestWorkerDriver(createServiceWorker);
      beforeAll((done: DoneFn) => {
        driver.mockUrl(MANIFEST_URL, HASHED_MANIFEST_1);
        driver.mockUrl('/hello.txt', 'Hello world!');
        driver.mockUrl('/goodbye.txt', 'Goodbye world!');
        driver.startup();
        driver.triggerInstall()
            .then(() => driver.triggerActivate())
            .then(() => driver.forceStartup())
            .then(() => driver.unmockAll())
            .then(done, err => errored(err, done));
      });
      it('successfully activates',
         (done: DoneFn) => Promise.resolve(null)
                               .then(() => expectServed(driver, '/hello.txt', 'Hello world!'))
                               .then(() => expectServed(driver, '/goodbye.txt', 'Goodbye world!'))
                               .then(done, err => errored(err, done)));
      then('stages update to new manifest without switching', (done: DoneFn) => {
        driver.mockUrl(MANIFEST_URL, HASHED_MANIFEST_2);
        driver.mockUrl('/hello.txt', 'Hola mundo!');
        driver.mockUrl('/goodbye.txt', 'Should not be reloaded from the server');
        let existingClient = driver.clients.add();
        driver.startup();
        driver.forceStartup()
            .then(() => driver.waitForUpdatePending())
            .then(() => driver.unmockAll())
            .then(() => expectServed(driver, '/hello.txt', 'Hello world!', existingClient))
            .then(done, err => errored(err, done));
      });
      then(
          'refreshes only the hello page',
          (done: DoneFn) =>
              Promise.resolve(null)
                  .then(() => driver.clients.clear())
                  .then(() => expectServed(driver, '/hello.txt', 'Hola mundo!', 'test'))
                  .then(() => expectServed(driver, '/goodbye.txt', 'Goodbye world!', 'test'))
                  .then(done, err => errored(err, done)));
      then(
          'deletes old caches', (done: DoneFn) => Promise.resolve(null)
                                                      .then(() => driver.caches.keys())
                                                      .then(keys => expect(keys.length).toBe(3))
                                                      .then(done, err => errored(err, done)));
    });
    sequence('fallback', () => {
      let driver: TestWorkerDriver = new TestWorkerDriver(createServiceWorker);
      beforeAll((done: DoneFn) => {
        driver.mockUrl(MANIFEST_URL, ROUTING_MANIFEST);
        driver.mockUrl('/hello.txt', 'Hello world!');
        driver.startup();
        driver.triggerInstall()
            .then(() => driver.triggerActivate())
            .then(() => driver.waitForReady())
            .then(() => driver.unmockAll())
            .then(() => driver.mockUrl('/goodbye.txt', 'Should never be fetched!'))
            .then(() => driver.mockUrl('/prefix/test.json', 'Some json'))
            .then(done, err => errored(err, done));
      });
      it('successfully falls back',
         (done: DoneFn) => Promise.resolve(null)
                               .then(() => expectServed(driver, '/hello.txt', 'Hello world!'))
                               .then(() => expectServed(driver, '/goodbye.txt', 'Hello world!'))
                               .then(done, err => errored(err, done)));
      it('successfully falls back prefixed routes',
         (done: DoneFn) => Promise.resolve(null)
                               .then(() => expectServed(driver, '/prefix/test', 'Hello world!'))
                               .then(() => expectServed(driver, '/prefix/test.json', 'Some json'))
                               .then(done, err => errored(err, done)));
      it('successfully falls back regex routes',
         (done: DoneFn) =>
             Promise.resolve(null)
                 .then(() => expectServed(driver, '/regex/some/path/route', 'Hello world!'))
                 .then(done, err => errored(err, done)));
    });
    sequence('index fallback', () => {
      let driver: TestWorkerDriver = new TestWorkerDriver(createServiceWorker);
      beforeAll((done: DoneFn) => {
        driver.mockUrl(MANIFEST_URL, ROUTING_MANIFEST);
        driver.mockUrl('/hello.txt', 'Hello world!');
        driver.mockUrl('/', 'Should never be fetched!');
        driver.startup();
        driver.triggerInstall()
            .then(() => driver.triggerActivate())
            .then(() => driver.waitForReady())
            .then(() => driver.unmockAll())
            .then(done, err => errored(err, done));
      });
      it('successfully serves the index',
         (done: DoneFn) => Promise.resolve(null)
                               .then(() => expectServed(driver, '/hello.txt', 'Hello world!'))
                               .then(() => expectServed(driver, '/', 'Hello world!'))
                               .then(done, err => errored(err, done)))
    });
  });
  sequence('non-cached requests', () => {
    let driver: TestWorkerDriver = new TestWorkerDriver(createServiceWorker);
    beforeAll(() => {
      driver.emptyCaches();
      driver.refresh();
      driver.mockUrl(MANIFEST_URL, SIMPLE_MANIFEST);
      driver.mockUrl('/hello.txt', 'Hello world!');
      driver.mockUrl('/goodbye.txt', 'Goodbye world!');
      driver.mockUrl('/solong.txt', 'So long world!');
      driver.mockUrl('/versioned.txt', 'Not cache busted', true);
    });
    it('follow redirect when requested', done => {
      const resp = new MockResponse('This was not redirected');
      resp.redirected = true;
      resp.url = '/redirected.txt';
      driver.mockUrl('/redirect.txt', resp);
      driver.mockUrl('/redirected.txt', 'This was redirected');
      expectServed(driver, '/redirect.txt', 'This was redirected')
          .then(done, err => errored(err, done));
    });
  })
  sequence('manifest staging bugs', () => {
    let driver: TestWorkerDriver = new TestWorkerDriver(createServiceWorker);
    beforeAll(done => {
      driver.mockUrl(MANIFEST_URL, SIMPLE_MANIFEST);
      driver.mockUrl('/hello.txt', 'Hello world!');
      driver.mockUrl('/goodbye.txt', 'Goodbye world!');
      driver.mockUrl('/solong.txt', 'So long world!');
      driver.mockUrl('/versioned.txt', 'Not cache busted', true);
      driver.startup();
      driver.triggerInstall()
          .then(() => driver.triggerActivate())
          .then(() => driver.waitForReady())
          .then(() => driver.unmockAll())
          .then(() => putRequestInCache(driver, 'ngsw:staged', MANIFEST_URL, SIMPLE_MANIFEST))
          .then(done, err => errored(err, done));
    });
    it('still serves after active manifest was also staged',
       done => Promise.resolve(null)
                   .then(() => driver.refresh())
                   .then(() => expectServed(driver, '/hello.txt', 'Hello world!'))
                   .then(done, err => errored(err, done)));
  });
}

function putRequestInCache(
    driver: TestWorkerDriver, cache: string, url: string, body: string): void {
  driver.caches.caches[cache] = driver.caches.caches[cache] || new MockCache();
  const mock = driver.caches.caches[cache] as MockCache;
  mock.put(new MockRequest(url), new MockResponse(body));
}
