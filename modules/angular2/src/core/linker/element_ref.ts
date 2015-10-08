import {BaseException, unimplemented} from 'angular2/src/core/facade/exceptions';
import {ViewRef, ViewRef_} from './view_ref';
import {RenderViewRef, RenderElementRef, Renderer} from 'angular2/src/core/render/api';

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
export abstract class ElementRef implements RenderElementRef {
  /**
   * @internal
   *
   * Reference to the {@link ViewRef} that this `ElementRef` is part of.
   */
  parentView: ViewRef;

  /**
   * @internal
   *
   * Index of the element inside the {@link ViewRef}.
   *
   * This is used internally by the Angular framework to locate elements.
   */
  boundElementIndex: number;

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
  get nativeElement(): any { return unimplemented(); };

  get renderView(): RenderViewRef { return unimplemented(); }
}

export class ElementRef_ extends ElementRef {
  constructor(public parentView: ViewRef,

              /**
               * Index of the element inside the {@link ViewRef}.
               *
               * This is used internally by the Angular framework to locate elements.
               */
              public boundElementIndex: number, private _renderer: Renderer) {
    super();
  }

  get renderView(): RenderViewRef { return (<ViewRef_>this.parentView).render; }
  set renderView(value) { unimplemented(); }
  get nativeElement(): any { return this._renderer.getNativeElementSync(this); }
}
