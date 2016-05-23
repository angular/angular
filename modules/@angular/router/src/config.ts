import { Type } from '@angular/core';

export type RouterConfig = Route[];

export interface Route {
  name: string;
  index?: boolean;
  path?: string;
  component: Type | string;
  outlet?: string;
  children?: Route[];
}