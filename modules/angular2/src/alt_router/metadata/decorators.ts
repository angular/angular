import {RoutesMetadata, RouteMetadata} from "./metadata";
import {makeDecorator} from '../core_private';
export interface RoutesFactory {
  (routes: RouteMetadata[]): any;
  new (routes: RouteMetadata[]): RoutesMetadata;
}
export var Routes: RoutesFactory = <RoutesFactory>makeDecorator(RoutesMetadata);
