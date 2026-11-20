/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MessageBus} from '../../../../protocol';
import {AngularDevtoolsError} from '../error';
import {DtLinkInitiator, exposeDtLinkApi} from './dtlink';
import {DtLinkApi, InitiatorApiType, RemoteCallPayload} from './types';
import {
  DTLINK_API_REQUEST,
  DTLINK_API_RESPONSE,
  asyncFn,
  asyncGeneratorFn,
  dtlinkRequestTopic,
  dtlinkResponseTopic,
  syncFn,
  voidAsyncFn,
  voidSyncFn,
} from './utils';

type Listener = (...args: any[]) => void;

/**
 * In-memory `MessageBus` that delivers the emitted messages
 * to its linked peer asynchronously (similar to `postMessage`).
 */
class FakeMessageBus extends MessageBus<any> {
  peer?: FakeMessageBus;
  private readonly listeners = new Map<PropertyKey, Set<Listener>>();
  private readonly emitted: {topic: PropertyKey; args: any[]}[] = [];

  override on(topic: PropertyKey, cb: Listener): () => void {
    const topicListeners = this.listeners.get(topic) ?? new Set<Listener>();
    this.listeners.set(topic, topicListeners);
    topicListeners.add(cb);

    return () => topicListeners.delete(cb);
  }

  override once(topic: PropertyKey, cb: Listener): void {
    const cleanUpFn = this.on(topic, (...args) => {
      cleanUpFn();
      cb(...args);
    });
  }

  override emit(topic: PropertyKey, args: any[] = []): boolean {
    this.emitted.push({topic, args});
    queueMicrotask(() => this.peer?.receive(topic, args));
    return true;
  }

  override destroy(): void {
    this.listeners.clear();
  }

  /** Simulates a message sent by the peer. */
  receive(topic: PropertyKey, args: any[] = []) {
    const listeners = this.listeners.get(topic) ?? [];

    for (const cb of listeners) {
      cb(...args);
    }
  }

  /** Returns the payloads (i.e. the first arguments) of all messages emitted on a topic. */
  emittedPayloads(topic: string): any[] {
    return this.emitted.filter((msg) => msg.topic === topic).map((msg) => msg.args[0]);
  }

  listenerCount(topic: string): number {
    return this.listeners.get(topic)?.size ?? 0;
  }
}

const realSetTimeout = window.setTimeout.bind(window);

function flush() {
  return new Promise<void>((resolve) => realSetTimeout(resolve));
}

//
// Mock remote calls
//

function double(n: number) {
  return n * 2;
}

async function sum(nums: number[]) {
  return nums.reduce((total, n) => total + n, 0);
}

async function* countTo(n: number) {
  for (let i = 1; i <= n; i++) {
    yield i;
  }
  return 'done';
}

function log(): void {}

async function save() {}

