import {JsonpCmp} from './jsonp_comp';
import {bootstrap} from 'angular2/bootstrap';
import {JSONP_BINDINGS} from 'http/http';

export function main() {
  bootstrap(JsonpCmp, [JSONP_BINDINGS]);
}
