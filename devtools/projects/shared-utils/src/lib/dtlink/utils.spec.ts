/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AngularDevtoolsError} from '../error';
import {ApiMetadata, InitiatorApiType, TargetCallType} from './types';
import {
  DTLINK_API_REQUEST,
  DTLINK_API_RESPONSE,
  asyncFn,
  asyncGeneratorFn,
  dtlinkRequestTopic,
  dtlinkResponseTopic,
  isCallableMetadata,
  serializeApiMetadata,
  syncFn,
  voidAsyncFn,
  voidSyncFn,
  withTimeout,
} from './utils';

describe('DtLink utils', () => {
  describe('Topics', () => {
    it('should create a request topic for an API', () => {
      expect(dtlinkRequestTopic('getUser')).toBe('dtlink#getUser_request');
    });

    it('should create a response topic for an API', () => {
      expect(dtlinkResponseTopic('getUser')).toBe('dtlink#getUser_response');
    });

    it('should create distinct topics for different APIs', () => {
      expect(dtlinkRequestTopic('getUser')).not.toBe(dtlinkRequestTopic('getUsers'));
      expect(dtlinkResponseTopic('getUser')).not.toBe(dtlinkResponseTopic('getUsers'));
    });

    it('should use distinct API metadata request and response topics', () => {
      expect(DTLINK_API_REQUEST).not.toBe(DTLINK_API_RESPONSE);
    });
  });

  describe('Function decorators', () => {
    it('should create sync function metadata', () => {
      const double = (n: number) => n * 2;

      expect(syncFn({double})).toEqual({name: 'double', type: TargetCallType.Sync, fn: double});
    });

    it('should create async function metadata', () => {
      const fetchCount = async () => 42;

      expect(asyncFn({fetchCount})).toEqual({
        name: 'fetchCount',
        type: TargetCallType.Async,
        fn: fetchCount,
      });
    });

    it('should create void sync function metadata', () => {
      const log = (msg: string) => {};

      expect(voidSyncFn({log})).toEqual({name: 'log', type: TargetCallType.VoidSync, fn: log});
    });

    it('should create void async function metadata', () => {
      const save = async (value: string) => {};

      expect(voidAsyncFn({save})).toEqual({name: 'save', type: TargetCallType.VoidAsync, fn: save});
    });

    it('should create async generator metadata', () => {
      async function* stream() {
        yield 1;
      }

      expect(asyncGeneratorFn({stream})).toEqual({
        name: 'stream',
        type: TargetCallType.AsyncGenerator,
        fn: stream,
      });
    });
  });

  describe('isCallableMetadata', () => {
    it('should return true for metadata with a callable', () => {
      expect(isCallableMetadata(syncFn({double: (n: number) => n * 2}))).toBeTrue();
    });

    it('should return false for metadata without a callable', () => {
      const metadata = {name: 'double', type: TargetCallType.Sync} as ApiMetadata;

      expect(isCallableMetadata(metadata)).toBeFalse();
    });
  });

  describe('serializeApiMetadata', () => {
    const api = [
      syncFn({getCount: () => 1}),
      asyncFn({fetchUser: async () => 'user'}),
      voidSyncFn({log: () => {}}),
      voidAsyncFn({save: async () => {}}),
      asyncGeneratorFn({
        stream: async function* () {
          yield 1;
        },
      }),
    ];

    it('should map each target call type to its initiator API type', () => {
      expect(serializeApiMetadata(api)).toEqual({
        getCount: InitiatorApiType.Async,
        fetchUser: InitiatorApiType.Async,
        log: InitiatorApiType.VoidAsync,
        save: InitiatorApiType.VoidAsync,
        stream: InitiatorApiType.AsyncGenerator,
      });
    });

    it('should return an empty object for an empty API', () => {
      expect(serializeApiMetadata([])).toEqual({});
    });

    it('should produce metadata that can be sent as a message', () => {
      const serialized = serializeApiMetadata(api);

      // `structuredClone` throws for non-serializable values
      expect(structuredClone(serialized)).toEqual(serialized);
    });
  });

  describe('withTimeout', () => {
    it('should resolve with the value of a promise that resolves in time', async () => {
      const result = withTimeout(Promise.resolve('value'), 1000, 'Timed out');

      await expectAsync(result).toBeResolvedTo('value');
    });

    it('should reject with the error of a promise that rejects in time', async () => {
      const error = new Error('original');
      const result = withTimeout(Promise.reject(error), 1000, 'Timed out');

      await expectAsync(result).toBeRejectedWith(error);
    });

    describe('with a mock clock', () => {
      beforeEach(() => {
        jasmine.clock().install();
      });

      afterEach(() => {
        jasmine.clock().uninstall();
      });

      it('should reject once the timeout elapses', async () => {
        const result = withTimeout(new Promise(() => {}), 1000, 'Timed out');

        jasmine.clock().tick(999);
        await expectAsync(result).toBePending();

        jasmine.clock().tick(1);
        await expectAsync(result).toBeRejectedWithError(AngularDevtoolsError, 'Timed out');
      });
    });

    it('should clear the timeout when the promise resolves', async () => {
      // Using the real timers since the mock clock functions can't be spied.
      const setTimeoutSpy = spyOn(window, 'setTimeout').and.callThrough();
      const clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callThrough();

      await withTimeout(Promise.resolve('value'), 1000, 'Timed out');

      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(clearTimeoutSpy).toHaveBeenCalledOnceWith(
        setTimeoutSpy.calls.mostRecent().returnValue,
      );
    });
  });
});
