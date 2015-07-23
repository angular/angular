import {JsonpCmp} from './jsonp_comp';
import {bootstrap} from 'angular2/bootstrap';
import {jsonpInjectables} from 'angular2/http';

export function main() {
  bootstrap(JsonpCmp, [jsonpInjectables]);
}
