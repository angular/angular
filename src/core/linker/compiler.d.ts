import { ProtoViewRef } from 'angular2/src/core/linker/view_ref';
import { ProtoViewFactory } from 'angular2/src/core/linker/proto_view_factory';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { CompiledHostTemplate } from 'angular2/src/core/linker/template_commands';
/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export declare abstract class Compiler {
    abstract compileInHost(componentType: Type): Promise<ProtoViewRef>;
    abstract clearCache(): any;
}
export declare class Compiler_ extends Compiler {
    private _protoViewFactory;
    constructor(_protoViewFactory: ProtoViewFactory);
    compileInHost(componentType: Type): Promise<ProtoViewRef>;
    private _createProtoView(compiledHostTemplate);
    clearCache(): void;
}
export declare function internalCreateProtoView(compiler: Compiler, compiledHostTemplate: CompiledHostTemplate): ProtoViewRef;
