import { AbstractRule, RouteRule, RouteMatch } from './rules';
import { RouteDefinition } from '../route_config/route_config_impl';
import { Url } from '../url_parser';
import { ComponentInstruction } from '../instruction';
/**
 * A `RuleSet` is responsible for recognizing routes for a particular component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export declare class RuleSet {
    rulesByName: Map<string, RouteRule>;
    auxRulesByName: Map<string, RouteRule>;
    auxRulesByPath: Map<string, RouteRule>;
    rules: AbstractRule[];
    defaultRule: RouteRule;
    /**
     * Configure additional rules in this rule set from a route definition
     * @returns {boolean} true if the config is terminal
     */
    config(config: RouteDefinition): boolean;
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
    private _assertNoHashCollision(hash, path);
    private _getRoutePath(config);
}
