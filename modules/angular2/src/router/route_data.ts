import {OpaqueToken} from 'angular2/di';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';

export const ROUTE_DATA: OpaqueToken = CONST_EXPR(new OpaqueToken('routeData'));
