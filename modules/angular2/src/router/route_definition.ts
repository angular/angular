import {CONST, Type} from 'angular2/src/core/facade/lang';

export interface RouteDefinition {
  path: string;
  component?: Type | ComponentDefinition;
  loader?: Function;
  redirectTo?: string;
  as?: string;
  data?: any;
}

export interface ComponentDefinition {
  type: string;
  loader?: Function;
  component?: Type;
}
