library angular2.src.core.linker.element_ref;

import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "element.dart" show AppElement;

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
abstract class ElementRef {
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
}

class ElementRef_ implements ElementRef {
  AppElement _appElement;
  ElementRef_(this._appElement) {}
  AppElement get internalElement {
    return this._appElement;
  }

  get nativeElement {
    return this._appElement.nativeElement;
  }
}
