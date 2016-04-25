import {Type} from '@angular/facade';
import {RouteData} from '../../instruction';

export interface RouteHandler {
  componentType: Type;
  resolveComponentType(): Promise<any>;
  data: RouteData;
}
