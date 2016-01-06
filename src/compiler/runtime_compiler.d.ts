import { Compiler, Compiler_ } from 'angular2/src/core/linker/compiler';
import { HostViewFactoryRef, HostViewFactoryRef_ } from 'angular2/src/core/linker/view_ref';
import { TemplateCompiler } from './template_compiler';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
export declare abstract class RuntimeCompiler extends Compiler {
    abstract compileInHost(componentType: Type): Promise<HostViewFactoryRef>;
    abstract clearCache(): any;
}
export declare class RuntimeCompiler_ extends Compiler_ implements RuntimeCompiler {
    private _templateCompiler;
    constructor(_templateCompiler: TemplateCompiler);
    compileInHost(componentType: Type): Promise<HostViewFactoryRef_>;
    clearCache(): void;
}
