import {OpaqueToken} from 'angular2/di';
import {CONST_EXPR} from 'angular2/src/facade/lang';

export const appComponentRefToken: OpaqueToken = CONST_EXPR(new OpaqueToken('ComponentRef'));
export const appComponentTypeToken: OpaqueToken = CONST_EXPR(new OpaqueToken('RootComponent'));
