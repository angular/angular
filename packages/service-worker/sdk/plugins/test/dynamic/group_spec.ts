import {NgSwAdapter, NgSwCacheImpl} from '@angular/service-worker/sdk';
import {MockCacheStorage, MockClock, TestAdapter} from '@angular/service-worker/sdk/testing';

import {DynamicGroup, ResponseWithSideEffect} from '../../src/dynamic/group';
import {FreshnessCacheConfig, FreshnessStrategy} from '../../src/dynamic/strategy/freshness';
import {PerformanceCacheConfig, PerformanceStrategy} from '../../src/dynamic/strategy/performance';

const adapter = new TestAdapter();
const caches = new MockCacheStorage();
const clock = new MockClock();

function applySideEffect(res: ResponseWithSideEffect): Promise<Response> {
  if (!res.sideEffect) {
    return Promise.resolve(res.response);
  }
  return res.sideEffect().then(() => res.response);
}

interface FetchFromOptions {
  text?: string;
  expectFetched?: boolean;
  expectServerText?: boolean;
  networkDelayMs?: number;
  advanceByMs?: number;
}

function fetchFrom(
    group: DynamicGroup, url: string, options: FetchFromOptions = {}): Promise<string> {
  expect(options).not.toBeNull();
  let fetched: boolean = false;
  let delegate = () => {
    fetched = true;
    return Promise.reject(`no server value expected for ${url}`);
  };
  if (!!options.text) {
    delegate = () => {
      fetched = true;
      return Promise.resolve(adapter.newResponse(options.text !));
    };
    if (!!options.networkDelayMs) {
      const immediate = delegate;
      delegate = () => {
        fetched = true;
        return new Promise(resolve => clock.setTimeout(resolve, options.networkDelayMs !))
            .then(() => immediate());
      };
    }
  }
  const res = group.fetch(adapter.newRequest(url), delegate)
                  .then(rse => applySideEffect(rse))
                  .then(res => res.text())
                  .then(text => {
                    if (!!options.expectFetched) {
                      expect(fetched).toBeTruthy();
                    } else if (!options.text) {
                      expect(fetched).toBeFalsy();
                    }
                    if (!!options.expectServerText) {
                      expect(text).toBe(options.text);
                    }
                    return text;
                  });
  if (!!options.advanceByMs) {
    clock.advance(options.advanceByMs);
  }
  return res;
}

function expectMetadataEntries(expected: number): Promise<any> {
  return caches.open('dynamic:test:metadata')
      .then(cache => cache.keys())
      .then(keys => expect(keys.length).toBe(expected));
}

const STRATEGIES = {
  'freshness': new FreshnessStrategy(),
  'performance': new PerformanceStrategy(),
};

