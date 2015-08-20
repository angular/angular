import {JsonpCmp} from './jsonp_comp';
import {bootstrap} from 'angular2/bootstrap';
import {JSONP_BINDINGS} from 'angular2/http';

export function main() {
  bootstrap(JsonpCmp, [JSONP_BINDINGS]);
}
