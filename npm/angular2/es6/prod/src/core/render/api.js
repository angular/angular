import { unimplemented } from 'angular2/src/facade/exceptions';
export class RenderComponentType {
    constructor(id, templateUrl, slotCount, encapsulation, styles) {
        this.id = id;
        this.templateUrl = templateUrl;
        this.slotCount = slotCount;
        this.encapsulation = encapsulation;
        this.styles = styles;
    }
}
export class RenderDebugInfo {
    get injector() { return unimplemented(); }
    get component() { return unimplemented(); }
    get providerTokens() { return unimplemented(); }
    get references() { return unimplemented(); }
    get context() { return unimplemented(); }
    get source() { return unimplemented(); }
}
export class Renderer {
}
/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 */
export class RootRenderer {
}
