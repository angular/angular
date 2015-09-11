import {bootstrap} from 'angular2/bootstrap';
import {JSONP_BINDINGS} from 'angular2/http';
import {JsonpCmp} from './jsonp_comp';

export function main() {
  bootstrap(JsonpCmp, [JSONP_BINDINGS]);
}
