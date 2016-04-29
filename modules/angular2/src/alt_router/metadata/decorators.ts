import {RoutesMetadata, RouteMetadata} from "./metadata";
import {makeDecorator} from 'angular2/src/core/util/decorators';
export interface RoutesFactory {
  (routes: RouteMetadata[]): any;
  new (routes: RouteMetadata[]): RoutesMetadata;
}
export var Routes: RoutesFactory = <RoutesFactory>makeDecorator(RoutesMetadata);
