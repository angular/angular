import {unimplemented} from 'angular2/src/facade/exceptions';
import {AppElement} from './element';
import {Injector} from 'angular2/src/core/di/injector';

/**
 * Represents a location in a View that has an injection, change-detection and render context
 * associated with it.
 *
 * An `ElementRef` is created for each element in the Template that contains a Directive, Component
 * or data-binding.
 *
 * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
 * element.
 */
export abstract class ElementRef {
  /**
   * The underlying native element or `null` if direct access to native elements is not supported
   * (e.g. when the application runs in a web worker).
   *
   * <div class="callout is-critical">
   *   <header>Use with caution</header>
   *   <p>
   *    Use this API as the last resort when direct access to DOM is needed. Use templating and
   *    data-binding provided by Angular instead. Alternatively you take a look at {@link Renderer}
   *    which provides API that can safely be used even when direct access to native elements is not
   *    supported.
   *   </p>
   *   <p>
   *    Relying on direct DOM access creates tight coupling between your application and rendering
   *    layers which will make it impossible to separate the two and deploy your application into a
   *    web worker.
   *   </p>
   * </div>
   */
  get nativeElement(): any { return unimplemented(); }
  /**
   * The injector at this element.
   */
  get injector(): Injector { return unimplemented(); }

  /**
   * The parent injector of the element.
   * Used for creating embedded views and host views.
   */
  get parentInjector(): Injector { return <Injector>unimplemented(); }
}

export class ElementRef_ implements ElementRef {
  constructor(private _element: AppElement) {}

  get internalElement(): AppElement { return this._element; }

  get nativeElement() { return this._element.nativeElement; }

  get injector(): Injector { return this._element.injector; }

  get parentInjector(): Injector { return this._element.parentInjector; }
}