export function main() {
  describe('Dynamic plugin', () => {
    describe('cache group', () => {
      let group: DynamicGroup;

      describe('optimized for performance', () => {
        describe('with lru strategy', () => {
          beforeEach(done => {
            clock.reset();
            caches.caches = {};
            const cache = new NgSwCacheImpl(caches, adapter);
            DynamicGroup
                .open(
                    {
                      name: 'test',
                      urls: {
                        '/api': {
                          match: 'prefix',
                        },
                      },
                      cache: {
                        optimizeFor: 'performance',
                        strategy: 'lru',
                        maxAgeMs: 10000,
                        maxEntries: 2,
                      } as PerformanceCacheConfig,
                    },
                    adapter, cache, clock, STRATEGIES)
                .then(g => group = g)
                .then(() => done());
          });
          it('caches a basic response',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(
                         () => fetchFrom(
                             group, '/api/test', {text: 'test response', expectServerText: true}))
                     .then(() => fetchFrom(group, '/api/test'))
                     .then(text => expect(text).toBe('test response'))
                     .then(() => expectMetadataEntries(1))
                     .then(() => done()));
          it('expires cache entries after maxEntryAgeSeconds',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(() => fetchFrom(group, '/api/test', {text: 'test response'}))
                     .then(() => clock.advance(20000))
                     .then(
                         () => fetchFrom(
                             group, '/api/test', {text: 'changed', expectServerText: true}))
                     .then(() => done()));
          it('expires the least recently used entry',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(() => fetchFrom(group, '/api/test/1', {text: 'first response'}))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/2', {text: 'second response'}))
                     .then(() => clock.advance(1))
                     .then(() => expectMetadataEntries(2))
                     .then(() => fetchFrom(group, '/api/test/1'))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/3', {text: 'third response'}))
                     .then(() => clock.advance(1))
                     .then(() => expectMetadataEntries(2))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/2',
                             {text: 'changed second response', expectServerText: true}))
                     .then(() => clock.advance(1))
                     .then(() => expectMetadataEntries(2))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/1',
                             {text: 'changed first response', expectServerText: true}))
                     .then(() => expectMetadataEntries(2))
                     .then(() => done()));
          it('persists after reload',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(() => fetchFrom(group, '/api/test/1', {text: 'first response'}))
                     .then(() => fetchFrom(group, '/api/test/2', {text: 'second response'}))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/1'))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/3', {text: 'third response'}))
                     .then(() => clock.advance(1))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/2',
                             {text: 'changed second response', expectServerText: true}))
                     .then(() => clock.advance(1))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/1',
                             {text: 'changed first response', expectServerText: true}))
                     .then(() => clock.advance(1))
                     .then(
                         () => DynamicGroup.open(
                             {
                               name: 'test',
                               urls: {
                                 '/api': {
                                   match: 'prefix',
                                 },
                               },
                               cache: {
                                 optimizeFor: 'performance',
                                 strategy: 'lru',
                                 maxAgeMs: 10000,
                                 maxEntries: 2,
                               } as PerformanceCacheConfig,
                             },
                             adapter, new NgSwCacheImpl(caches, adapter), clock, STRATEGIES))
                     .then(g => group = g)
                     .then(() => expectMetadataEntries(2))
                     .then(() => fetchFrom(group, '/api/test/1'))
                     .then(text => expect(text).toBe('changed first response'))
                     .then(() => fetchFrom(group, '/api/test/2'))
                     .then(text => expect(text).toBe('changed second response'))
                     .then(() => done()));
        });
        describe('with lfu strategy', () => {
          beforeEach((done: DoneFn) => {
            clock.reset();
            caches.caches = {};
            const cache = new NgSwCacheImpl(caches, adapter);
            DynamicGroup
                .open(
                    {
                      name: 'test',
                      urls: {
                        '/api': {
                          match: 'prefix',
                        },
                      },
                      cache: {
                        optimizeFor: 'performance',
                        strategy: 'lfu',
                        maxAgeMs: 10000,
                        maxEntries: 2,
                      } as PerformanceCacheConfig,
                    },
                    adapter, cache, clock, STRATEGIES)
                .then(g => group = g)
                .then(() => done());
          });
          it('expires the least frequently used entry',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(() => fetchFrom(group, '/api/test/1', {text: 'first response'}))
                     .then(() => fetchFrom(group, '/api/test/2', {text: 'second response'}))
                     .then(() => fetchFrom(group, '/api/test/1'))
                     .then(() => expectMetadataEntries(2))
                     .then(() => fetchFrom(group, '/api/test/3', {text: 'third response'}))
                     .then(() => expectMetadataEntries(2))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/2',
                             {text: 'changed response', expectServerText: true}))
                     .then(() => fetchFrom(group, '/api/test/2'))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/3',
                             {text: 'changed third response', expectServerText: true}))
                     .then(() => expectMetadataEntries(2))
                     .then(() => done()));
        });
        describe('with fifo strategy', () => {
          beforeEach((done: DoneFn) => {
            clock.reset();
            caches.caches = {};
            const cache = new NgSwCacheImpl(caches, adapter);
            DynamicGroup
                .open(
                    {
                      name: 'test',
                      urls: {
                        '/api': {
                          match: 'prefix',
                        },
                      },
                      cache: {
                        optimizeFor: 'performance',
                        strategy: 'fifo',
                        maxAgeMs: 10000,
                        maxEntries: 2,
                      } as PerformanceCacheConfig,
                    },
                    adapter, cache, clock, STRATEGIES)
                .then(g => group = g)
                .then(() => done());
          });
          it('expires the first entry to be added',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(() => fetchFrom(group, '/api/test/1', {text: 'first response'}))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/2', {text: 'second response'}))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/3', {text: 'third response'}))
                     .then(() => clock.advance(1))
                     .then(() => expectMetadataEntries(2))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/1',
                             {text: 'changed first response', expectServerText: true}))
                     .then(() => clock.advance(1))
                     .then(
                         () => fetchFrom(
                             group, '/api/test/2',
                             {text: 'changed second response', expectServerText: true}))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/1'))
                     .then(() => clock.advance(1))
                     .then(() => fetchFrom(group, '/api/test/2'))
                     .then(() => expectMetadataEntries(2))
                     .then(() => done()));
        });
      });
      describe('optimize for freshness', () => {
        describe('backup strategy', () => {
          beforeEach((done: DoneFn) => {
            clock.reset();
            caches.caches = {};
            const cache = new NgSwCacheImpl(caches, adapter);
            DynamicGroup
                .open(
                    {
                      name: 'test',
                      urls: {
                        '/api': {
                          match: 'prefix',
                        },
                      },
                      cache: {
                        optimizeFor: 'freshness',
                        strategy: 'fifo',
                        maxAgeMs: 10000,
                        maxEntries: 2,
                        networkTimeoutMs: 200,
                      } as FreshnessCacheConfig,
                    },
                    adapter, cache, clock, STRATEGIES)
                .then(g => group = g)
                .then(() => done());
          });
          it('serves from the network when the network is fast',
             (done: DoneFn) => Promise.resolve()
                                   .then(() => fetchFrom(group, '/api/test/1', {
                                           text: 'first response',
                                           expectServerText: true,
                                           networkDelayMs: 100,
                                           advanceByMs: 150
                                         }))
                                   .then(() => fetchFrom(group, '/api/test/2', {
                                           text: 'second response',
                                           expectServerText: true,
                                           networkDelayMs: 100,
                                           advanceByMs: 150
                                         }))
                                   .then(() => done()));
          it('serves from the cache when the network is slow',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(() => fetchFrom(group, '/api/test/1', {text: 'first response'}))
                     .then(() => fetchFrom(group, '/api/test/2', {text: 'second response'}))
                     .then(() => expectMetadataEntries(2))
                     .then(() => fetchFrom(group, '/api/test/1', {
                             text: 'not used',
                             networkDelayMs: 300,
                             advanceByMs: 350,
                             expectFetched: true
                           }))
                     .then(text => expect(text).toBe('first response'))
                     .then(() => fetchFrom(group, '/api/test/2', {
                             text: 'not used',
                             networkDelayMs: 300,
                             advanceByMs: 350,
                             expectFetched: true
                           }))
                     .then(text => expect(text).toBe('second response'))
                     .then(() => done()));
          it('serves from the cache when the network is down',
             (done: DoneFn) =>
                 Promise.resolve()
                     .then(() => fetchFrom(group, '/api/test/1', {text: 'first response'}))
                     .then(() => fetchFrom(group, '/api/test/2', {text: 'second response'}))
                     .then(() => expectMetadataEntries(2))
                     .then(() => fetchFrom(group, '/api/test/1', {expectFetched: true}))
                     .then(text => expect(text).toBe('first response'))
                     .then(() => fetchFrom(group, '/api/test/2', {expectFetched: true}))
                     .then(text => expect(text).toBe('second response'))
                     .then(() => done()));
        });
      });
    });
  });
}