describe('DtLink', () => {
  let initiators: DtLinkInitiator[];
  let errorLogger: jasmine.Spy;

  function createInitiator<T extends DtLinkApi = any>(bus: FakeMessageBus): DtLinkInitiator<T> {
    const initiator = new DtLinkInitiator<T>(bus);
    initiators.push(initiator);
    return initiator;
  }

  beforeEach(() => {
    jasmine.clock().install();
    initiators = [];
    errorLogger = jasmine.createSpy('errorLogger');
  });

  afterEach(() => {
    for (const initiator of initiators) {
      initiator.destroy();
    }
    jasmine.clock().uninstall();
  });

  describe('exposeDtLinkApi', () => {
    let bus: FakeMessageBus;

    /** Simulates a remote call request sent by the initiator. */
    function request(name: string, id: string, args: any[] = []) {
      bus.receive(dtlinkRequestTopic(name), [{id, args} satisfies RemoteCallPayload]);
    }

    beforeEach(() => {
      bus = new FakeMessageBus();
    });

    it('should respond to API metadata requests with the serialized API', () => {
      exposeDtLinkApi(
        bus,
        [
          syncFn({double}),
          asyncFn({sum}),
          voidSyncFn({log}),
          voidAsyncFn({save}),
          asyncGeneratorFn({countTo}),
        ],
        {errorLogger},
      );

      bus.receive(DTLINK_API_REQUEST);

      // The sync calls are converted to async ones.
      expect(bus.emittedPayloads(DTLINK_API_RESPONSE)).toEqual([
        {
          double: InitiatorApiType.Async,
          sum: InitiatorApiType.Async,
          log: InitiatorApiType.VoidAsync,
          save: InitiatorApiType.VoidAsync,
          countTo: InitiatorApiType.AsyncGenerator,
        },
      ]);
    });

    it('should throw an error if two remote calls have the same name', () => {
      const api = [syncFn({double}), asyncFn({double: async (n: number) => n * 2})];

      expect(() => exposeDtLinkApi(bus, api, {errorLogger})).toThrowError(
        AngularDevtoolsError,
        'API with name "double" already exists. Please pick a different name',
      );
    });

    it('should respond to each request using its unique ID', () => {
      exposeDtLinkApi(bus, [syncFn({double})], {errorLogger});

      request('double', 'id-1', [1]);
      request('double', 'id-2', [2]);

      expect(bus.emittedPayloads(dtlinkResponseTopic('double'))).toEqual([
        {r: 2, id: 'id-1'},
        {r: 4, id: 'id-2'},
      ]);
    });

    it('should log errors with console.error by default', () => {
      spyOn(console, 'error');
      const error = new Error('boom');
      exposeDtLinkApi(bus, [
        syncFn({
          fail: () => {
            throw error;
          },
        }),
      ]);

      request('fail', 'id-1');

      expect(console.error).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
    });

    describe('Sync functions', () => {
      it('should call the function and respond with its return value', () => {
        exposeDtLinkApi(bus, [syncFn({double})], {errorLogger});

        request('double', 'id-1', [21]);

        const payloads = bus.emittedPayloads(dtlinkResponseTopic('double'));

        expect(payloads).toEqual([{r: 42, id: 'id-1'}]);
      });

      it('should respond with an error flag and log the error when the function throws', () => {
        const error = new Error('boom');
        exposeDtLinkApi(
          bus,
          [
            syncFn({
              fail: () => {
                throw error;
              },
            }),
          ],
          {errorLogger},
        );

        request('fail', 'id-1');

        const payloads = bus.emittedPayloads(dtlinkResponseTopic('fail'));

        expect(payloads).toEqual([{r: null, e: true, id: 'id-1'}]);
        expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
      });
    });

    describe('Async functions', () => {
      it('should call the function and respond with its resolved value', async () => {
        exposeDtLinkApi(bus, [asyncFn({sum})], {errorLogger});

        request('sum', 'id-1', [[1, 2, 3]]);
        await flush();

        const payloads = bus.emittedPayloads(dtlinkResponseTopic('sum'));

        expect(payloads).toEqual([{r: 6, id: 'id-1'}]);
      });

      it('should respond with an error flag and log the error when the function rejects', async () => {
        const error = new Error('boom');
        exposeDtLinkApi(bus, [asyncFn({fail: () => Promise.reject(error)})], {errorLogger});

        request('fail', 'id-1');
        await flush();

        const payloads = bus.emittedPayloads(dtlinkResponseTopic('fail'));

        expect(payloads).toEqual([{r: null, e: true, id: 'id-1'}]);
        expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
      });
    });

    describe('Void sync functions', () => {
      it('should call the function without responding', () => {
        const log = jasmine.createSpy<(msg: string) => void>('log');
        exposeDtLinkApi(bus, [voidSyncFn({log})], {errorLogger});

        request('log', 'id-1', ['hello']);

        expect(log).toHaveBeenCalledOnceWith('hello');
        expect(bus.emittedPayloads(dtlinkResponseTopic('log'))).toEqual([]);
      });

      it('should log the error without responding when the function throws', () => {
        const error = new Error('boom');
        exposeDtLinkApi(
          bus,
          [
            voidSyncFn({
              fail: () => {
                throw error;
              },
            }),
          ],
          {errorLogger},
        );

        request('fail', 'id-1');

        expect(bus.emittedPayloads(dtlinkResponseTopic('fail'))).toEqual([]);
        expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
      });
    });

    describe('Void async functions', () => {
      it('should call the function without responding', async () => {
        const save = jasmine.createSpy<(value: string) => Promise<void>>('save').and.resolveTo();
        exposeDtLinkApi(bus, [voidAsyncFn({save})], {errorLogger});

        request('save', 'id-1', ['value']);
        await flush();

        expect(save).toHaveBeenCalledOnceWith('value');
        expect(bus.emittedPayloads(dtlinkResponseTopic('save'))).toEqual([]);
      });

      it('should log the error without responding when the function rejects', async () => {
        const error = new Error('boom');
        exposeDtLinkApi(bus, [voidAsyncFn({fail: () => Promise.reject(error)})], {errorLogger});

        request('fail', 'id-1');
        await flush();

        expect(bus.emittedPayloads(dtlinkResponseTopic('fail'))).toEqual([]);
        expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
      });
    });

    describe('Async generators', () => {
      it('should respond with each yielded value followed by the return value', async () => {
        exposeDtLinkApi(bus, [asyncGeneratorFn({countTo})], {errorLogger});

        request('countTo', 'id-1', [3]);
        await flush();

        const payloads = bus.emittedPayloads(dtlinkResponseTopic('countTo'));
        expect(payloads).toEqual([
          {d: false, v: 1, id: 'id-1'},
          {d: false, v: 2, id: 'id-1'},
          {d: false, v: 3, id: 'id-1'},
          {d: true, v: 'done', id: 'id-1'},
        ]);
      });

      it('should respond with done and error flags, and log the error when the generator throws', async () => {
        const error = new Error('boom');
        async function* failAfterOne() {
          yield 1;
          throw error;
        }
        exposeDtLinkApi(bus, [asyncGeneratorFn({failAfterOne})], {errorLogger});

        request('failAfterOne', 'id-1');
        await flush();

        const payload = bus.emittedPayloads(dtlinkResponseTopic('failAfterOne'));
        expect(payload).toEqual([
          {d: false, v: 1, id: 'id-1'},
          {d: true, e: true, id: 'id-1'},
        ]);
        expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
      });
    });
  });

  describe('DtLinkInitiator', () => {
    let bus: FakeMessageBus;

    /** Simulates the target responding with its API metadata. */
    function respondWithMetadata(metadata: Record<string, InitiatorApiType>) {
      bus.receive(DTLINK_API_RESPONSE, [metadata]);
    }

    beforeEach(() => {
      bus = new FakeMessageBus();
    });

    it('should request the API metadata on creation', () => {
      createInitiator(bus);

      expect(bus.emittedPayloads(DTLINK_API_REQUEST).length).toBe(1);
    });

    it('should retry the API metadata request every 2.5s until the target responds', () => {
      createInitiator(bus);

      jasmine.clock().tick(2499);
      expect(bus.emittedPayloads(DTLINK_API_REQUEST).length).toBe(1);

      jasmine.clock().tick(1);
      expect(bus.emittedPayloads(DTLINK_API_REQUEST).length).toBe(2);

      jasmine.clock().tick(2500);
      expect(bus.emittedPayloads(DTLINK_API_REQUEST).length).toBe(3);

      respondWithMetadata({});
      jasmine.clock().tick(10000);
      expect(bus.emittedPayloads(DTLINK_API_REQUEST).length).toBe(3);
    });

    it('should stop retrying the API metadata request when destroyed', () => {
      const initiator = createInitiator(bus);

      initiator.destroy();
      jasmine.clock().tick(10000);

      expect(bus.emittedPayloads(DTLINK_API_REQUEST).length).toBe(1);
    });

    it('should not expose `then` and symbol properties on the API', () => {
      const api = createInitiator(bus).api as any;

      // Otherwise the API will be treated as a thenable.
      expect(api.then).toBeUndefined();
      expect(api[Symbol.iterator]).toBeUndefined();
    });

    it('should send the call arguments along with a unique request ID', async () => {
      const api = createInitiator(bus).api as any;
      respondWithMetadata({double: InitiatorApiType.Async});

      api.double(1);
      api.double(2);
      await flush();

      const [first, second] = bus.emittedPayloads(dtlinkRequestTopic('double'));
      expect(first).toEqual({id: jasmine.any(String), args: [1]});
      expect(second).toEqual({id: jasmine.any(String), args: [2]});
      expect(first.id).not.toBe(second.id);
    });

    it('should resolve only with the response that matches the request ID', async () => {
      const api = createInitiator(bus).api as any;
      respondWithMetadata({double: InitiatorApiType.Async});

      const call = api.double(21);
      await flush();
      const [{id}] = bus.emittedPayloads(dtlinkRequestTopic('double'));

      const responseTopic = dtlinkResponseTopic('double');

      bus.receive(responseTopic, [{r: 0, id: 'unrelated-id'}]);
      await flush();
      await expectAsync(call).toBePending();

      bus.receive(responseTopic, [{r: 42, id}]);
      await expectAsync(call).toBeResolvedTo(42);
    });

    it('should stop listening for the response once the call settles', async () => {
      const api = createInitiator(bus).api as any;
      respondWithMetadata({double: InitiatorApiType.Async});

      const responseTopic = dtlinkResponseTopic('double');
      const call = api.double(21);
      await flush();
      expect(bus.listenerCount(responseTopic)).toBe(1);

      const [{id}] = bus.emittedPayloads(dtlinkRequestTopic('double'));
      bus.receive(responseTopic, [{r: 42, id}]);
      await call;

      // The listener is destroyed.
      expect(bus.listenerCount(responseTopic)).toBe(0);
    });

    it('should resolve void calls without waiting for a response', async () => {
      const api = createInitiator(bus).api as any;
      respondWithMetadata({log: InitiatorApiType.VoidAsync});

      await expectAsync(api.log('hello')).toBeResolvedTo(undefined);

      const payloads = bus.emittedPayloads(dtlinkRequestTopic('log'));
      expect(payloads).toEqual([{id: jasmine.any(String), args: ['hello']}]);
      expect(bus.listenerCount(dtlinkResponseTopic('log'))).toBe(0);
    });

    it('should reject calls to remote calls that are not exposed by the target', async () => {
      const api = createInitiator(bus).api as any;
      respondWithMetadata({double: InitiatorApiType.Async});

      await expectAsync(api.missing()).toBeRejectedWithError(
        AngularDevtoolsError,
        '"missing" remote API is not available to call from the initiator. Check what is exposed on the target.',
      );
      expect(bus.emittedPayloads(dtlinkRequestTopic('missing'))).toEqual([]);
    });

    it('should reject calls if the API metadata is not received within 20s', async () => {
      const api = createInitiator(bus).api as any;

      const call = api.double(21);

      jasmine.clock().tick(19999);
      await flush();
      await expectAsync(call).toBePending();

      jasmine.clock().tick(1);
      await expectAsync(call).toBeRejectedWithError(
        AngularDevtoolsError,
        'The DtLink initiator was unable to fetch the API metadata from the target. Timed out after 20s',
      );
      expect(bus.emittedPayloads(dtlinkRequestTopic('double'))).toEqual([]);
    });

    it('should reject calls that the target does not respond to within 30s', async () => {
      const api = createInitiator(bus).api as any;
      respondWithMetadata({double: InitiatorApiType.Async});

      const call = api.double(21);
      await flush();

      jasmine.clock().tick(29999);
      await flush();
      await expectAsync(call).toBePending();

      jasmine.clock().tick(1);
      await expectAsync(call).toBeRejectedWithError(
        AngularDevtoolsError,
        'The remote call of DtLink.double timed out after 30s.',
      );
      expect(bus.listenerCount(dtlinkResponseTopic('double'))).toBe(0);
    });
  });

  describe('Remote calls', () => {
    let initiatorBus: FakeMessageBus;
    let targetBus: FakeMessageBus;

    /** Exposes the API on the target and creates an initiator for it. */
    function setUp<T extends DtLinkApi>(api: T): DtLinkInitiator<T> {
      exposeDtLinkApi(targetBus, api, {errorLogger});
      return createInitiator<T>(initiatorBus);
    }

    beforeEach(() => {
      initiatorBus = new FakeMessageBus();
      targetBus = new FakeMessageBus();
      initiatorBus.peer = targetBus;
      targetBus.peer = initiatorBus;
    });

    it('should resolve with the return value of a sync function', async () => {
      const dtLink = setUp([syncFn({double})]);

      await expectAsync(dtLink.api.double(21)).toBeResolvedTo(42);
    });

    it('should resolve with the resolved value of an async function', async () => {
      const dtLink = setUp([asyncFn({sum})]);

      await expectAsync(dtLink.api.sum([1, 2, 3])).toBeResolvedTo(6);
    });

    it('should call a void sync function and resolve with undefined', async () => {
      const log = jasmine.createSpy<(msg: string, count: number) => void>('log');
      const dtLink = setUp([voidSyncFn({log})]);

      await expectAsync(dtLink.api.log('hello', 2)).toBeResolvedTo(undefined);
      await flush();

      expect(log).toHaveBeenCalledOnceWith('hello', 2);
    });

    it('should call a void async function and resolve with undefined', async () => {
      const save = jasmine.createSpy<(value: string) => Promise<void>>('save').and.resolveTo();
      const dtLink = setUp([voidAsyncFn({save})]);

      await expectAsync(dtLink.api.save('value')).toBeResolvedTo(undefined);
      await flush();

      expect(save).toHaveBeenCalledOnceWith('value');
    });

    it('should reject with an error when a sync function throws', async () => {
      const error = new Error('boom');
      const dtLink = setUp([
        syncFn({
          fail: () => {
            throw error;
          },
        }),
      ]);

      await expectAsync(dtLink.api.fail()).toBeRejectedWithError(
        AngularDevtoolsError,
        'DtLink: The "fail" call resulted in a thrown error. Check the target logs.',
      );
      expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
    });

    it('should reject with an error when an async function rejects', async () => {
      const error = new Error('boom');
      const dtLink = setUp([asyncFn({fail: () => Promise.reject(error)})]);

      await expectAsync(dtLink.api.fail()).toBeRejectedWithError(
        AngularDevtoolsError,
        'DtLink: The "fail" call resulted in a thrown error. Check the target logs.',
      );
      expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
    });

    it('should resolve concurrent calls with their own responses', async () => {
      const resolvers = new Map<string, () => void>();
      const echo = (value: string) => {
        return new Promise<string>((res) => resolvers.set(value, () => res(value)));
      };

      const dtLink = setUp([asyncFn({echo})]);

      const first = dtLink.api.echo('first');
      const second = dtLink.api.echo('second');
      await flush();

      resolvers.get('second')!();
      await expectAsync(second).toBeResolvedTo('second');
      await expectAsync(first).toBePending();

      resolvers.get('first')!();
      await expectAsync(first).toBeResolvedTo('first');
    });

    it('should get the API metadata once the target becomes available', async () => {
      // First set up the initiator
      const api = [syncFn({double})];
      const dtLink = createInitiator<typeof api>(initiatorBus);

      await flush();
      // Then the target
      exposeDtLinkApi(targetBus, api, {errorLogger});

      // Wait 2.5s before the check to give time to the retry mechanism.
      const call = dtLink.api.double(21);
      jasmine.clock().tick(2500);

      await expectAsync(call).toBeResolvedTo(42);
    });

    describe('Async generators', () => {
      async function collectValues<T>(generator: AsyncGenerator<T>): Promise<T[]> {
        const values: T[] = [];
        for await (const value of generator) {
          values.push(value);
        }
        return values;
      }

      it('should yield the streamed values and return the final value', async () => {
        const dtLink = setUp([asyncGeneratorFn({countTo})]);
        const generator = await dtLink.api.countTo(3);

        await expectAsync(generator.next()).toBeResolvedTo({value: 1, done: false});
        await expectAsync(generator.next()).toBeResolvedTo({value: 2, done: false});
        await expectAsync(generator.next()).toBeResolvedTo({value: 3, done: false});
        await expectAsync(generator.next()).toBeResolvedTo({value: 'done', done: true});
      });

      it('should throw an error during yielding', async () => {
        const error = new Error('boom');
        async function* failAfter(n: number) {
          for (let i = 1; i <= n; i++) {
            yield i;
          }
          throw error;
        }
        const dtLink = setUp([asyncGeneratorFn({failAfter})]);
        const generator = await dtLink.api.failAfter(2);

        await expectAsync(generator.next()).toBeResolvedTo({value: 1, done: false});
        await expectAsync(generator.next()).toBeResolvedTo({value: 2, done: false});
        await expectAsync(generator.next()).toBeRejectedWithError(
          AngularDevtoolsError,
          'DtLink: The "failAfter" call resulted in a thrown error. Check the target logs.',
        );
        expect(errorLogger).toHaveBeenCalledOnceWith('DtLink remote call error:', error);
        expect(initiatorBus.listenerCount(dtlinkResponseTopic('failAfter'))).toBe(0);
      });

      it('should stream concurrent iterations independently', async () => {
        const dtLink = setUp([asyncGeneratorFn({countTo})]);

        const [first, second] = await Promise.all([dtLink.api.countTo(2), dtLink.api.countTo(3)]);
        const values = await Promise.all([collectValues(first), collectValues(second)]);

        expect(values).toEqual([
          [1, 2],
          [1, 2, 3],
        ]);
      });

      it('should stop listening after the values are streamed', async () => {
        const dtLink = setUp([asyncGeneratorFn({countTo})]);

        const values = await collectValues(await dtLink.api.countTo(3));
        expect(values).toEqual([1, 2, 3]);

        expect(initiatorBus.listenerCount(dtlinkResponseTopic('countTo'))).toBe(0);
      });

      it('should stop listening when the iteration ends early', async () => {
        const dtLink = setUp([asyncGeneratorFn({countTo})]);
        const generator = await dtLink.api.countTo(5);

        for await (const value of generator) {
          if (value === 2) {
            break;
          }
        }

        expect(initiatorBus.listenerCount(dtlinkResponseTopic('countTo'))).toBe(0);
      });
    });
  });
});
