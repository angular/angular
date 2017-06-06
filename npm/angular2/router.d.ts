/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */
export { Router } from './src/router/router';
export { RouterOutlet } from './src/router/directives/router_outlet';
export { RouterLink } from './src/router/directives/router_link';
export { RouteParams, RouteData } from './src/router/instruction';
export { RouteRegistry, ROUTER_PRIMARY_COMPONENT } from './src/router/route_registry';
export * from './src/router/route_config/route_config_decorator';
export * from './src/router/route_definition';
export { OnActivate, OnDeactivate, OnReuse, CanDeactivate, CanReuse } from './src/router/interfaces';
export { CanActivate } from './src/router/lifecycle/lifecycle_annotations';
export { Instruction, ComponentInstruction } from './src/router/instruction';
export { OpaqueToken } from 'angular2/core';
export { ROUTER_PROVIDERS_COMMON } from 'angular2/src/router/router_providers_common';
export { ROUTER_PROVIDERS, ROUTER_BINDINGS } from 'angular2/src/router/router_providers';
/**
 * A list of directives. To use the router directives like {@link RouterOutlet} and
 * {@link RouterLink}, add this to your `directives` array in the {@link View} decorator of your
 * component.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *    // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
export declare const ROUTER_DIRECTIVES: any[];
