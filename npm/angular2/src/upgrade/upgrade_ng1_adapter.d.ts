import { Type } from 'angular2/core';
import * as angular from './angular_js';
export declare class UpgradeNg1ComponentAdapterBuilder {
    name: string;
    type: Type;
    inputs: string[];
    inputsRename: string[];
    outputs: string[];
    outputsRename: string[];
    propertyOutputs: string[];
    checkProperties: string[];
    propertyMap: {
        [name: string]: string;
    };
    linkFn: angular.ILinkFn;
    directive: angular.IDirective;
    $controller: angular.IControllerService;
    constructor(name: string);
    extractDirective(injector: angular.IInjectorService): angular.IDirective;
    private notSupported(feature);
    extractBindings(): void;
    compileTemplate(compile: angular.ICompileService, templateCache: angular.ITemplateCacheService, httpBackend: angular.IHttpBackendService): Promise<any>;
    static resolve(exportedComponents: {
        [name: string]: UpgradeNg1ComponentAdapterBuilder;
    }, injector: angular.IInjectorService): Promise<any>;
}
