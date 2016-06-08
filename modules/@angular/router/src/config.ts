import {Type} from '@angular/core';

export type RouterConfig = Route[];

export interface Route {
  index?: boolean;
  path?: string;
  component?: Type|string;
  outlet?: string;
  canActivate?: any[];
  canDeactivate?: any[];
  redirectTo?: string;
  children?: Route[];
}