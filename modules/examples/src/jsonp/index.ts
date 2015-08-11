/// <reference path="../../../angular2/typings/rx/rx.d.ts" />

import {bootstrap} from 'angular2/bootstrap';
import {JSONP_BINDINGS} from 'http/http';
import {JsonpCmp} from './jsonp_comp';

export function main() {
  bootstrap(JsonpCmp, [JSONP_BINDINGS]);
}
