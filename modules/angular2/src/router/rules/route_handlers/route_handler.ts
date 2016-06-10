import {RouteData} from '../../instruction';

export interface RouteHandler {
  componentType: any /*Type | ComponentFactory*/;
  resolveComponentType(): Promise<any>;
  data: RouteData;
}
