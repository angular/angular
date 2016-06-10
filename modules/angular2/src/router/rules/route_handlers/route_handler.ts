import {Type} from 'angular2/src/facade/lang';
import {RouteData} from '../../instruction';
import {ComponentFactory} from 'angular2/core';

export interface RouteHandler {
  componentType: Type | ComponentFactory;
  resolveComponentType(): Promise<any>;
  data: RouteData;
}
