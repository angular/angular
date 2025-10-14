/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertInInjectionContext, resource, signal, ɵRuntimeError} from '../../src/core';
import {encapsulateResourceError} from '../../src/resource/resource';
export function rxResource(opts) {
  if (ngDevMode && !opts?.injector) {
    assertInInjectionContext(rxResource);
  }
  return resource({
    ...opts,
    loader: undefined,
    stream: (params) => {
      let sub;
      // Track the abort listener so it can be removed if the Observable completes (as a memory
      // optimization).
      const onAbort = () => sub?.unsubscribe();
      params.abortSignal.addEventListener('abort', onAbort);
      // Start off stream as undefined.
      const stream = signal({value: undefined});
      let resolve;
      const promise = new Promise((r) => (resolve = r));
      function send(value) {
        stream.set(value);
        resolve?.(stream);
        resolve = undefined;
      }
      // TODO(alxhub): remove after g3 updated to rename loader -> stream
      const streamFn = opts.stream ?? opts.loader;
      if (streamFn === undefined) {
        throw new ɵRuntimeError(
          990 /* ɵRuntimeErrorCode.MUST_PROVIDE_STREAM_OPTION */,
          ngDevMode && `Must provide \`stream\` option.`,
        );
      }
      sub = streamFn(params).subscribe({
        next: (value) => send({value}),
        error: (error) => {
          send({error: encapsulateResourceError(error)});
          params.abortSignal.removeEventListener('abort', onAbort);
        },
        complete: () => {
          if (resolve) {
            send({
              error: new ɵRuntimeError(
                991 /* ɵRuntimeErrorCode.RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE */,
                ngDevMode && 'Resource completed before producing a value',
              ),
            });
          }
          params.abortSignal.removeEventListener('abort', onAbort);
        },
      });
      return promise;
    },
  });
}
//# sourceMappingURL=rx_resource.js.map
