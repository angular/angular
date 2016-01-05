import { Compiler, Compiler_ } from 'angular2/src/core/linker/compiler';
import { ProtoViewRef } from 'angular2/src/core/linker/view_ref';
import { ProtoViewFactory } from 'angular2/src/core/linker/proto_view_factory';
import { TemplateCompiler } from './template_compiler';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
export declare abstract class RuntimeCompiler extends Compiler {
}
export declare class RuntimeCompiler_ extends Compiler_ implements RuntimeCompiler {
    private _templateCompiler;
    constructor(_protoViewFactory: ProtoViewFactory, _templateCompiler: TemplateCompiler);
    compileInHost(componentType: Type): Promise<ProtoViewRef>;
    clearCache(): void;
}
