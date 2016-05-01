import { RoutesMetadata, RouteMetadata } from "./metadata";
export interface RoutesFactory {
    (routes: RouteMetadata[]): any;
    new (routes: RouteMetadata[]): RoutesMetadata;
}
export declare var Routes: RoutesFactory;
