import { Type } from 'angular2/src/facade/lang';
/**
 * Resolve a `Type` from a {@link ComponentMetadata} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export declare class ComponentUrlMapper {
    /**
     * Returns the base URL to the component source file.
     * The returned URL could be:
     * - an absolute URL,
     * - a path relative to the application
     */
    getUrl(component: Type): string;
}
export declare class RuntimeComponentUrlMapper extends ComponentUrlMapper {
    constructor();
    setComponentUrl(component: Type, url: string): void;
    getUrl(component: Type): string;
}
