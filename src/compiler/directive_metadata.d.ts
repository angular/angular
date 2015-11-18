import { Type } from 'angular2/src/facade/lang';
import { ChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { LifecycleHooks } from 'angular2/src/core/linker/interfaces';
export declare class CompileTypeMetadata {
    runtime: Type;
    name: string;
    moduleUrl: string;
    isHost: boolean;
    constructor({runtime, name, moduleUrl, isHost}?: {
        runtime?: Type;
        name?: string;
        moduleUrl?: string;
        isHost?: boolean;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileTypeMetadata;
    toJson(): {
        [key: string]: any;
    };
}
export declare class CompileTemplateMetadata {
    encapsulation: ViewEncapsulation;
    template: string;
    templateUrl: string;
    styles: string[];
    styleUrls: string[];
    ngContentSelectors: string[];
    constructor({encapsulation, template, templateUrl, styles, styleUrls, ngContentSelectors}?: {
        encapsulation?: ViewEncapsulation;
        template?: string;
        templateUrl?: string;
        styles?: string[];
        styleUrls?: string[];
        ngContentSelectors?: string[];
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileTemplateMetadata;
    toJson(): {
        [key: string]: any;
    };
}
export declare class CompileDirectiveMetadata {
    static create({type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        dynamicLoadable?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: string[];
        outputs?: string[];
        host?: {
            [key: string]: string;
        };
        lifecycleHooks?: LifecycleHooks[];
        template?: CompileTemplateMetadata;
    }): CompileDirectiveMetadata;
    type: CompileTypeMetadata;
    isComponent: boolean;
    dynamicLoadable: boolean;
    selector: string;
    exportAs: string;
    changeDetection: ChangeDetectionStrategy;
    inputs: {
        [key: string]: string;
    };
    outputs: {
        [key: string]: string;
    };
    hostListeners: {
        [key: string]: string;
    };
    hostProperties: {
        [key: string]: string;
    };
    hostAttributes: {
        [key: string]: string;
    };
    lifecycleHooks: LifecycleHooks[];
    template: CompileTemplateMetadata;
    constructor({type, isComponent, dynamicLoadable, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        dynamicLoadable?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: {
            [key: string]: string;
        };
        outputs?: {
            [key: string]: string;
        };
        hostListeners?: {
            [key: string]: string;
        };
        hostProperties?: {
            [key: string]: string;
        };
        hostAttributes?: {
            [key: string]: string;
        };
        lifecycleHooks?: LifecycleHooks[];
        template?: CompileTemplateMetadata;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileDirectiveMetadata;
    toJson(): {
        [key: string]: any;
    };
}
export declare function createHostComponentMeta(componentType: CompileTypeMetadata, componentSelector: string): CompileDirectiveMetadata;
