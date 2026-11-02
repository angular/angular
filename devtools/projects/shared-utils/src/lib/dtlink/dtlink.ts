/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MessageBus} from '../../../../protocol';
import {
  DtLinkApi,
  DtLinkRemoteApi,
  RemoteApiMetadata,
  InitiatorApiType,
  AsyncFn,
  VoidAsyncFn,
  ApiMetadata,
  AsyncGeneratorFn,
  SyncFn,
  VoidSyncFn,
  RemoteCallPayload,
} from './types';
import {
  isAsyncFn,
  isAsyncGeneratorFn,
  isSyncFn,
  isVoidAsyncFn,
  dtlinkRequestTopic,
  dtlinkResponseTopic,
  DTLINK_API_RESPONSE,
  DTLINK_API_REQUEST,
  serializeApiMetadata,
  withTimeout,
} from './utils';
import {AngularDevtoolsError} from '../error';

const API_REQUEST_RETRY = 2500;
const REMOTE_CALL_ERRORED = 'REMOTE_CALL_ERRORED';
const METADATA_REQ_TIMEOUT = 20000;
const REMOTE_CALL_TIMEOUT = 30000;
const dtLinkErrorMsg = (callName: string) =>
  `DtLink: The "${callName}" call resulted in a thrown error. Check the target logs.`;

/** Function response exchanged between the target and initiator. */
type FunctionResponse = {
  /** Request ID */
  id: string;
  /** Response */
  r: any;
  /** Errored flag */
  e?: boolean;
};

/** Generator response exchanged between the target and initiator. */
type GeneratorResponse = {
  /** Request ID */
  id: string;
  /** Done flag */
  d: boolean;
  /** Value */
  v?: any;
  /** Errored flag */
  e?: boolean;
};

export class DtLinkInitiator<T extends DtLinkApi = any> {
  private apiRequestRetryInterval?: ReturnType<typeof setInterval>;
  private remoteApiMetadataResolver?: (d: RemoteApiMetadata) => void;
  private remoteApiMetadata = new Promise<RemoteApiMetadata>(
    (res) => (this.remoteApiMetadataResolver = res),
  );

  constructor(private messageBus: MessageBus<any>) {
    // Request the remote API from the target.
    messageBus.once(DTLINK_API_RESPONSE, (remoteApi: RemoteApiMetadata) => {
      clearInterval(this.apiRequestRetryInterval);
      this.remoteApiMetadataResolver?.(remoteApi);
    });
    messageBus.emit(DTLINK_API_REQUEST);

    this.apiRequestRetryInterval = setInterval(() => {
      messageBus.emit(DTLINK_API_REQUEST);
    }, API_REQUEST_RETRY);
  }

  /** Initiator API that allows remote calls to the target. */
  api: DtLinkRemoteApi<T> = new Proxy({} as any, {
    get: (_, prop) => {
      if (typeof prop === 'symbol' || prop === 'then') {
        return;
      }

      return async (...args: any[]) => {
        const metadata = await withTimeout(
          this.remoteApiMetadata,
          METADATA_REQ_TIMEOUT,
          `The DtLink initiator was unable to fetch the API metadata from the target. Timed out after ${METADATA_REQ_TIMEOUT / 1000}s`,
        );

        const type = metadata[prop];

        if (type === undefined) {
          throw new AngularDevtoolsError(
            `"${prop}" remote API is not available to call from the initiator. Check what is exposed on the target.`,
          );
        }

        if (type === InitiatorApiType.AsyncGenerator) {
          return this.constructAsyncGenerator(prop, ...args);
        }

        return this.constructAsyncFn(type, prop, ...args);
      };
    },
  });

  /** Destroys and disposes the DtLink instance. */
  destroy() {
    clearInterval(this.apiRequestRetryInterval);
  }

  private constructAsyncGenerator(name: string, ...args: any[]) {
    const that = this;

    return (async function* () {
      const queue: any[] = [];
      let wake: (() => void) | null = null;
      let done = false;
      let errored = false;
      let returnValue: any;
      const id = crypto.randomUUID();

      const cleanUp = that.messageBus.on(
        dtlinkResponseTopic(name),
        ({d, v: value, e, id: targetId}: GeneratorResponse) => {
          if (id !== targetId) {
            return;
          }
          if (e) {
            done = true;
            errored = true;
          }
          if (d) {
            done = true;
            returnValue = value;
          } else {
            queue.push(value);
          }
          wake?.();
        },
      );
      const payload: RemoteCallPayload = {id, args};
      that.messageBus.emit(dtlinkRequestTopic(name), [payload]);

      try {
        while (!done || queue.length) {
          while (queue.length) {
            yield queue.shift();
          }
          if (!done) {
            await new Promise<void>((res) => (wake = res));
            wake = null;
          }
        }
        if (errored) {
          throw REMOTE_CALL_ERRORED;
        }

        return returnValue;
      } catch (err) {
        if (err === REMOTE_CALL_ERRORED) {
          throw new AngularDevtoolsError(dtLinkErrorMsg(name));
        }
        throw err;
      } finally {
        cleanUp();
      }
    })();
  }

