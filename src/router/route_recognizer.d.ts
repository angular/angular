import { PathRecognizer, PathMatch } from './path_recognizer';
import { RouteDefinition } from './route_config_impl';
import { Url } from './url_parser';
import { ComponentInstruction } from './instruction';
/**
 * `RouteRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export declare class RouteRecognizer {
    names: Map<string, PathRecognizer>;
    auxRoutes: Map<string, PathRecognizer>;
    matchers: PathRecognizer[];
    redirects: Redirector[];
    config(config: RouteDefinition): boolean;
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     *
     */
    recognize(urlParse: Url): PathMatch[];
    recognizeAuxiliary(urlParse: Url): PathMatch;
    hasRoute(name: string): boolean;
    generate(name: string, params: any): ComponentInstruction;
}
export declare class Redirector {
    segments: string[];
    toSegments: string[];
    constructor(path: string, redirectTo: string);
    /**
     * Returns `null` or a `ParsedUrl` representing the new path to match
     */
    redirect(urlParse: Url): Url;
}
