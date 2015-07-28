import {JsonpCmp} from './jsonp_comp';
import {bootstrap} from 'angular2/bootstrap';
import {jsonpInjectables} from 'http/http';

export function main() {
  bootstrap(JsonpCmp, [jsonpInjectables]);
}
