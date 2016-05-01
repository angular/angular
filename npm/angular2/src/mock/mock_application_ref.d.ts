import { ApplicationRef } from 'angular2/src/core/application_ref';
import { Injector } from 'angular2/src/core/di';
import { Type } from 'angular2/src/facade/lang';
import { ComponentRef, ComponentFactory } from 'angular2/src/core/linker/component_factory';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
/**
 * A no-op implementation of {@link ApplicationRef}, useful for testing.
 */
export declare class MockApplicationRef extends ApplicationRef {
    registerBootstrapListener(listener: (ref: ComponentRef<any>) => void): void;
    registerDisposeListener(dispose: () => void): void;
    bootstrap<C>(componentFactory: ComponentFactory<C>): ComponentRef<C>;
    injector: Injector;
    zone: NgZone;
    run(callback: Function): any;
    waitForAsyncInitializers(): Promise<any>;
    dispose(): void;
    tick(): void;
    componentTypes: Type[];
}
