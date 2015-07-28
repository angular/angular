/// <reference path="../../../angular2/typings/rx/rx.d.ts" />

import {bootstrap} from 'angular2/bootstrap';
import {jsonpInjectables} from 'http/http';
import {JsonpCmp} from './jsonp_comp';

export function main() {
  bootstrap(JsonpCmp, [jsonpInjectables]);
}
