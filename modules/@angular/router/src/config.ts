import {Type} from '@angular/core';

export type RouterConfig = Route[];

export interface Route {
  /**
   * Use `path: ''` instead.
   * @deprecated
   */
  index?: boolean;
  path?: string;
  terminal?: boolean;
  component?: Type|string;
  outlet?: string;
  canActivate?: any[];
  canDeactivate?: any[];
  redirectTo?: string;
  children?: Route[];
}