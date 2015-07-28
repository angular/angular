/// <reference path="../../../angular2/typings/rx/rx.d.ts" />

import {bootstrap} from 'angular2/bootstrap';
import {httpInjectables} from 'http/http';
import {HttpCmp} from './http_comp';

export function main() {
  bootstrap(HttpCmp, [httpInjectables]);
}
