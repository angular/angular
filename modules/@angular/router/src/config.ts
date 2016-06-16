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