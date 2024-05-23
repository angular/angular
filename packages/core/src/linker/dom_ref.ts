/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {registerDomRefInitializer} from '../render3/after_render_hooks';
import {TNode} from '../render3/interfaces/node';
import {LView} from '../render3/interfaces/view';
import {getCurrentTNode, getLView} from '../render3/state';
import {getNativeByTNode} from '../render3/util/view_utils';

/**
 * Symbol used to tell `DomRef`s apart from other functions.
 */
export const DOMREF = /* @__PURE__ */ Symbol('DOMREF');

/**
 * A value that can be used to obtain a reference to a native DOM element.
 *
 * Prefer to use templating and data-binding provided by Angular instead.
 * This API should be used as a last resort when direct DOM access is unavoidable.
 *
 * While a `DomRef` value may be passed around without restriction, attempting
 * to obtain the native DOM element before the next time the application has
 * rendered will throw an error. To avoid this, you should only unwrap a `DomRef`
 * inside of `afterRender`, `afterNextRender`, or an event handler in response to a
 * user interaction.
 *
 * @developerPreview
 */
// Note: This needs to be an interface. If it were a type, we would be
// unable to export the token class below with the same name, which
// would make it less ergonomic to use.
export interface DomRef<T> {
  (): T;
  readonly [DOMREF]: unknown;
}

/**
 * Creates an DomRef from the most recent node.
 */
function injectDomRef(): DomRef<any> {
  return createDomRef(getCurrentTNode()!, getLView());
}

function invalidDomRefGetter(): never {
  throw new RuntimeError(
    RuntimeErrorCode.DOMREF_NOT_READY,
    ngDevMode &&
      'Attempted to read DomRef before it was ready. Make sure that you are waiting ' +
        'until the next render before reading.',
  );
}

/**
 * Creates a DomRef for the given node.
 */
function createDomRef<T>(tNode: TNode, lView: LView): DomRef<T> {
  let getDomRefImpl: () => T = invalidDomRefGetter;
  const getter = function getDomRef() {
    return getDomRefImpl();
  } as DomRef<T>;

  const nativeElement = getNativeByTNode(tNode, lView) as T;
  // Note: we don't use `internalAfterNextRender` here, as we want
  // to ensure that the DomRef is only initialized imediately prior
  // to the first user after*Render callback. Using `internalAfterNextRender`
  // would risk exposing the native element too early.
  registerDomRefInitializer(() => {
    getDomRefImpl = () => nativeElement;
  });

  // We don't currently store anything on our symbol, but we need
  // to provide it so that we can identify the function as a DomRef.
  (getter as any)[DOMREF] = null;
  return getter;
}

// This class acts as a DI token for DomRef.
export class DomRef<T> {
  /** @internal */
  constructor() {
    throw new RuntimeError(
      RuntimeErrorCode.DOMREF_CONSTRUCTOR,
      ngDevMode && 'DomRef cannot not be constructed manually.',
    );
  }

  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__: () => DomRef<any> = injectDomRef;
}
