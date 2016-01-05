import { HostViewFactoryRef } from 'angular2/src/core/linker/view_ref';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { HostViewFactoryRef_ } from 'angular2/src/core/linker/view_ref';
/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export declare abstract class Compiler {
    abstract compileInHost(componentType: Type): Promise<HostViewFactoryRef>;
    abstract clearCache(): any;
}
export declare class Compiler_ extends Compiler {
    compileInHost(componentType: Type): Promise<HostViewFactoryRef_>;
    clearCache(): void;
}
