import {Type} from '@angular/core';

export type RouterConfig = Route[];

export interface Route {
  path?: string;
  terminal?: boolean;
  component?: Type|string;
  outlet?: string;
  canActivate?: any[];
  canDeactivate?: any[];
  redirectTo?: string;
  children?: Route[];
}

export function validateConfig(config: RouterConfig): void {
  config.forEach(validateNode);
}

function validateNode(route: Route): void {
  if (!!route.redirectTo && !!route.children) {
    throw new Error(
        `Invalid configuration of route '${route.path}': redirectTo and children cannot be used together`);
  }
  if (!!route.redirectTo && !!route.component) {
    throw new Error(
        `Invalid configuration of route '${route.path}': redirectTo and component cannot be used together`);
  }
  if (route.path === undefined) {
    throw new Error(`Invalid route configuration: routes must have path specified`);
  }
  if (route.path.startsWith('/')) {
    throw new Error(`Invalid route configuration of route '/a': path cannot start with a slash`);
  }
}