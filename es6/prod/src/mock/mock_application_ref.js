import { ApplicationRef } from 'angular2/src/core/application_ref';
export class MockApplicationRef extends ApplicationRef {
    registerBootstrapListener(listener) { }
    registerDisposeListener(dispose) { }
    bootstrap(componentType, bindings) {
        return null;
    }
    get injector() { return null; }
    ;
    get zone() { return null; }
    ;
    dispose() { }
    tick() { }
    get componentTypes() { return null; }
    ;
}
//# sourceMappingURL=mock_application_ref.js.map