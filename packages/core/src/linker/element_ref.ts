/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {injectElementRef as render3InjectElementRef} from '../render3/view_engine_compatibility';
import {noop} from '../util/noop';

/**
 * A wrapper around a native element inside of a View.
 *
 * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
 * element.
 *
 * @security Permitting direct access to the DOM can make your application more vulnerable to
 * XSS attacks. Carefully review any use of `ElementRef` in your code. For more detail, see the
 * [Security Guide](http://g.co/ng/security).
 *
 * @publicApi
 */
// Note: We don't expose things like `Injector`, `ViewContainer`, ... here,
// i.e. users have to ask for what they need. With that, we can build better analysis tools
// and could do better codegen in the future.
export class ElementRef<T = any> {
  /**
   * The underlying native element or `null` if direct access to native elements is not supported
   * (e.g. when the application runs in a web worker).
   *
   * <div class="callout is-critical">
   *   <header>Use with caution</header>
   *   <p>
   *    Use this API as the last resort when direct access to DOM is needed. Use templating and
   *    data-binding provided by Angular instead. Alternatively you can take a look at {@link
   * Renderer2}
   *    which provides API that can safely be used even when direct access to native elements is not
   *    supported.
   *   </p>
   *   <p>
   *    Relying on direct DOM access creates tight coupling between your application and rendering
   *    layers which will make it impossible to separate the two and deploy your application into a
   *    web worker.
   *   </p>
   * </div>
   *
   */
  public nativeElement: T;

  constructor(nativeElement: T) { this.nativeElement = nativeElement; }

  /** @internal */
  static __NG_ELEMENT_ID__: () => ElementRef = () => SWITCH_ELEMENT_REF_FACTORY(ElementRef);
}

export const SWITCH_ELEMENT_REF_FACTORY__POST_R3__ = render3InjectElementRef;
const SWITCH_ELEMENT_REF_FACTORY__PRE_R3__ = noop;
const SWITCH_ELEMENT_REF_FACTORY: typeof render3InjectElementRef =
    SWITCH_ELEMENT_REF_FACTORY__PRE_R3__;
