import {BaseException} from 'angular2/src/core/facade/exceptions';
import {ViewRef} from './view_ref';
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
export class ElementRef implements RenderElementRef {
  /**
   * @private
   *
   * Reference to the {@link ViewRef} that this `ElementRef` is part of.
   */
  parentView: ViewRef;


  /**
   * @private
   *
   * Index of the element inside the {@link ViewRef}.
   *
   * This is used internally by the Angular framework to locate elements.
   */
  boundElementIndex: number;
  /**
   * @private
   */
  constructor(parentView: ViewRef, boundElementIndex: number, private _renderer: Renderer) {
    this.parentView = parentView;
    this.boundElementIndex = boundElementIndex;
  }

  /**
   * @private
   */
  get renderView(): RenderViewRef { return this.parentView.render; }

  // TODO(tbosch): remove this once Typescript supports declaring interfaces
  // that contain getters
  // https://github.com/Microsoft/TypeScript/issues/3745
  set renderView(viewRef: RenderViewRef) { throw new BaseException('Abstract setter'); }

  /**
   * The underlying native element or `null` if direct access to native elements is not supported
   * (e.g. when the application runs in a web worker).
   *
   * <div class="callout is-critical">
   *   <header>Use with caution</header>
   *   <p>
   *    Use this api as the last resort when direct access to DOM is needed. Use templating and
   *    data-binding provided by Angular instead.
   *   </p>
   *   <p>
   *    Relying on direct DOM access creates tight coupling between your application and rendering
   *    layers which will make it impossible to separate the two and deploy your application into a
   *    web worker.
   *   </p>
   *   <!-- TODO: add info about custom renderers that should be used instead -->
   * </div>
   */
  get nativeElement(): any { return this._renderer.getNativeElementSync(this); }
}
