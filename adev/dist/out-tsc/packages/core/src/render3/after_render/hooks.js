/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TracingService} from '../../application/tracing';
import {assertInInjectionContext} from '../../di';
import {Injector} from '../../di/injector';
import {inject} from '../../di/injector_compatibility';
import {DestroyRef} from '../../linker/destroy_ref';
import {performanceMarkFeature} from '../../util/performance';
import {assertNotInReactiveContext} from '../reactivity/asserts';
import {ViewContext} from '../view_context';
import {AfterRenderImpl, AfterRenderManager, AfterRenderSequence} from './manager';
export function afterEveryRender(callbackOrSpec, options) {
  ngDevMode &&
    assertNotInReactiveContext(
      afterEveryRender,
      'Call `afterEveryRender` outside of a reactive context. For example, schedule the render ' +
        'callback inside the component constructor`.',
    );
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(afterEveryRender);
  }
  const injector = options?.injector ?? inject(Injector);
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return NOOP_AFTER_RENDER_REF;
  }
  performanceMarkFeature('NgAfterRender');
  return afterEveryRenderImpl(callbackOrSpec, injector, options, /* once */ false);
}
export function afterNextRender(callbackOrSpec, options) {
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(afterNextRender);
  }
  const injector = options?.injector ?? inject(Injector);
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return NOOP_AFTER_RENDER_REF;
  }
  performanceMarkFeature('NgAfterNextRender');
  return afterEveryRenderImpl(callbackOrSpec, injector, options, /* once */ true);
}
function getHooks(callbackOrSpec) {
  if (callbackOrSpec instanceof Function) {
    return [undefined, undefined, /* MixedReadWrite */ callbackOrSpec, undefined];
  } else {
    return [
      callbackOrSpec.earlyRead,
      callbackOrSpec.write,
      callbackOrSpec.mixedReadWrite,
      callbackOrSpec.read,
    ];
  }
}
/**
 * Shared implementation for `afterEveryRender` and `afterNextRender`.
 */
function afterEveryRenderImpl(callbackOrSpec, injector, options, once) {
  const manager = injector.get(AfterRenderManager);
  // Lazily initialize the handler implementation, if necessary. This is so that it can be
  // tree-shaken if `afterEveryRender` and `afterNextRender` aren't used.
  manager.impl ??= injector.get(AfterRenderImpl);
  const tracing = injector.get(TracingService, null, {optional: true});
  const destroyRef = options?.manualCleanup !== true ? injector.get(DestroyRef) : null;
  const viewContext = injector.get(ViewContext, null, {optional: true});
  const sequence = new AfterRenderSequence(
    manager.impl,
    getHooks(callbackOrSpec),
    viewContext?.view,
    once,
    destroyRef,
    tracing?.snapshot(null),
  );
  manager.impl.register(sequence);
  return sequence;
}
/** `AfterRenderRef` that does nothing. */
export const NOOP_AFTER_RENDER_REF = {
  destroy() {},
};
//# sourceMappingURL=hooks.js.map
