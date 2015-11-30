import { Promise } from 'angular2/src/facade/async';
import { AbstractRecognizer, RouteRecognizer, RouteMatch } from './route_recognizer';
import { RouteDefinition } from './route_config_impl';
import { Url } from './url_parser';
import { ComponentInstruction } from './instruction';
/**
 * `ComponentRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export declare class ComponentRecognizer {
    names: Map<string, RouteRecognizer>;
    auxNames: Map<string, RouteRecognizer>;
    auxRoutes: Map<string, RouteRecognizer>;
    matchers: AbstractRecognizer[];
    defaultRoute: RouteRecognizer;
    /**
     * returns whether or not the config is terminal
     */
    config(config: RouteDefinition): boolean;
    private _assertNoHashCollision(hash, path);
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     */
    recognize(urlParse: Url): Promise<RouteMatch>[];
    recognizeAuxiliary(urlParse: Url): Promise<RouteMatch>[];
    hasRoute(name: string): boolean;
    componentLoaded(name: string): boolean;
    loadComponent(name: string): Promise<any>;
    generate(name: string, params: any): ComponentInstruction;
    generateAuxiliary(name: string, params: any): ComponentInstruction;
}
