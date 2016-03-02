import {OpaqueToken} from 'angular2/src/core/di/opaque_token';
import {CONST_EXPR} from 'angular2/src/facade/lang';

export const INTERPOLATE_REGEXP: OpaqueToken = CONST_EXPR(new OpaqueToken('interpolateRegexp'));

export var DEFAULT_INTERPOLATE_REGEXP = /\{\{([\s\S]*?)\}\}/g;
