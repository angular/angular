library angular2.src.core.linker.element_ref;

import "package:angular2/src/facade/exceptions.dart"
    show BaseException, unimplemented;
import "view_ref.dart" show ViewRef, ViewRef_;
import "package:angular2/src/core/render/api.dart"
    show RenderViewRef, RenderElementRef, Renderer;

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
abstract class ElementRef implements RenderElementRef {
  /**
   * @internal
   *
   * Reference to the [ViewRef] that this `ElementRef` is part of.
   */
  ViewRef parentView;
  /**
   * @internal
   *
   * Index of the element inside the [ViewRef].
   *
   * This is used internally by the Angular framework to locate elements.
   */
  num boundElementIndex;
  /**
   * The underlying native element or `null` if direct access to native elements is not supported
   * (e.g. when the application runs in a web worker).
   *
   * <div class="callout is-critical">
   *   <header>Use with caution</header>
   *   <p>
   *    Use this API as the last resort when direct access to DOM is needed. Use templating and
   *    data-binding provided by Angular instead. Alternatively you take a look at [Renderer]
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
  dynamic get nativeElement {
    return unimplemented();
  }

  RenderViewRef get renderView {
    return unimplemented();
  }
}

class ElementRef_ extends ElementRef {
  ViewRef parentView;
  num boundElementIndex;
  Renderer _renderer;
  ElementRef_(
      this.parentView,
      /**
               * Index of the element inside the [ViewRef].
               *
               * This is used internally by the Angular framework to locate elements.
               */
      this.boundElementIndex,
      this._renderer)
      : super() {
    /* super call moved to initializer */;
  }
  RenderViewRef get renderView {
    return ((this.parentView as ViewRef_)).render;
  }

  set renderView(value) {
    unimplemented();
  }

  dynamic get nativeElement {
    return this._renderer.getNativeElementSync(this);
  }
}
