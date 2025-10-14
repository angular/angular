import { R3Injector } from '../di/r3_injector';
import { Type } from '../interface/type';
import { ApplicationRef } from '../application/application_ref';
import { InjectionToken, Injector } from '../di';
import { InternalNgModuleRef, NgModuleRef } from '../linker/ng_module_factory';
/**
 * InjectionToken to control root component bootstrap behavior.
 *
 * This token is primarily used in Angular's server-side rendering (SSR) scenarios,
 * particularly by the `@angular/ssr` package, to manage whether the root component
 * should be bootstrapped during the application initialization process.
 *
 * ## Purpose:
 * During SSR route extraction, setting this token to `false` prevents Angular from
 * bootstrapping the root component. This avoids unnecessary component rendering,
 * enabling route extraction without requiring additional APIs or triggering
 * component logic.
 *
 * ## Behavior:
 * - **`false`**: Prevents the root component from being bootstrapped.
 * - **`true`** (default): Proceeds with the normal root component bootstrap process.
 *
 * This mechanism ensures SSR can efficiently separate route extraction logic
 * from component rendering.
 */
export declare const ENABLE_ROOT_COMPONENT_BOOTSTRAP: InjectionToken<boolean>;
export interface BootstrapConfig {
    platformInjector: Injector;
}
export interface ModuleBootstrapConfig<M> extends BootstrapConfig {
    moduleRef: InternalNgModuleRef<M>;
    allPlatformModules: NgModuleRef<unknown>[];
}
export interface ApplicationBootstrapConfig extends BootstrapConfig {
    r3Injector: R3Injector;
    rootComponent: Type<unknown> | undefined;
}
export declare function bootstrap<M>(moduleBootstrapConfig: ModuleBootstrapConfig<M>): Promise<NgModuleRef<M>>;
export declare function bootstrap(applicationBootstrapConfig: ApplicationBootstrapConfig): Promise<ApplicationRef>;
/**
 * Set the implementation of the module based bootstrap.
 */
export declare function setModuleBootstrapImpl(): void;