  private constructAsyncFn(type: InitiatorApiType, name: string, ...args: any[]) {
    let cleanUpFn: (() => void) | undefined;

    const promise = new Promise<any>((resolve, reject) => {
      const id = crypto.randomUUID();

      // In case the call should return a value.
      if (type === InitiatorApiType.Async) {
        cleanUpFn = this.messageBus.on(
          dtlinkResponseTopic(name),
          ({e: errored, r: response, id: targetId}: FunctionResponse) => {
            if (id !== targetId) {
              return;
            }
            if (errored) {
              reject(new AngularDevtoolsError(dtLinkErrorMsg(name)));
            } else {
              resolve(response);
            }
          },
        );
      } else {
        // Return undefined, if void.
        resolve(undefined);
      }

      const payload: RemoteCallPayload = {id, args};
      this.messageBus.emit(dtlinkRequestTopic(name), [payload]);
    });

    return withTimeout(
      promise,
      REMOTE_CALL_TIMEOUT,
      `The remote call of DtLink.${name} timed out after ${REMOTE_CALL_TIMEOUT / 1000}s.`,
    ).finally(() => cleanUpFn?.());
  }
}

/**
 * Exposes the provided API to be callable from the initiator.
 */
export function exposeDtLinkApi(
  messageBus: MessageBus<any>,
  api: DtLinkApi,
  options?: {errorLogger: (...data: any[]) => void},
) {
  const names = new Set<string>();
  const cleanUpFns: (() => void)[] = [];
  const errorLogger = options?.errorLogger ?? console.error;
  const dtLinkErrorLogger = (...data: any[]) => errorLogger('DtLink remote call error:', ...data);

  for (const metadata of api) {
    if (names.has(metadata.name)) {
      throw new AngularDevtoolsError(
        `API with name "${metadata.name}" already exists. Please pick a different name`,
      );
    }
    names.add(metadata.name);

    const {fn, type} = metadata;
    let exposeCleanUp: () => void;

    if (isAsyncFn(fn, type) || isVoidAsyncFn(fn, type)) {
      exposeCleanUp = exposeAsyncFn(messageBus, metadata, fn, dtLinkErrorLogger);
    } else if (isAsyncGeneratorFn(fn, type)) {
      exposeCleanUp = exposeAsyncGenerator(messageBus, metadata, fn, dtLinkErrorLogger);
    } else {
      exposeCleanUp = exposeSyncFn(messageBus, metadata, fn, dtLinkErrorLogger);
    }
    cleanUpFns.push(exposeCleanUp);
  }

  const metadataCleanUp = listenForApiRequests(messageBus, api);

  return () => {
    for (const fn of cleanUpFns) {
      fn();
    }
    metadataCleanUp();
  };
}

function exposeAsyncFn(
  messageBus: MessageBus<any>,
  {name, type}: ApiMetadata,
  fn: AsyncFn | VoidAsyncFn,
  errorLogger: (...data: any[]) => void,
) {
  const requestTopic = dtlinkRequestTopic(name);
  const responseTopic = dtlinkResponseTopic(name);

  return messageBus.on(requestTopic, ({id, args}: RemoteCallPayload) => {
    const shouldRespond = isAsyncFn(fn, type);
    fn(...args)
      .then((resp) => {
        if (shouldRespond) {
          messageBus.emit(responseTopic, [{r: resp, id} satisfies FunctionResponse]);
        }
      })
      .catch((err) => {
        if (shouldRespond) {
          messageBus.emit(responseTopic, [{r: null, e: true, id} satisfies FunctionResponse]);
        }
        errorLogger(err);
      });
  });
}

function exposeAsyncGenerator(
  messageBus: MessageBus<any>,
  {name}: ApiMetadata,
  fn: AsyncGeneratorFn,
  errorLogger: (...data: any[]) => void,
) {
  const requestTopic = dtlinkRequestTopic(name);
  const responseTopic = dtlinkResponseTopic(name);

  return messageBus.on(requestTopic, ({id, args}: RemoteCallPayload) => {
    const generator = fn(...args);
    const step = (): Promise<void> =>
      generator
        .next()
        .then((result) => {
          if (!result.done) {
            messageBus.emit(responseTopic, [
              {d: false, v: result.value, id} satisfies GeneratorResponse,
            ]);
            step();
          } else {
            messageBus.emit(responseTopic, [
              {d: true, v: result.value, id} satisfies GeneratorResponse,
            ]);
          }
        })
        .catch((err) => {
          messageBus.emit(responseTopic, [{d: true, e: true, id}]);
          errorLogger(err);
        });

    step();
  });
}

function exposeSyncFn(
  messageBus: MessageBus<any>,
  {name, type}: ApiMetadata,
  fn: SyncFn | VoidSyncFn,
  errorLogger: (...data: any[]) => void,
) {
  const requestTopic = dtlinkRequestTopic(name);
  const responseTopic = dtlinkResponseTopic(name);

  return messageBus.on(requestTopic, ({id, args}: RemoteCallPayload) => {
    let response: any;
    let errored = false;
    const shouldRespond = isSyncFn(fn, type);

    try {
      response = fn(...args);
    } catch (err) {
      if (shouldRespond) {
        messageBus.emit(responseTopic, [{r: null, e: true, id} satisfies FunctionResponse]);
      }
      errored = true;
      errorLogger(err);
    } finally {
      if (!errored && shouldRespond) {
        messageBus.emit(responseTopic, [{r: response, id} satisfies FunctionResponse]);
      }
    }
  });
}

function listenForApiRequests(messageBus: MessageBus<any>, api: DtLinkApi) {
  // Emit the exposed API to the initiator.
  return messageBus.on(DTLINK_API_REQUEST, () => {
    const serialized = serializeApiMetadata(api);
    messageBus.emit(DTLINK_API_RESPONSE, [serialized]);
  });
}
